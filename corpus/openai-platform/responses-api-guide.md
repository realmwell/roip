---
title: "Responses API Guide"
category: "openai-platform"
tags: ["responses-api", "api", "assistants", "chat-completions", "tools"]
source_url: "https://platform.openai.com/docs/guides/responses"
last_updated: "2026-02-24"
---

# Responses API Guide

The Responses API launched in March 2025 and is the recommended API for all new integrations on the OpenAI platform.

## What the Responses API Does

The Responses API unifies the Chat Completions API and the Assistants API into a single primitive. Instead of choosing between two different interfaces depending on whether you need stateless inference or persistent tool-use workflows, you use one endpoint for both.

It supports built-in tools including web search, file search, and code interpreter. It also supports structured outputs, multi-turn conversations, and streaming. You can compose these capabilities in a single request without managing separate thread or run objects.

## Relationship to Chat Completions

The Chat Completions API is still fully supported and is not deprecated. Existing integrations that use Chat Completions will continue to work. OpenAI has no announced plans to remove it.

That said, the Responses API is where new features land first. If you are building something from scratch, use the Responses API. If you have a working Chat Completions integration and don't need built-in tools or multi-turn state management, there is no urgent reason to migrate.

## Assistants API Sunset

The Assistants API is scheduled for sunset on August 26, 2026. OpenAI has published a migration guide to help teams move from Assistants to the Responses API. The migration path is straightforward for most use cases since the Responses API covers the same capabilities (threads, tool use, file handling) with a simpler interface.

If you are currently using the Assistants API, start planning your migration now. The core concepts map directly: assistant instructions become system messages, tools carry over, and file search works natively in the Responses API.

## Built-in Tools

The Responses API includes three built-in tools:

**Web Search** lets the model query the web during a response. Useful for real-time information retrieval without building your own search pipeline.

**File Search** enables the model to search over uploaded files using OpenAI's hosted vector store. This handles chunking, embedding, and retrieval automatically.

**Code Interpreter** gives the model a sandboxed Python environment to write and run code during a response. It can process uploaded files, generate charts, and perform calculations.

## Multi-Turn Conversations

The Responses API handles multi-turn state natively. You pass a `previous_response_id` to continue a conversation without resending the full message history. The API manages context threading on the server side, which simplifies client code and reduces token usage on subsequent turns.

## When to Use What

- New projects: Responses API
- Existing Chat Completions integrations: keep using them unless you need built-in tools
- Existing Assistants integrations: migrate to Responses API before August 2026
