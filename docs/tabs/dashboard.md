# Dashboard Tab

UI reference: `pages/dashboard.html` + logic: `assets/js/wireframe.js` (`renderDashboard`).

## Tab Goal

- Provide a fast, decision-first “Today’s brief”.
- Summarize waste/tracking/opportunity without forcing deep analysis.
- Route users quickly to Insights and Action Plan.

## Data Contract (Example)

```json
{
  "snapshot": {
    "spend30d": 14260,
    "leads30d": 286,
    "cpl30d": 49.9,
    "estimatedWaste30d": 1050,
    "estimatedWasteConfidence": 0.8,
    "trackingHealth": "high_risk",
    "wasteDrivers": ["High waste from low-intent search terms"]
  },
  "browse": {
    "items": [],
    "totals": {
      "wasteUsd30d": 1050,
      "opportunityLeads30d": 22,
      "trackingRisk": "High risk"
    }
  },
  "focusCampaigns": []
}
```

## Field Dictionary

| UI/ID | Backend Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| Spend (30d) | `snapshot.spend30d` | Total cost in last 30 days | Google Ads + Internal DB | `GoogleAdsService.SearchStream` on `campaign` with `metrics.cost_micros`, `segments.date` |
| Leads (30d) | `snapshot.leads30d` | Total primary conversions in last 30 days | Google Ads + Internal DB | `metrics.conversions` or `metrics.all_conversions` (project rule) |
| CPL (30d) | `snapshot.cpl30d` | `spend / leads` | Internal DB | Computed |
| `#dashTrackingHealth` | `snapshot.trackingHealth` | Tracking status (Healthy/Warnings/High risk) | Tracking Audit Agent + Internal DB | Conversion metrics + `ConversionActionService` for settings |
| `#dashKpiWaste` | `snapshot.estimatedWaste30d` | Total impact of Waste insights | Internal DB | Insight engine output (not direct raw GA read) |
| `#dashKpiWasteConf` | `snapshot.estimatedWasteConfidence` | Average confidence of Waste insights | Internal DB | Computed |
| `#dashKpiWasteWhy` | `snapshot.wasteDrivers[]` | Top waste drivers | Internal DB | N/A |
| `#dashTypeFilter` | `browse.type` | Decision type filter | UI state | N/A |
| `#dashLimitFilter` | `browse.limit` | Max items shown | UI state | N/A |
| `#dashFeedSummary` | `browse.summaryText` | Displayed count summary | Internal DB + UI | N/A |
| `#dashTotalsWaste` | `browse.totals.wasteUsd30d` | Waste total | Internal DB | Derived from insights |
| `#dashTotalsOpp` | `browse.totals.opportunityLeads30d` | Opportunity uplift total | Internal DB | Derived from insights |
| `#dashTotalsTrack` | `browse.totals.trackingRisk` | Overall tracking risk label | Internal DB | Derived from insights |
| `#dashTopDecisions` | `browse.items[]` | Decision list with source/evidence/action | Internal DB | Evidence from GAQL queries |
| `#dashFocusCampaigns` | `focusCampaigns[]` | Top campaigns to review | Internal DB | `campaign`, `ad_group`, metrics |
| Alerts & changes | `alerts[]` | Recent account changes with possible impact | Google Ads + Internal DB | `change_event` |

## Browse Decision Item Fields

| Field | Description | Source | API |
|---|---|---|---|
| `type` | Waste/Tracking/Opportunity | Internal DB (`insights.type`) | N/A |
| `severity` | Impact level | Internal DB | N/A |
| `confidence` | Model confidence | Internal DB | N/A |
| `title` | Outcome-first title | Internal DB | N/A |
| `impact` | `$ / 30d`, `+leads`, or risk | Internal DB | Partially derived from Google Ads metrics |
| `source.campaign`/`source.ad_group` | Source transparency | Internal DB (`insight_sources`) | `campaign`, `ad_group` |
| `evidence` | Evidence summary | Internal DB | `search_term_view`, `keyword_view`, `geographic_view`, etc. |
| `guideTask` | Link to Action Plan task | Internal DB (`tasks`) | N/A |

## Suggested Queries for Dashboard Assembly

1. Core KPI query:
```sql
SELECT campaign.name, metrics.cost_micros, metrics.conversions, segments.date
FROM campaign
WHERE segments.date BETWEEN :start AND :end
```

2. Waste evidence (search terms):
```sql
SELECT campaign.name, ad_group.name, search_term_view.search_term,
       metrics.clicks, metrics.conversions, metrics.cost_micros
FROM search_term_view
WHERE segments.date BETWEEN :start AND :end
```

3. Recent changes:
```sql
SELECT change_event.change_date_time, change_event.resource_type,
       change_event.change_resource_name, change_event.client_type
FROM change_event
WHERE change_event.change_date_time >= :since
```

## Implementation Rules

- Dashboard values should come from the insight store (cached/normalized), not raw live joins per page load.
- `Estimated waste` must be based only on root-cause Waste insights.
- If tracking is high risk, show a clear severity badge and direct path to guide/task.
- Dashboard is summary-only; full evidence must be available via drill-down pages.
