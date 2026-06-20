# 🏛️ AI-Architect-Reviewer

**Enterprise-grade Pull Request reviews focused strictly on System Architecture, Security, Cloud Cost, and Technical Debt.**

Stop paying Senior Engineers to manually hunt for N+1 queries, memory leaks, and broken access controls. `AI-Architect-Reviewer` acts as your automated Principal Architect, living directly inside your CI/CD pipeline.

---

## 🛡️ Why Use AI-Architect-Reviewer?

Unlike standard AI coding assistants that nitpick formatting or syntax, this action is engineered with strict architectural prompts. 

- **Zero-Trust Security (BYOK):** Your source code NEVER leaves your GitHub environment. We use your provided API key to communicate directly with OpenAI. We do not store, log, or train on your proprietary code.
- **Cloud Cost Optimization:** Automatically flags inefficient loops, bad database queries, and architectural flaws that inflate AWS/Vercel bills.
- **Tech Debt Gatekeeper:** Prevents fragile code and SOLID violations from merging into your `main` branch.

## 🚀 Quick Start (Installation)

Add this YAML snippet to your repository under `.github/workflows/ai-review.yml`:

```yaml
name: AI Architectural Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  architect_review:
    runs-on: ubuntu-latest
    name: Run AI Architect Review
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
      
      - name: AI Architect Reviewer
        uses: mosmd04/ai-architect-reviewer@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          llm-api-key: ${{ secrets.OPENAI_API_KEY }}
          model: 'gpt-4o-mini'
          # license-key: ${{ secrets.ARCHITECT_LICENSE_KEY }} # Pro features
