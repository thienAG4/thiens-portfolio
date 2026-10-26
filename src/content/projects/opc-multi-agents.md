---
title: OPC Multi-Agent System
period: Jul 2026
context: MIS Talent 2026 competition
team: 3
status: completed
stack: [Python, Flask, LLM (Groq), MotherDuck, Neo4j]
links:
  - label: Source code
    href: https://github.com/thienAG4/OPC-multi-agents-system
default:
  category: Finance · Decision support
  tagline: Three AI agents prepare a financing decision, and the founder makes it
  problem: >-
    A small company's founder weighing a new contract has to pull contracts, invoices and cashflow together
    by hand, judge the risk and choose a bank product, usually without an analyst to help.
  role: Team entry for MIS Talent 2026, team of 3.
  highlights:
    - The decision is split into three hand-offs (data and finance, risk and compliance, decision and partner), each with a defined input and output.
    - Rules live in a catalogue of 21 rules over 11 business entities, so every alert traces back to a rule.
    - A person stays in the loop. The agents prepare a decision card; the founder approves, rejects or asks for more information.
  metrics:
    - key: agents
      value: 3
      label: Agents in the workflow
    - key: rules
      value: 21
      label: Business rules
    - key: entities
      value: 11
      label: Business entities
  artifacts:
    - label: Agent blueprint
      href: https://github.com/thienAG4/OPC-multi-agents-system/blob/main/docs/AGENT_BLUEPRINT.md
      kind: design
    - label: Rule catalogue
      href: https://github.com/thienAG4/OPC-multi-agents-system/blob/main/agents/knowledge/rule_catalog.json
      kind: doc
    - label: Agent guardrails
      href: https://github.com/thienAG4/OPC-multi-agents-system/blob/main/agents/knowledge/agent_guardrails.json
      kind: doc
  workflow:
    title: Key workflow · opportunity to decision
    caption: Human-in-the-loop points are the founder's decision and any hold that the rules require.
    mermaid: |
      flowchart TD
        A(["Founder picks an<br/>opportunity"]) --> B["Data and finance agent<br/>contracts, orders, invoices,<br/>cashflow"]
        B --> C["AI reasoning tool<br/>reads contract and<br/>payment terms"]
        C --> D["Funding need, margin,<br/>cashflow gap"]
        D --> E["Risk and compliance agent<br/>rules + guardrails"]
        E --> F{"Escalation<br/>required?"}
        F -- "yes" --> H["Hold / need<br/>clarification"]
        F -- "no" --> G["Decision and partner agent<br/>match a bank product"]
        G --> K["Decision card<br/>reasons, conditions,<br/>next actions"]
        K --> L{"Founder"}
        L -- "approve" --> OK(["Released"])
        L -- "reject" --> NO(["Closed"])
        L -- "more info" --> H
        H --> B
angles: {}
---
