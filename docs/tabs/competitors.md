# Competitors Tab

UI reference: `pages/competitors.html`.

## Tab Goal

- Show direct/indirect competitor context and messaging posture.
- Provide positioning risk/opportunity context for ad decisions.

## Important Data Source Note

This tab is primarily **not direct Google Ads reporting**. Data comes from:
- Project Context Agent
- Competitor Discovery Agent
- Persona Synthesis Agent
- Manual user input

Google Ads is optional here, mostly for supporting evidence (for example competitor-intent queries found in search terms).

## Field Dictionary

| UI Field | Backend Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| Competitor Name | `competitors[].name` | Competitor name | AI/Agent + user | N/A |
| Positioning | `competitors[].positioning` | Competitor messaging angle | AI/Agent | N/A |
| Risk | `competitors[].risk` | Strategic risk to your offer | AI/Agent | N/A |
| Opportunity | `competitors[].opportunity` | Differentiation opportunity | AI/Agent | N/A |
| Source (campaign/ad group) | `competitors[].source` | Scope transparency for why this competitor matters | Internal DB | If Ads-backed: `search_term_view` |
| Keywords | `competitors[].keywords[]` | Related keyword themes | AI + Google Ads + external search | `search_term_view.search_term` when available |
| Competitive Insights items | `competitiveInsights[]` | AI-generated gap summaries | AI/Agent | N/A |
| Add manually | `POST /api/competitors` | Add a competitor manually | User input | N/A |
| AI Refresh competitors | `POST /api/competitors/refresh` | Regenerate competitor set | AI/Agent pipeline | N/A |

## Suggested Data Contract

```json
{
  "competitors": [
    {
      "id": "cmp_flowsprint",
      "name": "FlowSprint",
      "positioning": "Fast onboarding setup",
      "risk": "Competes on speed",
      "opportunity": "Emphasize depth + customization",
      "intentType": "generic",
      "source": { "campaign": "Core Intent", "adGroup": "Onboarding" },
      "keywords": ["onboarding automation"]
    }
  ],
  "competitiveInsights": [
    {
      "title": "Messaging Gap: Speed vs Depth",
      "type": "Opportunity",
      "impact": "High"
    }
  ]
}
```

## When Google Ads Queries Are Useful

Use GAQL when you need evidence that competitor-intent traffic exists:

```sql
SELECT campaign.name, ad_group.name, search_term_view.search_term,
       metrics.clicks, metrics.conversions, metrics.cost_micros
FROM search_term_view
WHERE segments.date BETWEEN :start AND :end
  AND search_term_view.search_term LIKE '%competitor_brand%'
```

Store this as supporting evidence; do not replace competitor analysis with raw rows.

## Implementation Rules

- Competitor insights must be outcome-first (for example: “Competitor speed messaging is strong”).
- If a finding is Ads-evidence-backed, include campaign/ad group source.
- This tab should provide strategic context, not duplicate Waste findings.
