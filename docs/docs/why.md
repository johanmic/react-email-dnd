---
title: Concepts
sidebar_position: 1
---

# Concepts

React Email DnD allows you to build a visual email editor that produces clean, responsive emails. It bridges the gap between developers who define the components and design systems, and non-technical users who build and edit the content.

## Core Philosophy

We built this library to solve a common problem: **Transactional Email Editing**.

- **Developers** want to ensure emails look great, render correctly across clients, and follow brand guidelines.
- **Marketing & Operations** teams want to edit copy, swap images, and rearrange sections without asking developers for code changes.

React Email DnD uses a JSON-based document format as the single source of truth. This allows the editor to provide a rich visual experience while the renderer produces standardized output.

## Architecture

The system consists of three main parts:

1.  **The Editor (`@react-email-dnd/editor`)**: A React component that provides the drag-and-drop interface. It modifies the JSON document.
2.  **The Document (JSON)**: A serializable representation of the email structure (sections, columns, blocks, styles).
3.  **The Renderer (`@react-email-dnd/renderer`)**: A library that takes the JSON document and your React components to generate the final HTML/MJML.

## User Roles & Editor Modes

The editor is designed to support different levels of access. You can configure it for full template creation or restrict it for specific use cases.

### 1. Template Creator (Full Access)

In this mode, the user has full control. They can add any component, change styles, and define variables. This is typically used by designers or developers to create "Master Templates".

### 2. Content Editor (Restricted/Transactional)

This mode is for end-users who need to customize a specific campaign or transactional email without breaking the layout. You can lock down the editor using specific props:

| Feature              | Prop                         | Description                                                                                                                                   |
| :------------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **Locking**          | `unlockable={false}`         | Blocks marked as `locked` in the JSON cannot be unlocked or moved. Useful for headers/footers.                                                |
| **Hiding**           | `showHidden={false}`         | Blocks marked as `hidden` are completely invisible to the user. Useful for internal metadata or conditional logic that users shouldn't touch. |
| **Allowlisting**     | `blocks={['text', 'image']}` | Only allows specific block types to be used. Hides others from the sidebar.                                                                   |
| **Variable Locking** | `variablesLocked={true}`     | Prevents users from creating or deleting variables, ensuring they only use the data fields you've defined.                                    |

## Hiding and Locking

Controlling what users can edit is crucial for maintaining brand consistency.

### Locking

You can lock specific Sections, Rows, or Columns in your JSON document. When `unlockable` is set to `false` on the Editor:

- Users cannot drag/move locked items.
- Users cannot delete locked items.
- Users cannot drop new items into locked containers (unless specifically allowed).

### Hiding

Sometimes you need a section to be present in the final email (e.g., a complex legal footer or a dynamic conditional block) but don't want users to see or edit it.

- Mark the node as `hidden: true` in the JSON.
- Set `showHidden={false}` on the Editor.
- The renderer will still output the content, but the editor will skip it.

## Variables

Emails are rarely static. The editor has first-class support for variables (e.g., `{{user.name}}`).

- **Definition**: Define available variables in the sidebar.
- **Usage**: Users can pick variables from a list when editing text or links.
- **Validation**: The editor visually highlights missing or invalid variables.

See the [Variables](./variables) documentation for more details.
