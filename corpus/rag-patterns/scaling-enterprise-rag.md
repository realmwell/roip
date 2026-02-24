---
title: "Scaling Enterprise RAG Across Teams"
category: "rag-patterns"
tags: ["enterprise", "scaling", "api-keys", "namespaces", "rate-limits", "multi-tenant"]
source_url: "https://platform.openai.com/docs/guides/rate-limits"
last_updated: "2026-02-24"
---

# Scaling Enterprise RAG Across Teams

Moving from a single-team RAG deployment to an enterprise-wide platform introduces operational complexity around cost attribution, access control, rate limits, and onboarding.

## Per-Team API Keys for Cost Isolation

Issue each team their own OpenAI API key (or use project-level keys within your organization). This gives you automatic cost isolation: each key's usage shows up separately in the billing dashboard. No manual attribution needed.

Beyond cost tracking, per-team keys let you set independent rate limits, revoke access without affecting other teams, and track usage patterns per team for capacity planning.

## Shared Infrastructure with Namespace Separation

Don't deploy a separate RAG stack per team. Run shared infrastructure (vector database, caching layer, routing service, API gateway) and separate teams at the data layer using namespaces.

In the vector database, each team gets its own namespace or collection. Queries are scoped to the team's namespace, so Team A's product catalog doesn't pollute Team B's HR policy search. Shared namespaces (company-wide policies, universal FAQs) are accessible to all teams via cross-namespace queries.

The caching layer also needs namespace separation. A cached response to "What's the return policy?" from Team A (retail) shouldn't be served to Team B (logistics) because their return policies differ.

## 2-Week Burn-In Per New Team

Every new team that onboards to the platform goes through a 2-week burn-in period. During burn-in:

- Traffic is limited to a small user group (5-10 pilot users).
- All queries are logged and reviewed for quality.
- Retrieval performance is evaluated against the team's specific knowledge base.
- Token consumption patterns are baselined for capacity planning.
- Edge cases and failure modes specific to the team's domain are identified.

After burn-in, expand to the full team with confidence that the configuration works for their use case.

## Rate Limit Planning

Before scaling, calculate your projected TPM (tokens per minute) and RPM (requests per minute) needs:

1. **Estimate query volume**: Number of users x queries per user per day / active hours per day / 60 = queries per minute.
2. **Estimate tokens per query**: Average input tokens + average output tokens per request.
3. **Multiply**: Queries per minute x tokens per query = TPM needed.
4. **Add headroom**: Multiply by 1.5-2x for burst capacity.

Compare against your current API tier limits. If projected usage exceeds your tier, request an upgrade proactively. Tier upgrades can take days to process, so don't wait until you're hitting 429 errors.

## Governance and Access Control

Establish an API gateway that enforces per-team quotas, routes requests through the shared pipeline, and logs everything. The gateway provides a single point of control for:

- Rate limiting per team (prevent one team from consuming all capacity).
- Request validation (reject malformed queries before they hit the LLM).
- Authentication (verify team identity via API key or service account).
- Audit logging (who queried what, when, and at what cost).

## Cost Allocation

Run monthly cost reports per team. Break down by model (nano/mini/full), API type (real-time vs. batch), and pipeline stage (embedding, retrieval, generation). Give team leads visibility into their own costs so they can optimize independently.
