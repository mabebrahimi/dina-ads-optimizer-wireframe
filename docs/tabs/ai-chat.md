# AI Chat Tab

UI reference: `pages/ai-chat.html`.

## Tab Goal

- Answer user questions using full project/account context.
- Produce evidence-backed, decision-first responses instead of generic chat output.

## Field Dictionary

| UI/ID | Backend Field | Description | Source | Google Ads API |
|---|---|---|---|---|
| Chat history list | `conversations[]` | Saved conversation list | Internal DB | N/A |
| Current conversation | `messages[]` | User/assistant messages | Internal DB | N/A |
| Project context banner | `chatContext` | Project, budget, competitor/persona counts | Internal DB + Agents | Campaign/metric context from Ads data layer |
| `#chatInput` | `userPrompt` | User prompt | User input | N/A |
| Send | `POST /api/chat` | Chat completion call | LLM orchestration | Read-only retrieval from Ads-backed store |
| Clear conversation | `POST /api/chat/:id/clear` | Clear thread messages | Internal DB | N/A |
| Export conversation | `GET /api/chat/:id/export` | Export as markdown/pdf | Internal DB | N/A |

## Message Contract

```json
{
  "conversationId": "conv_123",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "...", "sources": [] }
  ]
}
```

## Required Retrieval Scope

- Insights + evidence by campaign/ad group.
- KPI windows (7/30/90 days).
- Task status + expected impact.
- Competitor/persona/blueprint context.

## Google Ads API Relationship

This tab has no direct mutations. It is retrieval-oriented:
- Pull metrics/search-term/keyword/geo context from internal data layer.
- If cache is stale/missing, ingestion can refresh using `GoogleAdsService.SearchStream`.

## Response Rules (Required)

- Responses must be outcome-first.
- Important claims must include campaign/ad group source references.
- If a change is suggested, route to a task/guide whenever possible.
- For tracking questions with insufficient data, explicitly state the gap.
