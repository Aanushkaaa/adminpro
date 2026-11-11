# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Google Workspace Super Admins, IT Systems Administrators, and Security Engineers managing organization domain accounts, user aliases, email signatures, group access policies, and audit compliance.

## Product Purpose

`GWS Admin Pro` is a single-pane-of-glass administrative SaaS platform for Google Workspace domain management. It replaces disparate AppScript projects and fragmented Google Admin Console workflows with a unified, real-time management control plane.

## Positioning

Direct, full-domain Google Workspace management via service-account domain-wide delegation (DWD) with real-time Google Sheets audit logging for every admin action across Signatures, Aliases, Mailboxes, Groups, Drive, and Chat.

## Operating Context

- **Environment**: Web-based administrative dashboard used in high-volume IT support and domain administration workflows.
- **Tools & APIs**: Google Workspace Directory API, Gmail REST API, Google Drive API, Google Chat API, Google Sheets API.
- **Rituals**: Bulk signature deployment across enterprise teams, domain alias management, email security recall, group permission provisioning, and Drive storage monitoring.

## Capabilities and Constraints

- **Live Google API Integration**: Authenticates using JWT Service Account key JSON with Domain-Wide Delegation (impersonating targeted user accounts for per-mailbox operations).
- **Multi-Tab Audit Logging**: Every administrative action automatically logs timestamped rows into dedicated tabs inside a linked Google Sheet (e.g. `SaaS Signatures Log`, `SaaS Group Operations Log`, `SaaS Aliases Log`).
- **Edge-Aligned Professional Dashboard**: High-density, clean visual hierarchy built with Tailwind CSS, React, and Lucide icons.
- **Constraints**: Enforces strict domain filtering (`demo.econz.net`), handles API rate limits gracefully with paginated token loops, and maintains full API contract compatibility.

## Brand Commitments

- **Visual Identity**: Clean, solid indigo brand color (`#4f46e5` / `bg-indigo-600`), edge-aligned grid layout, vector Lucide icon set, high contrast text hierarchy, and zero AI visual cliches.
- **Tone & Voice**: Authoritative, action-oriented, precise, and professional IT administration UI copy.

## Evidence on Hand

- **Active Workspace Codebase**: React + Vite frontend in `/Users/Anushka/.gemini/antigravity/scratch/gws-admin-pro-saas`.
- **Live Google Service Account Credentials**: Configured for Domain-Wide Delegation with full Directory, Gmail, Drive, Chat, and Sheets scopes.
- **Audit Sheet**: Linked Google Sheet ID `1WXt7PFd94nDjKcbNc2LWHoq-F2D47DQ_vAZCh8F9dI`.

## Product Principles

1. **Precision & Speed**: IT Admins perform high-stakes operations; controls must be immediate, unambiguous, and edge-aligned.
2. **Total Transparency & Auditability**: Every action creates a persistent, structured audit log row in Google Sheets.
3. **Restraint Over Decoration**: High density scanability and visual hierarchy outrank decorative clutter.
4. **Resilient Error Guidance**: When Google API errors occur (e.g. missing scopes or DWD delegating requirements), provide immediate, step-by-step resolution steps.

## Accessibility & Inclusion

- WCAG AA compliant text-to-background contrast ratios.
- Full keyboard navigation and semantic HTML headings.
- Explicit visual loading and empty states for all domain queries.
