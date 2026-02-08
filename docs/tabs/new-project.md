# New Project Tab (Onboarding Wizard)

UI reference: `pages/new-project.html` + validation logic in `initWizards` (`assets/js/wireframe.js`).

## Tab Goal

- Capture baseline project context required by all agents.
- Produce reliable input for Competitor/Persona/Blueprint generation.

## Step 1: Define Success (Required)

| UI Field | Suggested Key | Description | Source | Google Ads API |
|---|---|---|---|---|
| Project Name | `project.name` | Project name | User input | N/A |
| Project Type | `project.type` | SaaS/App/Ecommerce/etc. | User input | N/A |
| Target Market | `project.targetMarket` | Geo target scope | User input | N/A |
| Monthly Budget | `project.monthlyBudget` | Initial ad budget | User input | N/A |
| Primary Success Metric | `project.primaryMetric` | Main business metric | User input | N/A |
| Launch Timeline | `project.timeline` | Launch timing expectation | User input | N/A |

## Step 2: Project Context (Required)

| UI Field | Key | Description | Source |
|---|---|---|---|
| Description textarea | `project.description` | Product, audience, differentiation description | User input |
| AI: Draft positioning summary | `project.positioningSummary` | Optional AI summary | AI/Agent |

## Step 3: Market Map (Optional)

| UI Field | Key | Description | Source | API |
|---|---|---|---|---|
| AI: Find competitors | `competitors[]` | Discover 3-5 competitors | Competitor Agent | External search + optional Ads evidence |
| Add competitor manually | `competitorsManual[]` | Manual competitor entry | User input | N/A |

## Step 4: Personas and Intent (Optional)

| UI Field | Key | Description | Source |
|---|---|---|---|
| AI: Create personas | `personas[]` | Buyer persona generation | Persona Agent |
| Persona cards | `personas[].pain/desire/searchBehavior` | Pain points, goals, search behavior | AI/Agent |

## Validation Rules

- Step 1 and Step 2 are required (`data-required`).
- Navigation to next step is blocked until required fields are valid.
- Validation errors are surfaced through `data-step-error`.

## Suggested Persisted Payload

```json
{
  "project": {
    "name": "Nova CRM",
    "type": "SaaS",
    "targetMarket": "United States",
    "monthlyBudget": 4000,
    "primaryMetric": "Qualified leads",
    "timeline": "2-4 weeks",
    "description": "..."
  },
  "competitors": [],
  "personas": []
}
```

## Google Ads Connection During Onboarding

- New projects may start before account connection.
- If an Ads account is already connected:
  - Sync campaign/ad-group registry (`GoogleAdsService.SearchStream` on `campaign`/`ad_group`).
  - Preload recent search terms (`search_term_view`) for baseline leak detection.
