# Insights Tab

UI reference: `pages/insights.html` + `pages/campaign-detail.html` + logic: `renderInsightsByCampaign`, `renderCampaignDetailInsights`.

## Tab Goal

- Present findings at campaign level (not raw row reporting).
- Prioritize by Impact, Confidence, or Newest.
- Provide direct paths to evidence and Action Plan.

## Field Dictionary (Main Insights Page)

| UI/ID | Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| `#insightsTypeFilter` | `filters.type` | Waste/Tracking/Opportunity/Alerts | UI state | N/A |
| `#insightsSeverityFilter` | `filters.severity` | High/Medium/Low | UI state | N/A |
| `#insightsSortFilter` | `filters.sort` | Impact/Confidence/Newest | UI state | N/A |
| `#insightsSummaryLine` | `summaryLine` | Campaign count + active scope/filters | Internal DB + UI | N/A |
| `#campaignsList` | `campaignCards[]` | Campaign cards | Internal DB | Built from GA-derived analytics |
| Card: Campaign Name | `campaignCards[].campaignName` | Campaign name | Google Ads + Internal DB | `campaign.name` |
| Card: Status | `campaignCards[].status` | Needs attention/Growth opportunity/etc. | Internal DB | N/A |
| Card: Spend/Leads/CPL | `campaignCards[].kpi` | 30-day KPIs | Google Ads + Internal DB | `metrics.cost_micros`, `metrics.conversions` |
| Card: Potential improvement | `campaignCards[].potential` | Save/gain estimate | Internal DB | Derived from insight impact |
| Card: Counts | `campaignCards[].counts` | Insight count by severity | Internal DB | N/A |

## Insight Object Contract

```json
{
  "id": "cs_research_terms",
  "type": "Waste",
  "severity": "High",
  "title": "High waste from low-intent search terms",
  "impact": "$640 / 30d",
  "impactScore": 640,
  "confidence": 0.86,
  "source": { "campaign": "Core Services", "adGroup": "Filler – Generic" },
  "why": "...",
  "recommended": "...",
  "metrics": [{ "label": "Spend", "value": "$640" }],
  "evidenceLink": { "page": "waste-detail", "params": { "item": "term_what_is_filler" } },
  "guideTask": "negatives_18",
  "createdAt": 1738100000
}
```

## Campaign Detail Fields (Connected to Insights)

| UI/ID | Field | Description | Source | API |
|---|---|---|---|---|
| `#campaignDetailTitle` | `campaignScopeLabel` | Campaign or campaign+ad group label | Internal DB | `campaign.name`, `ad_group.name` |
| `#campaignDetailStatus` | `status` | Operational status | Internal DB | N/A |
| `#campaignDetailSummary` | `summary` | Outcome-first summary | Internal DB | N/A |
| `#campaignKpiSpend` | `kpi.spend30d` | 30-day spend | Google Ads | `metrics.cost_micros` |
| `#campaignKpiLeads` | `kpi.leads30d` | 30-day conversions | Google Ads | `metrics.conversions` |
| `#campaignKpiCpl` | `kpi.cpl30d` | Cost per lead | Internal DB | Computed |
| `#campaignLinePath`/`#campaignLineDots` | `trend[]` | 7-day trend line | Google Ads + Internal DB | `segments.date` + metrics |
| `#campaignInsightsList` | `insights[]` | Detailed insight cards for scope | Internal DB | Evidence from GAQL |

## API Mapping by Insight Type

1. Waste (intent mismatch, broad leakage):
- `search_term_view`, `keyword_view`, `ad_group_criterion`.

2. Opportunity (rank/budget constraints):
- `metrics.search_impression_share`, `metrics.search_rank_lost_impression_share`, `metrics.search_budget_lost_impression_share`.

3. Tracking:
- Google Ads conversion metrics + `conversion_action` settings.
- For click/session mismatch, GA4 Data API join is required.

## Suggested GAQL Queries

```sql
-- Campaign/ad group KPI baseline
SELECT campaign.id, campaign.name, ad_group.id, ad_group.name,
       metrics.cost_micros, metrics.conversions, metrics.clicks,
       segments.date
FROM ad_group
WHERE segments.date BETWEEN :start AND :end
```

```sql
-- Impression share constraints for opportunities
SELECT campaign.name, ad_group.name,
       metrics.search_impression_share,
       metrics.search_rank_lost_impression_share,
       metrics.search_budget_lost_impression_share,
       metrics.conversions
FROM keyword_view
WHERE segments.date BETWEEN :start AND :end
```

## Implementation Rules

- Primary findings must map to root causes (not just raw entities).
- `source.campaign` and `source.ad_group` are mandatory except true account-wide findings.
- Sorting must be deterministic and stable.
- Insight card actions must route as follows:
  - `View evidence` -> Waste Detail
  - `How to fix` -> Task Guide
  - `Add to Action Plan` -> Action Plan
