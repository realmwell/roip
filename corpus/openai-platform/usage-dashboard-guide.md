---
title: "Usage Dashboard Guide"
category: "openai-platform"
tags: ["usage", "monitoring", "costs", "dashboard", "observability"]
source_url: "https://platform.openai.com/usage"
last_updated: "2026-02-24"
---

# Usage Dashboard Guide

The OpenAI Usage Dashboard provides visibility into your API consumption, costs, and operational health. It is the primary tool for monitoring your OpenAI spend and diagnosing production issues.

## Token Consumption and Cost Tracking

The dashboard shows real-time and historical token consumption broken down by model. You can see input tokens, output tokens, and cached tokens separately for each model, along with the corresponding costs.

Cost by model breakdowns let you identify which models drive the most spend. This is especially useful when you run multiple models in a pipeline (e.g., GPT-4.1-nano for routing, GPT-4.1-mini for generation, text-embedding-3-small for retrieval). You can see exactly where your budget goes and whether a model swap would meaningfully reduce costs.

Request counts are tracked alongside token metrics. This helps you distinguish between high-token/low-request workloads (few large requests) and low-token/high-request workloads (many small requests), which have different rate limit implications.

## Error Rates and Latency

The dashboard surfaces error rates over time, broken down by error code. A spike in 429 errors tells you that you are hitting rate limits. A spike in 500/503 errors suggests platform instability. Persistent 400 errors point to a bug in your request construction.

Latency percentiles (p50, p95, p99) give you a picture of how fast the API is responding to your requests. Track these over time to spot degradation. A rising p95 might indicate that your prompts are getting longer, or that the platform is under heavier load.

## Organization-Level Breakdowns

Usage data can be filtered and grouped by API key and project. This is where project-based API keys pay off: you can see exactly how much each team, application, or environment is consuming.

For organizations with multiple teams using the API, these breakdowns answer questions like: Which team accounts for the cost increase this month? Is the staging environment using more tokens than expected? Did the new feature launch change our consumption pattern?

## Cost Threshold Alerts

You can configure alerts that trigger when your spending crosses defined thresholds. Set these at levels that give you enough warning to investigate before costs run away.

A common setup is:

- A warning alert at 80% of your monthly budget
- A critical alert at 100% of your monthly budget
- Per-project alerts for teams with their own budgets

Alerts can notify via email or webhook. Connecting them to your team's alerting system (Slack, PagerDuty, etc.) ensures someone sees the notification quickly.

## Using the Dashboard for Debugging

When something goes wrong in production, the Usage Dashboard is often your first stop:

- **Unexpected cost spike:** Filter by model and time range to identify the source. Check whether a new deployment increased prompt length or output tokens.
- **Rising error rates:** Look at error code breakdowns. 429 errors mean you need higher limits or better rate limiting. 400 errors mean your requests changed.
- **Latency regression:** Check latency percentiles against recent deployments. Correlate with token consumption changes.
- **Drift detection:** Compare weekly token consumption trends. Gradual increases often indicate prompt drift (prompts getting longer over time due to accumulated context or growing few-shot sets).

## Recommendations

- Check the dashboard weekly as part of your operational review
- Set cost threshold alerts before you need them
- Use project-based API keys to enable per-team attribution
- Track latency percentiles alongside cost to catch performance regressions early
