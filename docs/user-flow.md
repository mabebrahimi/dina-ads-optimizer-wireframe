# User Flow — Google Ads Waste and Opportunity Platform

This document defines the end-to-end user journey from login to execution.

## 1) Onboarding Flow (New Project)

1. User signs in via `login.html`.
2. User opens `#new-project`.
3. User completes Step 1 (Define success).
4. User completes Step 2 (Project context).
5. In Step 3, user can generate competitors with AI or add manually.
6. In Step 4, user can generate personas and intent profiles.
7. System creates the project and generates Campaign Blueprint.
8. User is routed to Dashboard.

## 2) Daily Decision Flow

1. User opens Dashboard.
2. User reviews Today’s brief for Waste/Tracking/Opportunity status.
3. User opens a priority item and moves to Insights/Campaign Detail.
4. User checks Why + Evidence.
5. If approved:
- Choose `How to do it` for manual execution
- Or choose `Apply for me` for delegated execution
6. Task is tracked in Action Plan until completion.

## 3) Insight Triage Flow

1. User opens Insights tab.
2. User sets Type/Severity/Sort filters.
3. User opens a high-priority campaign.
4. In Campaign Detail, user reviews scoped insights.
5. User opens `View evidence`:
- Waste -> Waste Detail
- Tracking -> Task Guide
- Opportunity -> Campaign Detail/Guide
6. User decides to add task, snooze, or dismiss (backend state model).

## 4) Action Execution Flow

1. User opens Action Plan.
2. User selects a task.
3. Path A (Manual):
- Open Task Guide
- Execute steps and copy/paste items
- Update task status
4. Path B (Apply for me):
- Open Task Apply
- Review change preview
- Confirm approval checkboxes
- Click Approve and Apply
- System executes mutations, logs audit trail, updates task status

## 5) Campaign Planning Flow

1. User opens Campaign Blueprint.
2. User reviews project context, personas, competitors, and active campaigns.
3. User reviews pre-campaign recommendations.
4. User validates blueprint table structure.
5. User chooses:
- Export CSV (Google Ads Editor flow)
- Create campaign (guide flow or delegated apply flow)

## 6) Competitor and Persona Learning Flow

1. User opens Competitors tab.
2. User reviews discovered competitors and positioning gaps.
3. User optionally runs `AI: Refresh competitors` or adds manual entries.
4. Output affects Blueprint and AI Chat context.

## 7) AI Chat Assistance Flow

1. User asks a natural-language question (for example budget allocation).
2. Chat retrieves project context + insight/task/evidence data.
3. Assistant returns an outcome-first answer with sources.
4. If execution is needed, response routes to a task/guide path.

## 8) Safety and Trust Flow (Mandatory)

1. No account change without explicit approval.
2. Exact preview before apply.
3. Full audit log after apply.
4. Raw evidence always accessible in detail views.

## 9) State Transitions (Summary)

- Insight: `open -> in_progress -> resolved` (or `dismissed/snoozed`)
- Task: `todo -> in_progress -> awaiting_approval -> done` (or `blocked/canceled`)
- Apply job: `queued -> running -> succeeded/failed/partial`

## 10) Failure Points and Expected Behavior

- Google Ads OAuth disconnected: show sync error state in dashboard/insights.
- Low data confidence: show low-confidence label; do not hide findings.
- Tracking ambiguity: route user to tracking fix guide before scaling spend.
- Apply failure: show error details and rollback option.
