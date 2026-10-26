---
title: ATELIER AI
period: Aug 2026 - now
context: Graduation project, UEL
status: in-progress
stack: [Python, FastAPI, Gemini, MongoDB Atlas Vector Search, Selenium, Playwright]
links:
  - label: Source code
    href: https://github.com/thienAG4/Graduation_Thesis
default:
  category: Retail · AI recommendation
  tagline: An AI fashion stylist that builds outfits from real Shopee products
  problem: >-
    Shoppers know the occasion and the look they want, but not which items suit their body and budget.
    Marketplace search returns single products, not outfits, and gives no reason why an item fits.
  role: Graduation project. Defined the stylist flow and the data pipeline and built the prototype.
  highlights:
    - Advice comes in two stages, a styling plan drawn from 125 styling rules and then real tops, bottoms and accessories that match it.
    - New products go through a staging preview and de-duplication before they reach the catalogue.
    - Every outfit has a match score and the stylist's reasoning, so the shopper sees why each item was chosen.
  metrics:
    - key: rules
      value: 125
      label: Styling rules
    - key: collections
      value: 4
      label: Vector collections
    - key: stages
      value: 2
      label: Retrieval stages
  artifacts:
    - label: Project context report
      href: https://github.com/thienAG4/Graduation_Thesis/blob/main/PROJECT_CONTEXT_REPORT.md
      kind: doc
    - label: Architecture and flows
      href: https://github.com/thienAG4/Graduation_Thesis#readme
      kind: design
  workflow:
    title: Key workflow · from request to outfit
    caption: Product data arrives through a separate ingestion pipeline (crawler or spreadsheet, staging, de-duplication).
    mermaid: |
      flowchart TD
        A(["Shopper: occasion, style,<br/>height, weight, budget"]) --> B["Stage 1 · stylist plan<br/>search 125 styling rules"]
        B --> C["Colour palette, fit,<br/>targeted sub-queries"]
        C --> T["Search tops"]
        C --> BO["Search bottoms"]
        C --> AC["Search accessories"]
        T --> S["Stage 2 · combine into outfits<br/>match score + reasoning"]
        BO --> S
        AC --> S
        S --> P{"Shopper<br/>likes it?"}
        P -- "refine" --> A
        P -- "yes" --> L(["Shopee links,<br/>optional AI lookbook"])
angles: {}
---
