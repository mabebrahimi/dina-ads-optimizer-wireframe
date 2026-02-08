# Action Plan Tab

UI reference: `pages/action.html` + related pages `pages/task-guide.html`, `pages/task-apply.html` + logic in `taskData`/`hydrateTask`.

## Tab Goal

- Convert insights into executable tasks.
- Provide two execution paths per task: `How to do it` (manual) and `Apply for me` (delegated).

## Action Plan Table Fields

| UI Column | Backend Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| Task | `tasks.title` | Actionable task title | Internal DB | N/A |
| Type | `tasks.type` | Waste/Tracking/Opportunity | Internal DB (derived from insight) | N/A |
| Priority | `tasks.priority` | Execution priority | Internal DB | N/A |
| Expected impact | `tasks.expectedImpact` | Savings/leads estimate | Internal DB | Derived from analysis |
| Owner | `tasks.owner` | Responsible owner | Internal DB | N/A |
| Status | `tasks.status` | To do/In progress/Planned/etc. | Internal DB | N/A |
| How to do it | `taskGuideLink` | Manual guide route | Internal DB | N/A |
| Apply for me | `taskApplyLink` | Approval/apply route | Internal DB | Uses Google Ads mutate services |

## Task Guide Fields

| UI/ID | Field | Description | Source |
|---|---|---|---|
| `#guideTitle` | `task.title` | Task title | Internal DB |
| `#guideSummary` | `task.summary` | Why this task matters | Internal DB |
| `#guideSteps` | `task.steps[]` | Step-by-step flow in Google Ads UI | Guide Agent + rules |
| `#guideItems` | `task.items[]` | Copy/paste-ready action items | Internal DB + evidence |

## Apply for Me Fields

| UI/ID | Field | Description | Source |
|---|---|---|---|
| `#applyTitle` | `task.title` | Task title | Internal DB |
| `#applySummary` | `task.summary` | Change summary | Internal DB |
| `#applyChanges` | `task.changePreview[]` | Exact change preview | Internal DB |
| Approval checkboxes | `approval.confirmations[]` | User confirmations | User input |
| Approve & Apply | `POST /api/tasks/:id/approve-apply` | Execute approved change | Internal + Google Ads mutate |

## Task Type to Google Ads Mutation Mapping

1. Add negatives / research blocking:
- `SharedSetService` (create list)
- `SharedCriterionService` (add terms)
- `CampaignSharedSetService` (attach list)
- Or direct ad-group negatives via `AdGroupCriterionService`

2. Limit broad expansion:
- `AdGroupCriterionService` (pause/modify keyword criteria)

3. Geo/schedule/device adjustments:
- `CampaignCriterionService`

4. Budget reallocation:
- `CampaignBudgetService` + `CampaignService` when needed

5. Tracking fixes:
- `ConversionActionService` (counting method, primary/secondary)
- If tag-level fixes are required, implement in GTM/GA4 outside Google Ads API.

6. Bulk execution:
- `BatchJobService` for large change sets with audit logging

## Required Safe-Apply Contract

1. `GET apply-preview` must return the exact mutation payload.
2. No mutation can run without explicit user approval.
3. After apply:
- Persist results in `change_logs`.
- Update task status.
- If failed, log error details and rollback instructions.

## Example Apply Payload

```json
{
  "taskId": "negatives_18",
  "approval": {
    "confirmedAccountChange": true,
    "acceptedRisk": true
  },
  "executeAs": "batch_job"
}
```
