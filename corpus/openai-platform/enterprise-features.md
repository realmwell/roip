---
title: "Enterprise Features"
category: "openai-platform"
tags: ["enterprise", "zdr", "security", "compliance", "api-keys"]
source_url: "https://developers.openai.com/api/docs/guides/your-data"
last_updated: "2026-02-24"
---

# Enterprise Features

OpenAI offers several features aimed at production workloads, compliance requirements, and organizational control. This covers zero data retention, enterprise tier capabilities, and project-based API key management.

## Zero Data Retention (ZDR)

Zero data retention controls whether OpenAI stores your API request and response data.

**Enterprise contracts** include ZDR by default. API data is processed but not stored on OpenAI's servers beyond what is needed to complete the request.

**Standard API accounts** have a default 30-day data retention period. During this window, OpenAI may store inputs and outputs for abuse monitoring and safety purposes. The data is not used for model training (API data has been excluded from training since March 2023), but it is retained temporarily.

**Opt-in ZDR** is available for standard API customers who need zero retention without a full enterprise contract. You can enable it through your account settings or by contacting OpenAI. Once enabled, the same no-storage policy applies to your API traffic.

For regulated industries (healthcare, finance, legal), ZDR is typically a baseline requirement. Confirm your retention settings before processing any sensitive data through the API.

## Enterprise Tier

The enterprise tier provides capabilities beyond what standard API tiers offer:

**Higher rate limits** beyond Tier 5 defaults, scaled to your contracted volume. This includes both RPM and TPM increases tailored to your workload.

**Dedicated capacity** options for consistent performance without contention from shared infrastructure. This matters for latency-sensitive applications where variance is as important as throughput.

**SSO and SAML integration** for centralized identity management. Team members authenticate through your existing identity provider rather than managing separate OpenAI credentials.

**SLAs (Service Level Agreements)** with defined uptime guarantees and response time commitments for support. Standard API accounts do not include SLAs.

The enterprise tier is negotiated directly with OpenAI's sales team and priced based on committed volume and feature requirements.

## Project-Based API Keys

OpenAI supports project-based API keys that let you segment usage across teams, applications, or environments within a single organization.

Each project gets its own API key. Usage (tokens, requests, costs) is tracked separately per project in the Usage Dashboard. This gives you per-team cost visibility without needing separate OpenAI organizations.

Project keys also allow you to set per-project rate limits, so one team's traffic spike doesn't consume another team's capacity. You can assign different team members to different projects with appropriate access controls.

For production setups, a common pattern is one project per environment (dev, staging, production) and separate projects for distinct product lines or internal teams. This keeps cost attribution clean and makes it easy to spot unusual consumption patterns.

## Audit and Compliance

Enterprise accounts get access to audit logs that track API key creation, usage pattern changes, and administrative actions. These logs integrate with standard SIEM tools for security monitoring.

Combined with ZDR, project-based keys, and SSO, the enterprise tier provides the control surface that compliance teams typically require before approving AI API usage in regulated environments.
