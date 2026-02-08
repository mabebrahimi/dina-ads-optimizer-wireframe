# How Dina Works Tab

UI reference: `pages/how-dina-works.html` + architecture reference: `agents.md`.

## Tab Goal

- Build user trust by explaining how the system works.
- Educate users on core analysis workflow, updates, and optimization guides.

## Sections and Fields

| UI Section | Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| Feature cards | `pipelineSteps[]` | End-to-end pipeline (ingestion to action) | Static + agent configuration | Conceptual |
| Recent System Updates | `systemUpdates[]` | Product changelog items | Internal release notes | N/A |
| Educational Guides | `guides[]` | Guide title + summary | Guide Agent + docs | Indirect |

## Suggested Data Contract

```json
{
  "pipelineSteps": [
    { "title": "Data Ingestion", "description": "..." }
  ],
  "systemUpdates": [
    { "date": "2026-01-28", "title": "Enhanced Waste Detection", "details": "..." }
  ],
  "guides": [
    { "id": "guide_tracking_setup", "title": "Setting Up Conversion Tracking" }
  ]
}
```

## Technical Notes

- This tab does not expose sensitive operational account data.
- It is suitable for long-duration caching.
- Update dates and guide links should come from backend-managed content, not hardcoded HTML.

## Google Ads API Relationship

- No direct API dependency in this UI.
- It should still reference real product APIs in explanatory copy (for example `GoogleAdsService.SearchStream` for ingestion and mutate services for apply).
