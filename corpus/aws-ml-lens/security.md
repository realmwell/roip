---
title: "Security for ML Workloads"
category: "aws-ml-lens"
tags: ["security", "zero-data-retention", "encryption", "access-control", "audit-logging"]
source_url: "https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/security.html"
last_updated: "2026-02-24"
---

# Security for ML Workloads

ML systems introduce security surfaces that traditional applications don't have. Data flows through embedding pipelines, gets stored in vector databases, passes through third-party inference APIs, and returns in generated text that may inadvertently leak sensitive information. Security here requires attention at every stage.

## Zero-Data-Retention for Sensitive Workloads

When processing sensitive data through external LLM APIs, enable zero-data-retention (ZDR) agreements with your model provider. This ensures that input prompts and output completions are not stored, logged, or used for training on the provider's side. Verify ZDR status contractually and technically: check API configurations, confirm that data processing agreements are in place, and audit that your requests actually use the ZDR-enabled endpoints.

## Encryption In Transit and At Rest

Encrypt all data moving between pipeline components using TLS 1.2 or later. This covers API calls to model providers, queries to vector databases, and internal service communication. For data at rest, encrypt vector store indexes, document chunks, embedding caches, and any intermediate processing artifacts. Use customer-managed encryption keys (CMK) through AWS KMS or equivalent so you control key rotation and access. Vector stores deserve the same encryption treatment as any other database holding your data.

## API Key Rotation and Least-Privilege Access

Rotate API keys for model providers on a regular schedule, not just when someone leaves the team. Store keys in a secrets manager (AWS Secrets Manager, HashiCorp Vault) and never in code, config files, or environment variables baked into images. Apply least-privilege access: the inference service needs permission to call the model API and read from the vector store, not to modify IAM policies or access billing data. Separate keys by environment so a compromised development key can't hit production endpoints.

## Data Classification Framework

Not all data should reach an LLM API. Define clear tiers: public data that can be sent freely, internal data that requires ZDR agreements, confidential data that must be processed only by self-hosted models, and restricted data (PII, PHI, financial records) that requires additional anonymization or redaction before any model interaction. Enforce these tiers programmatically with classification tags and middleware that blocks requests violating the policy.

## Audit Logging for Model Interactions

Log every model interaction: who made the request, what prompt was sent, which model responded, token counts, latency, and a reference to the retrieved context. Do not log full response text for sensitive workloads, but log enough metadata to reconstruct what happened during an incident. Retain audit logs according to your compliance requirements and route them to a tamper-evident store. These logs are essential for investigating data exposure, debugging quality issues, and demonstrating compliance.
