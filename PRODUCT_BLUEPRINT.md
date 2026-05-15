# AI-Driven CRM / Business OS Blueprint

## 1. Product Thesis

This product is not a classic CRM. It is an intelligent Business Operating System for service companies.

Core promise:

- Sell more without more admin
- Automate repetitive work
- Keep every customer relationship alive
- Give the team one calm place to run the company
- Turn fragmented business data into actions

Positioning:

- Apple-level restraint
- Linear-level speed
- Notion-level flexibility
- Stripe-level clarity
- Framer-level visual polish

North star feeling:

> "This system feels smarter than the business using it."

## 2. Product Principles

1. AI-first, not AI-added
2. Context over clutter
3. Actions over dashboards
4. Timeline over tables
5. Suggestions over manual digging
6. Calm interface, high capability
7. Every screen answers: what matters now?

## 3. Core Modules

Primary navigation:

1. Dashboard
2. Leads
3. Customers
4. Pipeline
5. Bookings
6. Tasks
7. Automation
8. Analytics
9. Conversations
10. AI Assistant
11. Team
12. Billing
13. Settings

Cross-cutting layers:

- Global search
- AI command layer
- Unified timeline
- Notifications
- Activity feed
- Workspace switcher

## 4. Information Architecture

### 4.1 System Model

The system revolves around four operating objects:

- People: leads, customers, team members
- Work: bookings, tasks, pipeline stages, automations
- Money: quotes, invoices, revenue events, subscriptions
- Intelligence: scores, summaries, risks, recommendations

### 4.2 Core Relationships

- A lead can become a customer
- A customer can have many conversations, bookings, invoices, notes, tasks, and opportunities
- A booking belongs to a customer and can be assigned to one or more team members
- A task can attach to any object
- An automation listens to events and performs actions
- AI insights can belong to leads, customers, bookings, conversations, and analytics views

## 5. UX Architecture

### 5.1 Main UX Philosophy

- Use cards instead of dense grids by default
- Use progressive disclosure for complexity
- Keep actions contextual and local
- Reserve tables for deep admin views only
- Prefer side panels, command palette, and overlays over full page context switches

### 5.2 Global Shell

- Left floating sidebar
- Sticky topbar with search and quick actions
- Main content canvas with generous spacing
- Right contextual panel on selected screens
- Universal command palette
- Floating AI assistant entry point

## 6. Global Layout

### 6.1 Sidebar

Behavior:

- Collapsible
- Floating glass panel
- Soft inner shadow
- Active item glow
- Tooltips in collapsed mode

Bottom area:

- User profile
- Notifications
- Workspace switcher

### 6.2 Topbar

Contains:

- Smart global search
- AI quick actions
- Create new button
- Live activity indicator
- Team/workspace context
- Notification center

Global quick actions:

- Add lead
- Add booking
- Create task
- Draft quote with AI
- Ask AI for summary
- Start automation

## 7. Page Blueprints

## 7.1 Dashboard

Purpose:

- Prioritize what needs attention
- Summarize business health
- Surface AI guidance

Layout:

```text
+----------------------------------------------------------------------------------+
| Greeting + Today Summary                      Search / AI Actions / Create       |
+----------------------------------------------------------------------------------+
| Revenue Snapshot     | Today's Focus         | Tasks Today                       |
+----------------------------------------------------------------------------------+
| Sales Flow           | Booking Overview      | Customer Health                   |
+---------------------------------------------------------------+------------------+
| Recent Activity Timeline                                        | AI Recommendations|
|                                                                 | Follow-ups       |
|                                                                 | Urgent Risks     |
+----------------------------------------------------------------------------------+
| Conversion | Retention | Recurring Revenue | Satisfaction | Team Pulse          |
+----------------------------------------------------------------------------------+
```

Sections:

- Smart greeting based on time, targets, workload, and priorities
- AI summary in plain business language
- "Today's focus" block with 3 to 5 concrete actions
- Revenue snapshot with trend context
- Customer health overview
- Active lead momentum
- Booking load and operational capacity
- Activity timeline
- AI recommendations panel

Key interactions:

- Hover opens quick actions
- KPI cards expand into detail drawers
- AI summary can turn into tasks, follow-ups, or automation suggestions

## 7.2 Leads

Purpose:

- Qualify, prioritize, and convert with minimal manual work

Views:

- Kanban pipeline
- Smart list
- Lead detail panel

Lead card content:

- Name / company
- Deal stage
- Temperature
- Estimated value
- Last contact
- Probability
- AI insight
- Next best action

Wireframe:

```text
+----------------------------------------------------------------------------------+
| Leads                                  Filters / Search / AI Segment            |
+----------------------------------------------------------------------------------+
| New             | Contacted       | Qualified       | Proposal       | Won       |
| [lead card]     | [lead card]     | [lead card]     | [lead card]    | [card]    |
| [lead card]     | [lead card]     | [lead card]     | [lead card]    | [card]    |
+----------------------------------------------------------------------------------+
| Selected Lead Drawer: Summary | Timeline | Messages | Tasks | AI                 |
+----------------------------------------------------------------------------------+
```

AI features:

- Qualification score
- Auto-generated follow-up suggestions
- Lead risk detection
- Missing data prompts
- Conversation sentiment

## 7.3 Customer Profile

Purpose:

- Be the heart of the platform
- Gather the entire relationship in one calm view

Header:

- Customer name
- Company
- Contact details
- Score
- Revenue generated
- Relationship health
- Last interaction

Sections:

- Timeline
- Conversations
- Bookings
- Invoices
- Notes
- Documents
- Opportunities
- Tasks
- AI summaries

Wireframe:

```text
+----------------------------------------------------------------------------------+
| Customer Header: Name / Company / Score / Revenue / Health / Quick Actions      |
+----------------------------------------------------------------------------------+
| AI Summary Card                                                                  |
+----------------------------------------------------------------------------------+
| Timeline Feed                                                    | Context Panel |
| - calls                                                            | Tasks        |
| - emails                                                           | Open deals   |
| - bookings                                                         | Risks        |
| - notes                                                            | Suggested    |
| - invoices                                                         | next steps   |
+----------------------------------------------------------------------------------+
| Conversations | Bookings | Invoices | Documents | Notes | Activity              |
+----------------------------------------------------------------------------------+
```

AI features:

- Summarize relationship
- Detect churn risk
- Suggest upsell or cross-sell
- Identify silence gaps
- Draft next message

## 7.4 Pipeline

Purpose:

- Visualize revenue flow cleanly

Core elements:

- Pipeline stages
- Weighted forecast
- Stage friction analysis
- AI deal coaching

Use:

- Large pipeline lanes
- Smooth drag/drop
- Forecast strip at top
- Deal health indicators

## 7.5 Bookings

Purpose:

- Manage operations without leaving the CRM context

Views:

- Day
- Week
- Month
- Team

Booking card:

- Customer
- Status
- Assigned employee
- Duration
- Notes
- AI recommendation

Layout:

```text
+----------------------------------------------------------------------------------+
| Booking Calendar                           Day / Week / Month / Team            |
+----------------------------------------------------------------------------------+
| Calendar Canvas                                                    | Side Panel  |
| Drag/drop bookings                                                 | Route       |
| Team schedule                                                      | Capacity    |
| Availability                                                       | Conflicts   |
+----------------------------------------------------------------------------------+
| Customer self-booking settings / reminders / recurring rules                       |
+----------------------------------------------------------------------------------+
```

AI features:

- Optimal assignment
- Reminder timing
- Route optimization
- Capacity alerts
- Reschedule suggestions

## 7.6 Tasks

Purpose:

- Show tasks in context, never as isolated admin records

Views:

- Today
- My tasks
- Team tasks
- Context tasks by customer/lead/booking

Task metadata:

- Linked entity
- Priority
- Deadline
- Assignee
- Suggested by AI or manual

## 7.7 Automation

Purpose:

- Give service companies simple power automation

Pattern:

- Trigger -> Conditions -> Actions

Wireframe:

```text
+----------------------------------------------------------------------------------+
| Automation Builder                                                                |
+----------------------------------------------------------------------------------+
| Trigger        ->     Conditions       ->        Actions                          |
| New lead              No reply 3 days            Send follow-up                   |
| Missed booking        VIP customer               Create task                      |
| Invoice paid          First booking              Ask for review                   |
+----------------------------------------------------------------------------------+
| AI Suggestion Panel: "You are losing leads after quote stage"                    |
| Suggested automation: "Send follow-up after 48h + notify owner"                  |
+----------------------------------------------------------------------------------+
```

## 7.8 Analytics

Purpose:

- Tell the story of the business, not just numbers

Metrics:

- Revenue
- Retention
- Lifetime value
- Conversion
- Lost customers
- Top customers
- Employee performance
- Booking flow

Rules:

- Use cinematic charts
- Keep one insight per card
- Always include AI interpretation
- Show trend, reason, and action

## 7.9 Conversations

Purpose:

- Unified inbox with customer context

Channels:

- Email
- SMS
- WhatsApp
- Instagram
- Messenger

Layout:

```text
+----------------------------------------------------------------------------------+
| Conversation List         | Thread                                | Context      |
+----------------------------------------------------------------------------------+
| customer + channel        | messages                              | customer      |
| unread state              | smart reply chips                     | history       |
| sentiment                 | AI summary                            | bookings      |
| priority                  | quick actions                         | invoices      |
+----------------------------------------------------------------------------------+
```

## 7.10 AI Assistant

Purpose:

- Be the operational brain of the platform

Modes:

- Chat
- Command
- Analyst
- Writer
- Operator

Use cases:

- Write quote
- Draft follow-up
- Summarize customer
- Analyze revenue drop
- Build task list
- Suggest automation
- Detect churn risk

Behavior:

- Context-aware by page
- Can read selected customer or lead
- Can transform outputs into tasks, messages, automations, or notes

## 8. Wireframe Navigation Flow

### 8.1 Primary User Journey

1. Open dashboard
2. Review AI summary and today's focus
3. Jump into urgent lead or customer
4. Send AI-assisted follow-up
5. Confirm bookings and tasks
6. Review business performance
7. Let automation run the rest

### 8.2 Lead to Revenue Flow

1. New lead enters system
2. AI scores and qualifies
3. Automation assigns owner and sends first message
4. Lead moves through pipeline
5. Booking scheduled
6. Booking completed
7. Invoice sent and paid
8. AI asks for review or suggests upsell

## 9. Component Hierarchy

### 9.1 App Shell

- `AppShell`
- `Sidebar`
- `SidebarNavItem`
- `Topbar`
- `GlobalSearch`
- `CommandPalette`
- `NotificationCenter`
- `WorkspaceSwitcher`
- `LiveActivityIndicator`
- `AIAssistantDock`

### 9.2 Dashboard

- `DashboardGreeting`
- `AISummaryCard`
- `FocusCard`
- `RevenueSnapshotCard`
- `TaskAgendaCard`
- `CustomerHealthCard`
- `BookingOverviewCard`
- `SalesFlowCard`
- `ActivityTimeline`
- `RecommendationPanel`
- `MetricInsightCard`

### 9.3 CRM Objects

- `LeadCard`
- `LeadDrawer`
- `CustomerHeader`
- `CustomerTimeline`
- `ConversationThread`
- `BookingCard`
- `TaskCard`
- `AutomationNode`
- `InsightBadge`
- `EntityScoreRing`

### 9.4 Shared Components

- `GlassPanel`
- `FloatingCard`
- `MetricCard`
- `EmptyState`
- `SkeletonLoader`
- `SegmentedControl`
- `StatPill`
- `ContextDrawer`
- `ActionBar`
- `FilterBar`

## 10. Design System

### 10.1 Visual Tone

- Premium dark mode first
- Large breathing space
- Soft depth
- Limited accent use
- Minimal borders

### 10.2 Color Tokens

Suggested tokens:

- `bg.base`: `#0B0F14`
- `bg.surface`: `#101722`
- `bg.elevated`: `#131C29`
- `bg.glass`: `rgba(255,255,255,0.06)`
- `text.primary`: `#F5F7FB`
- `text.secondary`: `#94A3B8`
- `text.muted`: `#64748B`
- `accent.blue`: `#38BDF8`
- `accent.cyan`: `#22D3EE`
- `accent.violet`: `#8B5CF6`
- `success`: `#22C55E`
- `warning`: `#F59E0B`
- `danger`: `#EF4444`

### 10.3 Typography

- Headings: `Inter Tight` or `Satoshi`
- Body: `Inter`
- Numeric data: tabular numerals enabled

Scale:

- Display: 40 to 56
- H1: 32
- H2: 24
- H3: 20
- Body: 14 to 16
- Caption: 12

### 10.4 Spacing

- Base unit: 4px
- Common rhythm: 8, 12, 16, 20, 24, 32
- Cards use 20 to 24 padding
- Screen gutters use 24 desktop / 16 tablet / 12 mobile

### 10.5 Radius and Depth

- Small: 10px
- Medium: 16px
- Large: 24px
- XL panels: 28px

Shadow style:

- Soft blur
- Low contrast
- Slight inner glow on active states

### 10.6 Motion

Motion language:

- Fast but calm
- Physics-inspired
- No flashy movement

Examples:

- Card hover: 140ms
- Page transition: 220ms
- Drawer open: spring, medium stiffness
- Skeleton shimmer: subtle only

Framer Motion usage:

- Layout transitions
- Shared element transitions
- Animated filter state changes
- Staggered dashboard reveal

## 11. Interaction Patterns

### 11.1 Microinteractions

- Hover glow on active cards
- Subtle button scale on press
- Live save indicators
- Smooth tab transitions
- AI typing states
- Quick action chips

### 11.2 Empty States

Empty states must feel useful, not dead.

Examples:

- "No leads yet" -> add lead, import CSV, let AI build outreach
- "No bookings this week" -> create availability, enable self-booking
- "No automation active" -> show one-click starter recipes

### 11.3 Progressive Disclosure

- Level 1: essential summary
- Level 2: drawer details
- Level 3: full object page
- Level 4: advanced controls/settings

## 12. Responsive Behavior

### 12.1 Desktop

- Full sidebar
- Multi-column layouts
- Right insight panel visible

### 12.2 Tablet

- Compact sidebar
- Two-column dashboard
- Slide-over panels replace fixed right rail

### 12.3 Mobile

- Bottom navigation for primary modules
- Search and create pinned to top
- Customer and lead detail use stacked cards
- AI assistant available as bottom sheet
- Calendar uses agenda-first mode

## 13. Onboarding Flow

### 13.1 First-Run Setup

1. Create workspace
2. Select industry and company type
3. Connect email/calendar
4. Import leads/customers
5. Invite team
6. Configure booking rules
7. Enable AI assistant
8. Launch first automation

### 13.2 Guided Activation

Early wins:

- Add first 20 contacts
- Create first booking flow
- Send first AI-generated follow-up
- Build first automation recipe
- Review first AI insights report

## 14. AI Layer Design

### 14.1 AI Surfaces

- Global AI assistant
- Embedded summaries
- Predictive scoring
- Recommendation cards
- Generative writing tools
- Analytics explanations

### 14.2 AI Jobs

- Summarization
- Classification
- Extraction
- Lead scoring
- Churn detection
- Next-best-action recommendations
- Draft generation
- Workflow suggestions

### 14.3 Guardrails

- Human approval on outbound communication by default
- Explain why a recommendation is made
- Preserve source references where possible
- Allow workspace-level AI preferences

## 15. SaaS Technical Architecture

### 15.1 Stack

- Frontend: Next.js + TypeScript + Tailwind + Framer Motion + shadcn/ui
- Backend: Node.js + PostgreSQL + Prisma
- Auth: Clerk or Auth.js
- Realtime: WebSockets or Supabase Realtime / Pusher style layer
- AI: OpenAI integration with job queue
- Storage: object storage for files and documents

### 15.2 Architecture Pattern

- Multi-tenant SaaS architecture
- API route layer or dedicated backend service
- Event-driven automation engine
- Background worker for AI and long-running jobs
- Realtime notification layer

### 15.3 Recommended Services

- `web`: Next.js application
- `api`: business logic and internal APIs
- `worker`: AI jobs, automation jobs, message dispatch
- `realtime`: websocket gateway
- `scheduler`: reminders, recurring jobs, SLA checks

## 16. Multi-Tenant Data Model

### 16.1 Core Tenant Model

- `Workspace`
- `User`
- `Membership`
- `Role`
- `Permission`

### 16.2 CRM Model

- `Lead`
- `LeadStage`
- `LeadScore`
- `Customer`
- `Contact`
- `Opportunity`
- `Activity`
- `Note`
- `Document`

### 16.3 Operations Model

- `Booking`
- `BookingAssignment`
- `AvailabilityRule`
- `Task`
- `TaskLink`
- `Reminder`

### 16.4 Communication Model

- `Conversation`
- `ConversationParticipant`
- `Message`
- `ChannelAccount`
- `MessageTemplate`

### 16.5 Revenue Model

- `Quote`
- `Invoice`
- `Payment`
- `Subscription`
- `RevenueEvent`

### 16.6 Intelligence Model

- `AIInsight`
- `AISummary`
- `RiskSignal`
- `Recommendation`
- `Automation`
- `AutomationRun`
- `AutomationLog`

## 17. Example Prisma-Oriented Schema Structure

```text
Workspace
  id
  name
  slug
  plan
  createdAt

User
  id
  email
  name
  imageUrl

Membership
  id
  workspaceId
  userId
  role

Lead
  id
  workspaceId
  companyName
  contactName
  email
  phone
  stageId
  estimatedValue
  temperature
  aiScore
  lastContactAt
  ownerId

Customer
  id
  workspaceId
  companyName
  primaryContactId
  healthScore
  totalRevenue
  status

Booking
  id
  workspaceId
  customerId
  startsAt
  endsAt
  status
  assignedTeamMemberId

Task
  id
  workspaceId
  title
  status
  priority
  dueAt
  assigneeId
  relatedType
  relatedId

Conversation
  id
  workspaceId
  customerId
  channel
  sentiment

Message
  id
  conversationId
  direction
  body
  sentAt

Automation
  id
  workspaceId
  name
  triggerType
  isActive

AIInsight
  id
  workspaceId
  entityType
  entityId
  type
  title
  summary
  confidence
```

## 18. Realtime and Event System

Key events:

- lead.created
- lead.stage_changed
- customer.updated
- booking.created
- booking.missed
- invoice.paid
- task.overdue
- conversation.message_received
- ai.insight_created

Realtime surfaces:

- Notifications
- Live activity indicator
- Conversation updates
- Calendar changes
- Team assignments
- AI recommendation refresh

## 19. Security and Enterprise Readiness

- Tenant isolation at every query
- Row-level authorization rules
- Audit logs
- Encryption in transit and at rest
- Role-based access
- SSO later phase
- Consent and AI data usage controls

## 20. Implementation Roadmap

### Phase 1: Premium Core MVP

- App shell
- Auth
- Workspace model
- Dashboard
- Leads
- Customers
- Tasks
- Basic bookings
- AI summaries
- Global search

### Phase 2: Operational Intelligence

- Unified conversations
- Automation builder
- Analytics layer
- AI drafting
- Realtime notifications

### Phase 3: Business OS Expansion

- Billing and payments
- Customer portal
- Advanced forecasting
- Churn prediction
- Team performance intelligence

## 21. MVP Build Order for Engineering

1. Design system and app shell
2. Auth and multi-tenant foundation
3. CRM entities and timeline engine
4. Dashboard and customer profile
5. Leads and pipeline
6. Tasks and bookings
7. AI assistant and summaries
8. Automation engine
9. Conversations
10. Analytics

## 22. First Screen Success Criteria

When the user opens the product for the first time, they should immediately understand:

- What needs attention today
- Which customers or leads matter most
- What the AI recommends
- Where money is moving
- What to do next in one click

## 23. Product Summary

This system should feel like a calm, intelligent cockpit for running a service business.

Not a database.
Not a spreadsheet.
Not a legacy CRM.

It should feel like:

- a business assistant
- a customer relationship brain
- an operating system for growth

