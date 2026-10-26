---
title: H4T Xpress
period: "2026"
context: Information Systems Analysis and Design course, UEL
team: 5
status: live
stack: [FastAPI, React, TypeScript, PostgreSQL, WebSocket, Docker, OSRM, Playwright]
cover: /images/h4t-xpress/hub-dashboard.webp
links:
  - label: Live app
    href: https://h4t-xpress.vercel.app
  - label: Source code
    href: https://github.com/thienAG4/h4t-xpress
  - label: API docs
    href: https://h4t-api.onrender.com/api/docs
liveDemo:
  base: https://h4t-xpress.vercel.app
  warmup: https://h4t-xpress.vercel.app/api/v1/health
  note: Each tab signs you in with a shared demo account. The free server sleeps when idle, so the first load can take up to a minute.
  roles:
    - id: hub
      label: Hub manager
      path: /demo/hub
      device: desktop
      blurb: Incidents arrive in real time. Classify them, then reroute the driver or hand the parcels to someone else.
      poster: /images/h4t-xpress/hub-dashboard.webp
    - id: driver
      label: Driver
      path: /demo/driver
      device: phone
      blurb: Go online, accept an offer before the countdown ends, follow the route and report an incident with a photo.
      poster: /images/h4t-xpress/driver-route.webp
    - id: executive
      label: Executive
      path: /demo/executive
      device: desktop
      blurb: Success and on-time rates, failure causes by hub and driver, and exports to Excel or PDF.
      poster: /images/h4t-xpress/reports.webp
    - id: admin
      label: System admin
      path: /demo/admin
      device: desktop
      blurb: Users, the role and permission matrix, validated system settings and the audit log.
      poster: /images/h4t-xpress/admin-settings.webp
default:
  category: Logistics · Incident management
  tagline: "Last-mile incident handling, from BPMN to a live product"
  problem: "Drivers had no standard way to report incidents; hubs spent 15-20 min on the phone finding a replacement."
  role: "Group leader (analysis), team of 5, then built it"
  highlights:
    - label: "To-be process"
      text: "objective vs subjective incidents, 2 resolution paths"
    - label: "Dispatch rules"
      text: "8 filters + weighted score 40/25/20/15"
    - label: "Traceability"
      text: "every FR linked to API, screen and test"
    - label: "Change log"
      text: "35 spec changes, each with its reason"
  metrics:
    - key: fr
      value: 29
      label: Functional requirements
    - key: uc
      value: 5
      label: Use cases
    - key: nfr
      value: 10
      label: Non-functional requirements
    - key: changes
      value: 35
      label: Spec changes logged
  artifacts:
    - label: Product spec (SRS-style)
      href: https://github.com/thienAG4/h4t-xpress/blob/main/docs/SPEC.md
      kind: spec
    - label: Sequence and state diagrams
      href: https://github.com/thienAG4/h4t-xpress/blob/main/docs/SPEC.md
      kind: sequence
    - label: Traceability matrix
      href: https://github.com/thienAG4/h4t-xpress/blob/main/docs/traceability.md
      kind: trace
    - label: Architecture decisions (6)
      href: https://github.com/thienAG4/h4t-xpress/tree/main/docs/adr
      kind: adr
    - label: API reference (OpenAPI)
      href: https://h4t-api.onrender.com/api/docs
      kind: api
  workflow:
    title: Key workflow · incident handling (to-be)
    caption: Swimlanes collapsed for reading on a page. The full sequence diagram is in the case study.
    mermaid: |
      flowchart LR
        A(["Driver hits a problem"]) --> B["Report incident<br/>type, description, photo"]
        B --> C{"Evidence<br/>complete?"}
        C -- "no" --> B
        C -- "yes" --> D["Hub alerted<br/>in real time"]
        C -- "yes" --> P["Partner told the<br/>reason + apology"]
        D --> E["Classify + reply<br/>objective / subjective,<br/>priority"]
        E --> G{"Solution"}
        G -- "objective" --> H["Reroute<br/>new stop order"]
        G -- "subjective" --> I["Reassign to driver B<br/>ranked candidates"]
        G -- "nobody free" --> J["Hold at hub"]
        I --> K{"B accepts<br/>in time?"}
        K -- "no" --> I
        K -- "yes" --> L["B picks up<br/>from driver A"]
        H --> M(["New ETA synced:<br/>customer sees the update"])
        L --> M
        J --> M
angles: {}
---

## Context

- **The company:** last-mile delivery. Parcels arrive at a hub, drivers take them out, an e-commerce partner informs its customers.
- **The project:** 5-person analysis in Systems Analysis and Design (UEL). I led the group.
- **After the course:** I built the spec into a working product to see if the requirements held up.

## The problem (as-is)

- The driver has **no standard channel** to report it. They call the hub, and the call is the only record.
- The hub manager spends **15 to 20 minutes on the phone** finding a replacement driver.
- The customer and the shop **never get a new ETA** or a reason for the delay.

## Who uses it

| Role | Interface | Sees |
|---|---|---|
| Driver | Mobile web app | Only their own orders, route and incidents |
| Hub manager | Desktop dashboard | Only the hub they manage |
| Executive | Reports | Aggregated figures for every hub, read only |
| System admin | Admin console | Accounts, permissions and settings, no operations |
| Partner and customer | Partner's own site | Status, ETA and delay reasons sent by webhook |

Customers have **no account** in H4T: per our report's scope, updates reach them through the partner.

## To-be: incident handling

**Classify → reply → choose a solution**, in that order. A skipped step is blocked with the exact message from our report.

```mermaid title="Incident handling · sequence" height=520
sequenceDiagram
    actor D as Driver A
    participant API as H4T
    actor H as Hub manager
    actor B as Driver B
    participant P as Partner shop
    D->>API: Report incident (type, description, photo, location)
    API-->>H: Real-time alert
    API->>P: Webhook: reason and apology
    H->>API: Classify (objective / subjective, priority)
    H->>API: Reply to the driver
    alt Objective: reroute
        H->>API: Resolve with a new stop order
        API-->>D: Route updated
    else Subjective: reassign
        H->>API: Resolve with driver B
        API-->>B: Offer with countdown
        B->>API: Accept
        API-->>D: Parcels handed over
    end
    API->>P: Webhook: new ETA
```

**Auto-detected incidents (BR12):** ETA slips 3 times in a row, or a driver on delivery barely moves.

## Order lifecycle

**BR3:** only these transitions are allowed. Every change logs who, when and where.

```mermaid title="Order state machine" height=560
stateDiagram-v2
    [*] --> AWAITING_ASSIGNMENT: Partner sends the order
    AWAITING_ASSIGNMENT --> ASSIGNED: Driver accepts the offer
    AWAITING_ASSIGNMENT --> ON_HOLD: No driver after 3 rounds
    ON_HOLD --> AWAITING_ASSIGNMENT: Hub reopens
    ASSIGNED --> PICKED_UP: Valid waybill scan
    ASSIGNED --> AWAITING_ASSIGNMENT: Driver cancels with a reason
    PICKED_UP --> OUT_FOR_DELIVERY: Start delivery
    OUT_FOR_DELIVERY --> DELIVERED: Proof photo
    OUT_FOR_DELIVERY --> DELIVERY_FAILED: Failure reason
    OUT_FOR_DELIVERY --> AWAITING_ASSIGNMENT: Subjective incident, reassign
    DELIVERY_FAILED --> RESCHEDULED: New date agreed
    RESCHEDULED --> AWAITING_ASSIGNMENT: On the new date
    DELIVERY_FAILED --> RETURNING: Return to hub
    RETURNING --> RETURNED_TO_HUB: Hub confirms
    AWAITING_ASSIGNMENT --> CANCELLED: Partner cancels
    DELIVERED --> [*]
    RETURNED_TO_HUB --> [*]
    CANCELLED --> [*]
```

## Dispatch rules

Finding a replacement used to take 20 minutes, so it got the most precise rules.

- **Eligible (BR4):** 8 filters: active account, shift today, online, fresh GPS, same hub, under the order limit, no pending offer, no earlier refusal.
- **Ranked (BR5):** score 0-100, weights tunable in settings without a release.
- **Offered (BR6-BR8):** one driver at a time, timeout = refusal, 3 empty rounds → on hold + alert.

| Criterion | Measure | Weight |
|---|---|:-:|
| Distance | Closer to the pickup point scores higher, zero beyond 15 km | 40% |
| Current load | Active orders against the driver's limit | 25% |
| History | 70% on-time rate plus 30% incident-free rate over 30 days | 20% |
| Time fit | Whether the rest of the shift covers the delivery | 15% |

## Requirements at a glance

| Group | Covers | Count |
|---|---|:-:|
| FR-S | Receiving, checking and cancelling partner orders | 3 |
| FR-D | Driver: shifts, availability, offers, scanning, status, incidents | 6 |
| FR-H | Hub: reassignment, live tracking, rerouting and more | 6 |
| FR-J | Automatic jobs: dispatch, ETA, partner sync | 3 |
| FR-R | Reports and exports | 6 |
| FR-A | Accounts, permissions, sign-in, configuration | 5 |
| NFR | Performance, security, availability, accessibility... | 10 |

Use cases with full specifications: UC-01 register for a shift, UC-02 follow delivery progress, UC-03 adjust a route, UC-04 reassign an order, UC-05 update delivery status.

## From requirement to test

Excerpt of the [traceability matrix](https://github.com/thienAG4/h4t-xpress/blob/main/docs/traceability.md) (requirement → code → test):

| Requirement | Screen | Automated check |
|---|---|---|
| FR-D-06 Report an incident | Driver: report incident | Rejects a report without a description or evidence |
| FR-H-01 / UC-04 Reassign an order | Hub: candidate picker | Parcels are handed over to another driver |
| FR-H-03 / UC-03 Adjust a route | Hub: route planning | The stop order changes after a reroute |
| FR-R-01..05 Reports | Executive dashboard | Numbers match, and a hub manager only sees their own hub |

## When the spec met the code

Building it showed where the spec was vague. **35 changes** went back into the spec, each numbered with its reason. Three examples:

- **Missing state:** a problem right after the hub scan had no way back from `PICKED_UP`. Added one transition.
- **Hub before automation:** auto offers blocked manual picks. Manual offers now take priority.
- **No driver at night:** no longer burns a dispatch round; orders wait instead of going on hold.
- **Honest limits:** the 99% uptime NFR is marked **not met** on free hosting.

## Screens

```diagram src="/images/h4t-xpress/hub-incident.webp" title="Hub · incident review" height=440
Classify, reply, then choose a solution. Each step is required.
```

```diagram src="/images/h4t-xpress/hub-route-planning.webp" title="Hub · route planning" height=440
Road routes from OSRM with a suggested stop order.
```

```diagram src="/images/h4t-xpress/driver-incident.webp" title="Driver · report an incident" height=560
Type, description and at least one photo are mandatory.
```

```diagram src="/images/h4t-xpress/reports.webp" title="Executive · reports" height=440
Success rate, on-time rate and failure causes, exportable to Excel and PDF.
```

## Credits

Business analysis and UI design (survey, BPMN, DFD, use cases, ERD, Figma) by Group 11, Information Systems Analysis and Design (UEL): Nguyen Duc Thien (lead), Le Quang Huy, Do Hai Thuan, Mai The Thu, Nguyen Tan Trong. Supervisor: Trieu Viet Cuong.
