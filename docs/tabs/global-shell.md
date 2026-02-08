# Global Shell (Shared Across Tabs)

UI reference: `index.html`.

## Shared Fields

| UI/ID | Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| `#projectSelect` | `activeProjectId` | Active project selection | Internal DB | N/A |
| Last sync | `lastSyncAt` | Latest sync timestamp | Internal DB | Ingestion job status |
| `#dateRange` | `globalDateRange` | Report date window | UI state -> API filters | Applied to all GAQL queries |
| `#globalSearch` | `globalSearch` | Text search across insights/tasks | Internal DB/search | N/A |
| `#globalCampaignFilter` | `scope.campaign` | Campaign scope | Internal DB + UI | `campaign.name` |
| `#globalAdGroupFilter` | `scope.adGroup` | Ad group scope | Internal DB + UI | `ad_group.name` |
| `#scopeSummaryTag` | `scopeSummary` | Current scope summary | Internal DB + UI | N/A |

## Technical Rules

- Scope changes must update routing (`#campaign-detail&campaign=...`).
- `dateRange` must be enforced in every analytics endpoint.
- If campaign scope is `All campaigns`, ad group selector must be disabled.
