---
title: "Operational Excellence for ML Workloads"
category: "aws-ml-lens"
tags: ["operational-excellence", "monitoring", "ml-pipeline", "incident-response", "slo"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/operational-excellence.html"
last_updated: "2026-02-24"
---

# Operational Excellence for ML Workloads

ML systems fail differently than traditional software. A model can return HTTP 200 while producing garbage outputs, and a slow drift in embedding quality won't trigger a standard health check. Operational excellence here means monitoring the full pipeline, not just the infrastructure underneath it.

## End-to-End Pipeline Monitoring

Instrument every stage of the ML pipeline: data ingestion, preprocessing, embedding generation, vector store writes, retrieval, inference, and post-processing. Each stage should emit latency, throughput, and error metrics independently. When retrieval latency spikes, you need to know whether the bottleneck is the vector query, the reranker, or the LLM call itself.

## Establish Operational Baselines

Before changing anything, measure what normal looks like. Capture baseline metrics for at least two weeks across traffic patterns that include weekday peaks and weekend troughs. Without a baseline, you cannot distinguish a regression from normal variance. This applies to model quality metrics too: track retrieval recall, answer relevance scores, and hallucination rates alongside infrastructure telemetry.

## SLO-Based Alerting

Define service level objectives and alert on breaches, not on arbitrary thresholds. Practical targets for inference-heavy workloads: P50 latency under 500ms, P95 latency under 2 seconds, error rate below 1%. Burn-rate alerts work better than static thresholds here because they catch slow degradation that would otherwise go unnoticed until users complain.

## Change Management Tracking

Every deployment, config change, and model update should be tagged in your monitoring system. When a metric shifts, the first question is always "what changed?" Correlate deployment timestamps with metric changes automatically. This includes prompt template updates, which can alter model behavior as much as any code change.

## Runbook-Driven Incident Response

Write runbooks for the failure modes specific to ML systems: embedding pipeline stalls, vector index corruption, model provider outages, and quality degradation without obvious infrastructure signals. Each runbook should include detection criteria, immediate mitigation steps, root cause investigation procedures, and escalation paths. Review and update runbooks after every incident.

The goal is to make operating an ML system as predictable as operating a traditional web service, even though the failure modes are less intuitive.
