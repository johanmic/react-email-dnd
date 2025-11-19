---
title: Overview
sidebar_position: 1
---

# React Email DnD

A drag-and-drop email builder for React applications. It separates the **Editor** (for users) from the **Renderer** (for email clients), connected by a shared **JSON schema**.

## Core Documentation

- **[Concepts](./why)**: Understand the architecture, user roles, and locking/hiding features.
- **[Getting Started](./getting-started)**: Installation and setup guide.
- **[JSON Structure](./json-structure)**: The data format that powers the document.
- **[Variables](./variables)**: How to handle dynamic data (e.g., `{{user.name}}`).

## Packages

- **[Editor](./packages/editor/basics)**: The visual builder component.
- **[Renderer](./packages/renderer/rendering-examples)**: Converting JSON to HTML/MJML.
