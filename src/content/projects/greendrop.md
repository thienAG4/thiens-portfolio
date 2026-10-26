---
title: GreenDrop
period: Apr - Jul 2026
context: Business Web Development course, UEL
team: 5
status: completed
stack: [AngularJS, Node.js, Express, MySQL, Docker, Postman]
cover: /images/greendrop/ai-terrarium-builder.webp
links:
  - label: Source code
    href: https://github.com/thienAG4/GreenDrop
  - label: Project report (VI, PDF)
    href: https://github.com/thienAG4/GreenDrop/blob/main/docs/GreenDrop_Project_Report_VI.pdf
default:
  category: E-commerce · After-sales processes
  tagline: Terrarium shop with an AI preview builder and a complete after-sales flow
  problem: >-
    Terrarium shops in Vietnam mostly sell fixed designs. Customers who want a custom one go back and forth
    in chat, cannot see the result before paying, and have little visibility over orders, cancellations or returns.
  role: >-
    Business Analysis Lead in a team of 5: requirements, BPMN, DFD, use case specifications, ERD review and
    manual end-to-end testing.
  highlights:
    - "Wrote the rules that make after-sales predictable: when an order can be cancelled, return deadlines with photo evidence, and a review flag for accounts with more than 3 returns in 180 days."
    - Modelled 7 BPMN processes with swimlanes, business rules and exception paths, plus a context and level-0 DFD.
    - Traced the requirements to a 24-entity data model and 89 API endpoints, then tested the flows end to end.
  metrics:
    - key: br
      value: 16
      label: Business requirements
    - key: fr
      value: 32
      label: Functional requirements
    - key: bpmn
      value: 7
      label: BPMN processes
    - key: uc
      value: 7
      label: Use case specs
  artifacts:
    - label: BPMN processes (7)
      href: https://github.com/thienAG4/GreenDrop/tree/main/docs/diagrams
      kind: bpmn
    - label: Context and level-0 DFD
      href: https://github.com/thienAG4/GreenDrop/blob/main/docs/diagrams/dfd-level-0.png
      kind: dfd
    - label: Use case overview
      href: https://github.com/thienAG4/GreenDrop/blob/main/docs/diagrams/use-case-overview.png
      kind: usecase
    - label: Logical ERD (24 entities)
      href: https://github.com/thienAG4/GreenDrop/blob/main/docs/diagrams/erd-logical.png
      kind: erd
    - label: Requirements and report (PDF)
      href: https://github.com/thienAG4/GreenDrop/blob/main/docs/GreenDrop_Project_Report_VI.pdf
      kind: spec
    - label: Postman collection (89 requests)
      href: https://github.com/thienAG4/GreenDrop/blob/main/docs/postman/GreenDrop.postman_collection.json
      kind: api
  workflow:
    title: Key workflow · return and refund
    caption: Simplified from BPMN process 4. The full diagram with swimlanes is in the case study.
    mermaid: |
      flowchart TD
        A(["Customer finds a<br/>damaged item"]) --> B{"Eligible?<br/>reason, deadline,<br/>account status"}
        B -- "no" --> X(["Request refused"])
        B -- "yes" --> C["Return form<br/>items, reason, photos"]
        C --> D{"At least one<br/>valid photo?"}
        D -- "no" --> C
        D -- "yes" --> E["RETURN_REQUESTED"]
        E --> F{"Admin:<br/>info complete?"}
        F -- "no" --> G["Ask for more<br/>24 h to reply"]
        G -- "no reply" --> CX(["RETURN_CANCELLED"])
        G -- "sent" --> F
        F -- "yes" --> H{"Approve?"}
        H -- "no" --> RJ(["RETURN_REJECTED<br/>with reason"])
        H -- "yes" --> I["Customer ships<br/>the item back"]
        I --> J{"Matches the<br/>evidence?"}
        J -- "no" --> RJ
        J -- "yes" --> K["ITEM_RECEIVED<br/>restock if resellable"]
        K --> L{"Gateway<br/>refund OK?"}
        L -- "yes" --> M(["REFUNDED"])
        L -- "no" --> N(["REFUND_FAILED<br/>admin takes over"])
angles: {}
---

## Context

GreenDrop is an online shop for terrariums and mini plants, built by a team of five in the Business Web Development course at UEL. I was the Business Analysis Lead. The requirements and diagrams were agreed before development and then traced to the database and the API, so the build could be checked against them.

## The problem

- Shops sell **pre-designed products only**. A custom terrarium means a long chat with the shop.
- Customers **cannot see the result** before paying.
- After checkout there is **little visibility**: cancellations, returns and refunds are handled case by case.

## The solution in one paragraph

A **Custom Combo Builder** where the customer picks a container, substrate, plants and decorations and gets an AI image preview of the finished terrarium. Around it, a complete after-sales flow (tracking, cancellation with automatic refund, returns with photo evidence, verified reviews) and a separate admin portal.

## Actors

Three roles use the system (guest, customer, admin), and three external systems sit around it (payment gateway, shipping provider, e-mail and SMS).

```diagram src="/images/greendrop/use-case-overview.webp" title="Use case overview" height=520
Actors and use cases. Seven of them have full specifications in the report.
```

## Requirements

| Artifact | Scope |
|---|---|
| Business requirements | 16 (BR-C01 to C08 for customers, BR-A01 to A08 for admins) |
| Functional requirements | 32 (FR-01 to FR-32) |
| Non-functional requirements | 13 |
| Use case specifications | 7 detailed specifications |
| Data model | Conceptual and logical ERD, 24 entities, built as 24 MySQL tables with 34 foreign keys |

### Business rules that shaped the flows

- A custom combo needs **at least one container and one substrate** before it can be saved or added to the cart.
- Customers can cancel only while the order is **being prepared**. Online payments are refunded automatically; a failed refund goes to an admin.
- Returns need **at least one photo** and must be filed within the deadline for the reason. Accounts with **more than 3 return requests in 180 days** are flagged for manual review.
- If the shop asks for more information and the customer does not reply **within 24 hours**, the return is cancelled.
- Only buyers of **delivered** orders can review, once per order. At most **one voucher per order**; the payment QR code expires after **15 minutes**.

## Processes

Seven BPMN processes, each with swimlanes for the customer, the website and the admin. The return and refund process is the most involved, with two sub-processes: checking eligibility and handling the refund.

```diagram src="/images/greendrop/bpmn-4-return-and-refund.webp" title="BPMN 4 · return and refund" height=560
Swimlanes for customer, website and admin; sub-processes for eligibility and refund on the right.
```

```diagram src="/images/greendrop/bpmn-2-custom-combo-builder.webp" title="BPMN 2 · purchase through the Combo Builder" height=560
The core differentiator: design a terrarium, preview it, then buy it.
```

```diagram src="/images/greendrop/bpmn-3-cancel-and-refund.webp" title="BPMN 3 · cancellation and refund" height=500
Cancellation is allowed only while the order is being prepared.
```

```diagram src="/images/greendrop/bpmn-1-browse-and-purchase.webp" title="BPMN 1 · browse and purchase" height=520
```

The remaining three cover product reviews, product management and promotion management. All seven are in the [repository](https://github.com/thienAG4/GreenDrop/tree/main/docs/diagrams).

## Data flow and data model

```diagram src="/images/greendrop/dfd-level-0.webp" title="DFD level 0" height=500
Processes, data stores and the external entities around them.
```

```diagram src="/images/greendrop/erd-logical.webp" title="Logical ERD · 24 entities" height=560
Implemented as 24 MySQL tables with 34 foreign keys.
```

## Built and tested

The team built the storefront and admin portal in AngularJS with a Node.js and Express API (89 endpoints in 10 modules) on MySQL, all running with Docker Compose. I tested the flows end to end against the requirements, and the API comes with a [Postman collection](https://github.com/thienAG4/GreenDrop/blob/main/docs/postman/GreenDrop.postman_collection.json) where every request has smoke tests.

```diagram src="/images/greendrop/ai-terrarium-builder.webp" title="Custom Combo Builder with AI preview" height=480
```

```diagram src="/images/greendrop/admin-dashboard.webp" title="Admin dashboard" height=440
```

## Team

Nguyen Tan Trong (project lead), Nguyen Duc Thien (business analysis lead), Do Hai Thuan (UI/UX and Figma), Mai The Thu (full-stack development), Le Quang Huy (database design). Originally developed at CkoThuw11/GreenDrop.
