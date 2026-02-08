# Backend SQL Schema — Google Ads Waste & Opportunity Intelligence

This schema is tailored for the decision-first agents in `AGENTS.md`. It keeps findings transparent (campaign + ad group always referenced), keeps raw evidence accessible, and makes every insight actionable and auditable.

## Core Principles (mapped to agents)
- Outcome-first: insights store conclusions + impact up front; evidence links separately.
- Finding-first UX: `insights` table drives cards; evidence is drillable via junction tables.
- Transparency: `insight_sources` always points to `campaigns` / `ad_groups` + raw rows.
- Actionable: `tasks` and `approvals` are first-class, tied back to insights.
- No black box: raw ingested tables (`metrics_daily`, `search_terms`) are never lost or rolled up only.
- Auditability: `change_logs` records every applied change with payloads.

## High-Level Domain Model
- Multi-tenant workspaces → projects → connected Google Ads accounts.
- Campaign/ad group registry mirrors Google Ads IDs for consistent joins.
- Ingestion layer stores normalized metrics and granular evidence (search terms, segments).
- Insight layer groups waste/tracking/opportunity findings by root cause and links evidence.
- Action layer turns findings into tasks, guides, approvals, and applied changes.

## Table Design

### 1) Access & Context
```sql
CREATE TABLE users (
  id               BIGSERIAL PRIMARY KEY,
  email            CITEXT UNIQUE NOT NULL,
  name             TEXT,
  role             TEXT CHECK (role IN ('owner','admin','analyst','viewer')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workspaces (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  industry         TEXT,
  timezone         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workspace_members (
  workspace_id     BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id          BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role             TEXT CHECK (role IN ('owner','admin','analyst','viewer')),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE projects (
  id               BIGSERIAL PRIMARY KEY,
  workspace_id     BIGINT REFERENCES workspaces(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  business_type    TEXT,
  primary_goal     TEXT,   -- e.g., 'leads', 'calls', 'sales'
  description      TEXT,
  status           TEXT CHECK (status IN ('draft','active','paused')),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
```

### 2) Connections & Registry
```sql
CREATE TABLE google_ads_accounts (
  id                   BIGSERIAL PRIMARY KEY,
  project_id           BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  external_customer_id TEXT NOT NULL,
  account_name         TEXT,
  currency             TEXT,
  timezone             TEXT,
  oauth_credential_id  TEXT,       -- points to vault/secret manager
  connected_at         TIMESTAMPTZ,
  sync_status          TEXT,       -- 'ok','error','revoked'
  UNIQUE (project_id, external_customer_id)
);

CREATE TABLE campaigns (
  id               BIGSERIAL PRIMARY KEY,
  project_id       BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  google_ads_id    TEXT NOT NULL,
  name             TEXT NOT NULL,
  status           TEXT,
  objective        TEXT,
  network          TEXT,
  daily_budget     NUMERIC(14,2),
  start_date       DATE,
  end_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (project_id, google_ads_id)
);

CREATE TABLE ad_groups (
  id               BIGSERIAL PRIMARY KEY,
  campaign_id      BIGINT REFERENCES campaigns(id) ON DELETE CASCADE,
  google_ads_id    TEXT NOT NULL,
  name             TEXT NOT NULL,
  status           TEXT,
  match_strategy   TEXT,           -- broad/phrase/exact/mixed
  default_bid      NUMERIC(14,4),
  persona_id       BIGINT,         -- optional link to personas table
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campaign_id, google_ads_id)
);
```

### 3) Context Enrichment
```sql
CREATE TABLE personas (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  intent_category TEXT CHECK (intent_category IN ('transactional','commercial_research','informational')),
  description    TEXT,
  pain_points    TEXT,
  search_behaviors JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE competitors (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  domain         TEXT,
  intent_type    TEXT CHECK (intent_type IN ('brand','generic','price-driven','other')),
  notes          TEXT,
  discovered_by  TEXT,       -- agent or method
  confidence     NUMERIC(3,2),
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### 4) Ingestion (raw + normalized evidence)
```sql
CREATE TYPE metric_segment AS ENUM ('device','geo','hour','network','keyword_theme');

CREATE TABLE metrics_daily (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  campaign_id    BIGINT REFERENCES campaigns(id),
  ad_group_id    BIGINT REFERENCES ad_groups(id),
  date           DATE NOT NULL,
  impressions    BIGINT,
  clicks         BIGINT,
  cost_micros    BIGINT,
  conversions    NUMERIC(14,4),
  conversion_value NUMERIC(14,4),
  segment_type   metric_segment,
  segment_value  TEXT,          -- e.g., 'mobile', 'Dubai Marina', '13:00-14:00'
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE search_terms (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  campaign_id    BIGINT REFERENCES campaigns(id),
  ad_group_id    BIGINT REFERENCES ad_groups(id),
  date           DATE NOT NULL,
  query          TEXT NOT NULL,
  match_type     TEXT,
  impressions    BIGINT,
  clicks         BIGINT,
  cost_micros    BIGINT,
  conversions    NUMERIC(14,4),
  conversion_value NUMERIC(14,4),
  landing_page   TEXT,
  device         TEXT,
  geo            TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversions_raw (
  id               BIGSERIAL PRIMARY KEY,
  project_id       BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  google_conv_id   TEXT,
  name             TEXT,
  category         TEXT,          -- lead, call, sale, micro
  count            NUMERIC(14,4),
  value            NUMERIC(14,4),
  attribution_model TEXT,
  imported_from    TEXT,          -- ads tag, GA import, offline
  observed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

### 5) Insights (waste / tracking / opportunity)
```sql
CREATE TYPE insight_type AS ENUM ('Waste','Tracking','Opportunity','Alert');
CREATE TYPE waste_root_cause AS ENUM (
  'research_intent_traffic',
  'broad_match_leakage',
  'bad_geography_pocket',
  'schedule_inefficiency',
  'device_mismatch',
  'other'
);

CREATE TABLE insights (
  id               BIGSERIAL PRIMARY KEY,
  project_id       BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  type             insight_type NOT NULL,
  root_cause       waste_root_cause,      -- null for non-waste types
  title            TEXT NOT NULL,         -- outcome-first wording
  summary          TEXT NOT NULL,         -- why it matters
  severity         TEXT CHECK (severity IN ('High','Medium','Low')),
  impact_value     NUMERIC(14,2),         -- USD or lead count depending on impact_unit
  impact_unit      TEXT CHECK (impact_unit IN ('usd_per_30d','leads_per_30d','risk')),
  confidence       NUMERIC(4,2),          -- 0-1
  recommended      TEXT,                  -- headline action
  status           TEXT CHECK (status IN ('open','snoozed','dismissed','in_progress','resolved')) DEFAULT 'open',
  detected_at      TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE insight_sources (
  id             BIGSERIAL PRIMARY KEY,
  insight_id     BIGINT REFERENCES insights(id) ON DELETE CASCADE,
  campaign_id    BIGINT REFERENCES campaigns(id),
  ad_group_id    BIGINT REFERENCES ad_groups(id),
  evidence_table TEXT,           -- 'search_terms','metrics_daily', etc.
  evidence_row_id BIGINT,        -- link to raw row for drill-down
  note           TEXT
);

CREATE TABLE insight_metrics (
  id             BIGSERIAL PRIMARY KEY,
  insight_id     BIGINT REFERENCES insights(id) ON DELETE CASCADE,
  label          TEXT,
  value          TEXT
);
```

### 6) Action Plan, Guides, and Apply
```sql
CREATE TYPE task_scope AS ENUM ('account','campaign','ad_group');

CREATE TABLE tasks (
  id               BIGSERIAL PRIMARY KEY,
  project_id       BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  insight_id       BIGINT REFERENCES insights(id),
  title            TEXT NOT NULL,
  scope            task_scope NOT NULL,
  campaign_id      BIGINT REFERENCES campaigns(id),
  ad_group_id      BIGINT REFERENCES ad_groups(id),
  status           TEXT CHECK (status IN ('todo','in_progress','awaiting_approval','blocked','done','canceled')) DEFAULT 'todo',
  priority         TEXT CHECK (priority IN ('P1','P2','P3')),
  expected_impact  NUMERIC(14,2),
  expected_unit    TEXT CHECK (expected_unit IN ('usd_saved','leads_gained')),
  due_at           TIMESTAMPTZ,
  assignee_id      BIGINT REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_steps (
  id             BIGSERIAL PRIMARY KEY,
  task_id        BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  step_order     INT NOT NULL,
  description    TEXT NOT NULL,
  copy_payload   TEXT,          -- copy/paste-ready negatives, bid adjustments, etc.
  ui_path        TEXT           -- Google Ads navigation hint
);

CREATE TABLE approvals (
  id             BIGSERIAL PRIMARY KEY,
  task_id        BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
  requested_by   BIGINT REFERENCES users(id),
  requested_at   TIMESTAMPTZ DEFAULT now(),
  approved_by    BIGINT REFERENCES users(id),
  approved_at    TIMESTAMPTZ,
  status         TEXT CHECK (status IN ('pending','approved','rejected','expired')) DEFAULT 'pending',
  change_preview JSONB          -- exact changes the Apply agent will execute
);

CREATE TABLE change_logs (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  task_id        BIGINT REFERENCES tasks(id),
  google_change_id TEXT,        -- returned by Google Ads API
  action_type    TEXT,          -- e.g., add_negative_keyword, adjust_bid
  payload        JSONB,
  applied_by     BIGINT REFERENCES users(id),
  applied_at     TIMESTAMPTZ DEFAULT now(),
  status         TEXT CHECK (status IN ('succeeded','failed','partial')),
  error_message  TEXT
);
```

### 7) Jobs & Monitoring
```sql
CREATE TABLE sync_jobs (
  id             BIGSERIAL PRIMARY KEY,
  project_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  job_type       TEXT CHECK (job_type IN ('ingest_metrics','ingest_search_terms','refresh_schema','detect_insights')),
  started_at     TIMESTAMPTZ DEFAULT now(),
  finished_at    TIMESTAMPTZ,
  status         TEXT CHECK (status IN ('running','succeeded','failed','partial')),
  row_count      BIGINT,
  error_message  TEXT
);
```

## Indexing & Performance Notes
- `metrics_daily (project_id, date, campaign_id, ad_group_id, segment_type, segment_value)` btree for date-range scans.
- `search_terms (project_id, date, query)` gin trigram index for fuzzy search on queries.
- `insights (project_id, type, status)` for dashboard filters.
- `tasks (project_id, status, priority)` to drive action plan lists.
- Consider partitioning `metrics_daily` and `search_terms` by month for large accounts.

## Data Retention & Integrity
- Keep raw `search_terms` at least 90 days; aggregate older data into monthly rollups if needed.
- Enforce `campaigns`/`ad_groups` existence before writing insights (foreign keys keep transparency).
- Use `change_logs` as the single audit log; never delete rows—only append.

## How Agents Use This Schema
- Project Context Agent writes `projects`, `campaigns`, `ad_groups`, `personas`.
- Competitor Discovery Agent populates `competitors`.
- Google Ads Data Ingestion Agent fills `metrics_daily`, `search_terms`, `conversions_raw`.
- Waste Detection Agent writes `insights` (type Waste + root_cause) and `insight_sources`.
- Tracking Audit Agent writes `insights` of type Tracking with evidence rows.
- Opportunity Detection Agent writes `insights` of type Opportunity with impact units in leads.
- Action Plan Agent creates `tasks` and `task_steps`; Apply Changes Agent records `approvals` and `change_logs`.

## Quick Entity Relationship Outline
Workspace → Projects → Google Ads Accounts → Campaigns → Ad Groups  
Projects → Personas, Competitors  
Projects → Metrics/Terms → Insights → Tasks → Approvals → Change Logs  
Insights ↔ Insight Sources ↔ Raw Evidence (search_terms/metrics_daily)

## Recommended Extensions
- Add `alert_subscriptions(user_id, project_id, type)` for notifying on new high-severity waste.
- Add `scopes` table for reusable negative keyword lists or bid rules, referenced by tasks.
- Add `model_runs` table if ML scoring/intent classifiers are introduced.
