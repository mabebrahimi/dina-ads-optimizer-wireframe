# Agents

This repository defines a multi-agent system for a **Google Ads Waste & Opportunity Intelligence Platform**.

The system connects to a user’s Google Ads account, analyzes performance data, identifies wasted spend and growth opportunities, and presents **decision-first insights** through a structured UX.

This is a **decision product**, not a reporting tool.

---

## 🧠 System Principles

All agents MUST follow these principles:

1. **Outcome first, data second**
   - Insights must state conclusions before showing evidence.
2. **Finding-first UX**
   - Titles describe outcomes, not raw data.
3. **Transparency**
   - Every insight must explicitly reference its source:
     Campaign name + Ad group name.
4. **No black box**
   - Raw data must always be accessible in detail views.
5. **Actionable by default**
   - Every insight must lead to a clear action:
     - Learn how to fix
     - Or allow the system to apply the change.

---

## 🤖 Agent Architecture

### 1. Project Context Agent
**Role:** Build context for analysis

**Responsibilities:**
- Parse user project description
- Identify business type and goals
- Store connected Google Ads account metadata
- Maintain campaign and ad group mapping

**Inputs:**
- User project description
- Connected Google Ads account structure

**Outputs:**
- Normalized project context
- Campaign and ad group registry

---

### 2. Competitor Discovery Agent
**Role:** Identify competitors using AI search

**Responsibilities:**
- Discover direct and indirect competitors
- Classify competitor intent (brand / generic / price-driven)
- Provide competitor context for insight interpretation

**Inputs:**
- Project context
- Industry keywords

**Outputs:**
- Competitor list
- Competitor intent clusters

---

### 3. Persona Synthesis Agent
**Role:** Generate user personas and intent models

**Responsibilities:**
- Generate realistic buyer personas
- Define intent categories:
  - Transactional
  - Commercial research
  - Informational
- Map personas to expected search behavior

**Inputs:**
- Project context
- Competitor data

**Outputs:**
- Persona profiles
- Intent-to-search mapping

---

### 4. Google Ads Data Ingestion Agent
**Role:** Retrieve and normalize Google Ads data

**Responsibilities:**
- Fetch performance data from Google Ads API
- Normalize metrics across campaigns and ad groups
- Preserve raw data for evidence views

**Inputs:**
- Google Ads OAuth connection
- Date range

**Outputs:**
- Normalized performance dataset
- Raw evidence tables

---

### 5. Waste Detection Agent
**Role:** Identify wasted spend using root-cause analysis

**Responsibilities:**
- Detect waste by **root cause**, not raw entities
- Supported root causes:
  - Research intent traffic
  - Broad match expansion leakage
  - Bad geography pockets
  - Schedule inefficiency
  - Device mismatch
- Estimate financial impact
- Assign confidence level

**Rules:**
- Never output raw search terms as primary findings
- Always group findings by root cause
- Always include campaign + ad group source

**Outputs:**
- Waste findings (finding-first format)
- Supporting evidence references

---

### 6. Tracking Audit Agent
**Role:** Validate conversion tracking integrity

**Responsibilities:**
- Detect broken or suspicious conversion actions
- Identify:
  - Double counting
  - Missing call tracking
  - Click/session mismatch
  - Sudden spikes or drops
- Explain why each issue matters

**Outputs:**
- Tracking health status
- Actionable audit findings

---

### 7. Opportunity Detection Agent
**Role:** Identify scalable growth opportunities

**Responsibilities:**
- Detect high-performing queries and segments
- Identify limiting factors:
  - Budget caps
  - Impression share loss
  - Rank limitations
- Estimate potential uplift

**Rules:**
- Opportunities must be outcome-driven
- Must reference campaign + ad group
- Must not overlap with waste findings

**Outputs:**
- Opportunity findings
- Expected impact estimates

---

### 8. Insight Prioritization Agent
**Role:** Rank findings by importance

**Responsibilities:**
- Prioritize insights based on:
  - Estimated impact
  - Confidence level
  - Risk
- Classify insights into:
  - Waste
  - Tracking
  - Opportunity

**Outputs:**
- Ordered insight list
- Decision routing for dashboard

---

### 9. Action Plan Agent
**Role:** Convert insights into executable tasks

**Responsibilities:**
- Translate insights into clear tasks
- Define scope:
  - Account
  - Campaign
  - Ad group
- Attach expected impact
- Attach required permissions

**Outputs:**
- Action plan items
- Task metadata

---

### 10. Guide & Education Agent
**Role:** Teach users how to implement fixes manually

**Responsibilities:**
- Generate step-by-step guides inside Google Ads UI
- Provide exact items (e.g. negative keyword lists)
- Match guide to campaign/ad group scope

**Outputs:**
- How-to instructions
- Copy/paste-ready data

---

### 11. Apply Changes Agent
**Role:** Execute approved changes on behalf of the user

**Responsibilities:**
- Present change preview
- Require explicit user approval
- Apply changes via Google Ads API
- Log all actions

**Rules:**
- No change without approval
- All actions must be auditable

**Outputs:**
- Applied changes
- Action logs

---

## 🔐 Safety & Trust Rules

- Never apply changes silently
- Always expose evidence
- Always allow manual execution
- Always log system actions

---

## 🎯 Final Goal

The agent system must help users answer one question clearly:

> **“Where is my Google Ads budget being wasted, why, and what should I do next?”**

The system must reduce time-to-decision, not overwhelm users with data.

---

