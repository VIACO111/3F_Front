# Project: The 3F System (Organizational Signal & Sense-Making)

## 1. Executive Vision

The **3F System** is a human-centric organizational feedback platform designed to collect high-fidelity "Signals" from employees to surface strategic patterns. Unlike traditional ticketing or pulse-survey systems, 3F focuses on **sense-making** over **issue resolution**. It moves from individual "complaints" to **socially verified shared experiences** by using **Pairs** as the primary unit of expression.

### Core Philosophy

* **Experience > Optimization:** We prioritize understanding the lived experience of work.
* **Signals > Tickets:** We do not "close" issues; we track the evolution of patterns.
* **Socratic AI:** The AI acts as a polisher and clarifier, not a judge or ghostwriter.
* **Privacy-by-Design:** Strict separation between raw human text and aggregated thematic dimensions.

---

## 2. The 3F Taxonomy

All input is dissected into three distinct dimensions to enable non-punitive analysis:

| Axis | Description | Examples |
| --- | --- | --- |
| **Form** | The tangible objects or structures involved. | A specific meeting, a PDF strategy, a software tool, a policy. |
| **Function** | The process or goal being attempted. | Decision-making, resource allocation, communication, deployment. |
| **Feeling** | The emotional state of the participants. | Anxiety, clarity, motivation, disconnection, frustration. |

---

## 3. Core Entities & Roles

### A. The Pair (Primary Unit)

* Feedback is submitted by **two people** working together.
* **Rationale:** Pairing increases data richness, reduces individual bias, and provides immediate psychological safety (social verification).
* **Activities:** Journaling (sentiment), Urgent (problems), or Themes (strategic feedback).

### B. The Manager

* **Team Context Essay:** Managers provide an "anchor" description of what the team is currently doing to give context to the Pairs.
* **Observation:** Managers see aggregated themes within their scope but cannot see individual raw text unless explicitly shared.

### C. The Leader

* **Theme View:** Leaders see organizational patterns and trends over time.
* **Experimentation:** Leaders sponsor "Experiments" to address patterns, rather than "assigning fixes."

---

## 4. System Architecture (Multi-Agent/Event-Driven)

The system is built as a self-hosted, event-driven architecture using an **Orchestrator** to govern specialized AI agents.

### Specialized Agents

* **The Dissector:** Extracts 3F suggestions from raw text.
* **The Anonymizer:** Strips PII before thematic aggregation.
* **The Weaver:** Groups signals into high-level "Themes" based on 3F overlaps.

### Data Layers

* **The Vault (PostgreSQL):** Stores immutable raw signals and identity metadata.
* **Semantic Memory (Vector DB):** Stores anonymized 3F embeddings for pattern recognition.
* **Event Log:** The append-only single source of truth for all system actions.

---

## 5. Front-End Tech Demo Requirements (MVP)

### The Workspace (The 3F Editor)

* **Identity:** Displays the active Pair and the Perspective (Role, Team, or Organisation).
* **3F Canvas:** A vertical list of dynamic text boxes for Form, Function, and Feeling. Pairs can add multiple "signals" per category using the **"+" button**.
* **Manager's Strategic Anchor:** A dropdown menu containing high-level strategic priorities (e.g., Optimising 1CX/Sales, Eliminating Deployment Risks) that contextualizes the Pair's reflection.

### The AI Polisher (The Logic)

* The AI monitors all 3F inputs in real-time.
* It leverages the selected **Strategic Anchor** to provide contextually relevant advice.
* It provides **Socratic Suggestions** in a sidebar as the Pair types.
* **Goal:** Increase dataset quality by asking: *"Was that meeting about the specific cloud migration technical hurdles, or more about the general timeline?"*

---

## 6. Cultural & Technical Guardrails

* **No Individual Dashboards:** Leaders cannot "drill down" to an individual's signals.
* **Aggregation Thresholds:** Themes only appear when multiple signals from different pairs exist (minimum threshold applies).
* **Deterministic Orchestration:** The AI suggests, but the **Orchestrator** enforces the rules, and the **User** confirms the meaning.

---

## 7. Deployment Strategy

* **Platform:** GitHub Pages
* **Branch:** `main` (root or `/docs` folder)
* **Build State:** Static assets (HTML/CSS/JS) to ensure zero-latency loading and easy stakeholder sharing.

---

### Implementation Instructions for IDE LLM

> "When generating code for this project, prioritize the **Pair** as the data owner. Ensure the UI distinguishes clearly between the **Raw Text** (private) and the **3F Dimensions** (shareable). Use a clean, professional, 'grid-paper' aesthetic to emphasize a journaling environment over a corporate dashboard."
