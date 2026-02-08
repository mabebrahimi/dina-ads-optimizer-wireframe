# Shared Data and API Specification

This document defines cross-tab data conventions so all tabs interpret fields consistently.

## 1) Data Source Categories

- `Google Ads API`: Direct data from the connected ads account.
- `Internal DB`: Normalized/computed backend data (aligned with `docs/sql-schema.md`).
- `AI/Agent`: Outputs from AI agents (personas, competitors, summaries, recommendations).
- `Manual/User Input`: Data provided directly by the user.

## 2) Core Google Ads Services to Use

- Reporting reads: `GoogleAdsService.SearchStream` with GAQL.
- Add/edit keywords and negatives at ad group scope: `AdGroupCriterionService`.
- Shared negative list management: `SharedSetService` + `SharedCriterionService` + `CampaignSharedSetService`.
- Location/schedule/device criteria: `CampaignCriterionService`.
- Campaign budget updates: `CampaignBudgetService`.
- Campaign/bidding configuration: `CampaignService`.
- RSA creation/updates: `AdGroupAdService`.
- Conversion action settings (for example Every/One): `ConversionActionService`.
- Bulk execution: `BatchJobService`.

## 3) Common GAQL Resources

- Structure/entities: `campaign`, `ad_group`, `ad_group_criterion`, `campaign_budget`.
- Performance metrics: `metrics.*` + `segments.date` + `segments.device`.
- Search terms: `search_term_view`.
- Keyword-level performance: `keyword_view` (or `ad_group_criterion` for keyword fields).
- Geo performance: `geographic_view` or `user_location_view`.
- Landing page performance: `landing_page_view`.
- Change history: `change_event`.

## 4) Required Data Rules

- Always convert `cost_micros` to account currency: `cost = cost_micros / 1_000_000`.
- Every insight must include `source.campaign` and, when applicable, `source.ad_group`.
- Dashboard and insight outputs must be outcome-first (conclusion before evidence).
- Confidence fields must be normalized to the `0..1` range.
- Tracking anomalies that require session-level analysis need GA4 data joins (Google Ads alone is not enough).

## 5) Suggested Internal API Contract

- `GET /api/dashboard`
- `GET /api/insights`
- `GET /api/insights/:id`
- `GET /api/campaigns/:campaignId`
- `GET /api/tasks`
- `GET /api/tasks/:taskId/guide`
- `POST /api/tasks/:taskId/apply-preview`
- `POST /api/tasks/:taskId/approve-apply`
- `GET /api/competitors`
- `POST /api/competitors/refresh`
- `GET /api/campaign-blueprint`
- `POST /api/campaign-blueprint/refresh`
- `POST /api/chat`

## 6) Safety and Trust

- Never run Google Ads mutations without explicit user approval.
- Change preview is mandatory before apply.
- Every applied change must be logged in `change_logs`.
- Raw evidence must remain accessible via drill-down views.
