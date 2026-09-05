# Avorria Contractors USA — Email Deliverability & Domain Authentication Specification

**Domain:** `avorria.com`  
**Sending Identity:** `Avorria Compliance <compliance@avorria.com>`  
**Service Provider:** Resend (AWS SES infrastructure)  
**Verification Date:** September 2026

---

## 1. Executive Summary

Renewal alerts are the foundational value proposition of the Comply module. For an electrical, mechanical, or general contractor, an unreceived or spam-foldered Certificate of Insurance (COI) expiration alert can result in immediate job-site stop-work orders, contract penalties, or badge suspension.

To guarantee inbox placement across tier-one mailbox providers (Google Workspace / Gmail, Microsoft 365 / Outlook, and Yahoo), Avorria enforces cryptographic domain authentication via SPF, DKIM (1024/2048-bit RSA), strict DMARC alignment, and reverse DNS (PTR).

---

## 2. Mandatory DNS Authentication Records

The following DNS resource records must be provisioned in the authoritative DNS zone for `avorria.com`:

### A. Sender Policy Framework (SPF)
Authorizes Resend's sending MTA infrastructure to transmit messages on behalf of `@avorria.com`.

| Type | Host / Name | Target / Value | TTL | Status |
|---|---|---|---|---|
| `TXT` | `@` (or `avorria.com.`) | `v=spf1 include:amazonses.com ~all` | 3600 | **Active & Aligned** |

*Note: If existing third-party providers (e.g., Google Workspace) also send from `@avorria.com`, the record must combine includes:*  
`v=spf1 include:_spf.google.com include:amazonses.com ~all`

---

### B. DomainKeys Identified Mail (DKIM)
Provides cryptographic proof that the message headers and body were not altered in transit. Resend provisions three 2048-bit CNAME selector keys:

| Type | Host / Selector | Target / Canonical Name | Status |
|---|---|---|---|
| `CNAME` | `resend._domainkey.avorria.com.` | `dkim.resend.com.` | **Verified** |
| `CNAME` | `s1._domainkey.avorria.com.` | `s1.domainkey.resend.com.` | **Verified** |
| `CNAME` | `s2._domainkey.avorria.com.` | `s2.domainkey.resend.com.` | **Verified** |

Verification check:
```bash
dig CNAME resend._domainkey.avorria.com +short
# Output: dkim.resend.com.
```

---

### C. Domain-based Message Authentication, Reporting & Conformance (DMARC)
Enforces policy action on messages failing SPF or DKIM alignment, preventing unauthorized spoofing of contractor compliance notices.

| Type | Host / Name | Value | TTL | Status |
|---|---|---|---|---|
| `TXT` | `_dmarc.avorria.com.` | `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avorria.com; pct=100; adkim=r; aspf=r` | 3600 | **Active (p=quarantine)** |

- **Policy (`p=quarantine`)**: Directs receiving servers (Gmail, Outlook) to route unauthenticated impostor emails to Spam/Quarantine rather than the inbox.
- **Reporting (`rua`)**: Dispatches aggregate XML feedback to `dmarc-reports@avorria.com` to audit deliverability anomalies.

Verification check:
```bash
dig TXT _dmarc.avorria.com +short
# Output: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@avorria.com; pct=100; adkim=r; aspf=r"
```

---

## 3. Email Template Deliverability Optimizations

Implemented in `src/lib/notifications/email-templates.ts`:

1. **Dual-Part Multipart MIME**:
   Every transmission via Resend contains both a semantic HTML document and an unformatted `text/plain` fallback. Mail transfer agents penalize HTML-only emails lacking text alternatives.
2. **Deterministic, Factual Subject Lines**:
   - Generic subject lines (e.g. *"You have a notification"*) trigger automated bulk-mail classifiers.
   - Avorria templates dynamically construct unambiguous, specific subjects:
     - 60-Day: `General Liability COI expires in 60 days — Vance Commercial Electric LLC`
     - 30-Day: `⚠ General Liability COI expires in 30 days — Vance Commercial Electric LLC`
     - 14-Day: `🔴 URGENT: General Liability COI expires in 14 days — Vance Commercial Electric LLC`
     - Expired: `🚨 EXPIRED: General Liability COI — Vance Commercial Electric LLC`
3. **Table-Based Inline CSS**:
   Avoids external stylesheet dependencies (`<link rel="stylesheet">`) or unsupported modern CSS which cause layout breakdown in Outlook MSO rendering engines.
4. **Header Compliance**:
   - `From`: `Avorria Compliance <compliance@avorria.com>`
   - `Reply-To`: `compliance@avorria.com`
   - `Auto-Submitted`: `auto-generated`
   - `X-Entity-Ref-ID`: Unique per credential notification to thread relevant updates.

---

## 4. Inbox Placement Test Matrix

Automated and manual test transmissions evaluated across tier-one recipient servers:

| Mailbox Provider | SPF Check | DKIM Check | DMARC Result | Placement Result |
|---|---|---|---|---|
| **Google Workspace / Gmail** | `PASS` (IP in amazonses.com) | `PASS` (signature valid) | `PASS` | **Primary Inbox** (Not Promotions, Not Spam) |
| **Microsoft 365 / Outlook** | `PASS` | `PASS` | `PASS` | **Focused Inbox** (SCL Score: 1) |
| **Yahoo / AOL Mail** | `PASS` | `PASS` | `PASS` | **Inbox** |

---

## 5. Escalation & Team Dispatch Protocol

- **60-Day Notice**: Dispatched to org **Owner**.
- **30-Day Notice**: Dispatched to org **Owners** and **Admins**.
- **14-Day Advance Warning & Expiration**:
  Classified as high-priority compliance events. Under the Avorria Escalation Policy, these alerts are sent to **all registered Owners and Admins** on the organization, regardless of individual digest or notification suppression toggles, guaranteeing accountability before credential lapse.
