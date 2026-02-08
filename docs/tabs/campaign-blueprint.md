# Campaign Blueprint Tab

UI reference: `pages/campaign-blueprint.html` + logic: `hydrateCampaignBlueprint` and `CAMPAIGN_BLUEPRINT_CONTEXT`.

## Tab Goal

- Build a launch-ready campaign plan before execution.
- Transform project context + personas + competitors + active campaigns into an actionable blueprint.

## Field Dictionary

| UI/ID | Backend Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| `#blueprintProjectName` | `project.name` | Project name | User input | N/A |
| `#blueprintProjectType` | `project.type` | Business type | User input | N/A |
| `#blueprintProjectTarget` | `project.targetMarket` | Target market | User input | N/A |
| `#blueprintProjectBudget` | `project.monthlyBudget` | Monthly budget | User input | N/A |
| `#blueprintProjectMetric` | `project.primaryMetric` | Primary KPI | User input | N/A |
| `#blueprintPersonas` | `personas[]` | Persona chips | Persona Agent | N/A |
| `#blueprintPrimaryIntents` | `intentTargets` | Priority intent categories | Persona Agent | N/A |
| `#blueprintCompetitors` | `competitors[]` | Competitor chips | Competitor Agent | N/A |
| `#blueprintPositioningWedge` | `positioningWedge` | Recommended differentiation angle | AI/Agent | N/A |
| `#blueprintActiveCampaigns` | `activeCampaigns[]` | Existing campaigns considered to prevent overlap | Google Ads + Internal DB | `campaign`, `ad_group`, metrics |
| `#blueprintRecommendations` | `recommendations[]` | Pre-campaign checklist (why + do this) | AI/Agent + rules | May include Ads-backed evidence |
| `#blueprintBlueprintTable` | `blueprintRows[]` | Proposed campaign/ad group/match/guardrail structure | AI/Agent + rules | Decision output |

## Suggested Data Contract

```json
{
  "project": {
    "name": "Nimbus Clinics – UAE",
    "type": "Healthcare Services",
    "targetMarket": "UAE",
    "monthlyBudget": 8000,
    "primaryMetric": "Bookings"
  },
  "personas": ["Treatment seeker"],
  "competitors": ["Clinic A"],
  "activeCampaigns": [
    {
      "campaignId": "123",
      "name": "Core Services",
      "status": "ACTIVE",
      "note": "Tighten negatives"
    }
  ],
  "recommendations": [],
  "blueprintRows": []
}
```

## Google Ads Data Needed in This Tab

1. Active campaign inventory + status + budget:
```sql
SELECT campaign.id, campaign.name, campaign.status,
       campaign_budget.amount_micros
FROM campaign
```

2. Existing intent coverage to avoid overlap:
```sql
SELECT campaign.name, ad_group.name, ad_group_criterion.keyword.text,
       ad_group_criterion.keyword.match_type
FROM keyword_view
WHERE segments.date BETWEEN :start AND :end
```

3. Baseline leak risk for guardrails:
- Recent `search_term_view` data (for research-intent leakage patterns).

## Tab Actions and Apply APIs

- `Export CSV`: build Google Ads Editor-compatible export.
- `Create campaign`:
  - Manual flow: guide-only.
  - System-applied flow: `CampaignBudgetService`, `CampaignService`, `AdGroupService`, `AdGroupCriterionService`, `AdGroupAdService`.

## Implementation Rules

- This tab is decision/planning-first, not raw reporting.
- If active campaigns exist, overlap prevention must be explicit.
- Every recommendation must include: `title`, `outcome`, `why`, `doThis`.
