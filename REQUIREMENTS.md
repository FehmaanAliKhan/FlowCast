# FlowCast — Core Requirements Document

## 1. Project Overview

**Application:** FlowCast  
**Type:** Personal Finance Management Web Application  
**Live URL:** https://fehmaanalikhan.github.io/FlowCast  
**Repository:** https://github.com/FehmaanAliKhan/FlowCast

FlowCast allows users to track income and expenses, forecast future cash flow, run what-if financial scenarios, and set savings goals — all with secure per-user authentication and cloud-synced data persistence.

---

## 2. Functional Requirements

### 2.1 Authentication
| ID | Requirement | Status |
|----|-------------|--------|
| AUTH-1 | Users can register with an email and password | ✅ Implemented |
| AUTH-2 | Users can log in and receive a JWT session token | ✅ Implemented |
| AUTH-3 | Sessions persist across browser refreshes via localStorage | ✅ Implemented |
| AUTH-4 | Users can sign out, which clears the session token | ✅ Implemented |
| AUTH-5 | Password must be 12–16 characters with uppercase, lowercase, number, and symbol | ✅ Implemented |
| AUTH-6 | Users can change their password from the Settings page | ✅ Implemented |
| AUTH-7 | Expired or invalid tokens automatically redirect to the login screen | ✅ Implemented |

### 2.2 Transaction Tracking
| ID | Requirement | Status |
|----|-------------|--------|
| TXN-1 | Users can add income and expense transactions | ✅ Implemented |
| TXN-2 | Each transaction has a date, description, amount, and category | ✅ Implemented |
| TXN-3 | Users can edit and delete existing transactions | ✅ Implemented |
| TXN-4 | Transactions are displayed in a searchable, filterable list | ✅ Implemented |
| TXN-5 | Categories are displayed with colour-coded icons | ✅ Implemented |

### 2.3 Recurring Rules
| ID | Requirement | Status |
|----|-------------|--------|
| REC-1 | Users can define recurring income or expense rules | ✅ Implemented |
| REC-2 | Rules support daily, weekly, monthly, and yearly frequencies | ✅ Implemented |
| REC-3 | Rules can be toggled active/inactive without deleting them | ✅ Implemented |
| REC-4 | Active recurring rules are projected into the forecast engine | ✅ Implemented |
| REC-5 | Upcoming bills within 30 days are surfaced on the dashboard | ✅ Implemented |

### 2.4 Cash Flow Forecasting
| ID | Requirement | Status |
|----|-------------|--------|
| FORE-1 | The app projects future balance based on transactions and recurring rules | ✅ Implemented |
| FORE-2 | Forecast horizon can be set to 3M, 6M, 1Y, or 2Y | ✅ Implemented |
| FORE-3 | A line chart visualises the projected balance over time | ✅ Implemented |
| FORE-4 | A bar chart shows monthly income vs expenses | ✅ Implemented |
| FORE-5 | Monte Carlo simulation can be toggled on the forecast chart | ✅ Implemented |

### 2.5 Scenario Planning
| ID | Requirement | Status |
|----|-------------|--------|
| SCE-1 | Users can create named what-if scenarios | ✅ Implemented |
| SCE-2 | Scenarios can override recurring rule amounts or add new rules | ✅ Implemented |
| SCE-3 | Multiple scenarios can be overlaid on the forecast chart | ✅ Implemented |
| SCE-4 | A baseline scenario is always present and cannot be deleted | ✅ Implemented |

### 2.6 Savings Goals
| ID | Requirement | Status |
|----|-------------|--------|
| GOA-1 | Users can create savings goals with a target amount and deadline | ✅ Implemented |
| GOA-2 | Progress towards each goal is shown with a progress bar | ✅ Implemented |
| GOA-3 | Goals are displayed on the dashboard summary | ✅ Implemented |

### 2.7 Dashboard
| ID | Requirement | Status |
|----|-------------|--------|
| DSH-1 | Dashboard shows total balance, income, expenses, and net cash flow | ✅ Implemented |
| DSH-2 | KPI cards display month-over-month percentage changes | ✅ Implemented |
| DSH-3 | Cash runway (days until balance hits $0) is displayed | ✅ Implemented |
| DSH-4 | A financial health score is calculated from savings rate and runway | ✅ Implemented |
| DSH-5 | Quick action buttons provide fast navigation to key features | ✅ Implemented |
| DSH-6 | A global search overlay searches across all data and pages | ✅ Implemented |

### 2.8 Settings
| ID | Requirement | Status |
|----|-------------|--------|
| SET-1 | Users can set a starting balance and as-of date | ✅ Implemented |
| SET-2 | Users can set a default forecast horizon | ✅ Implemented |
| SET-3 | Users can toggle between light, dark, and system themes | ✅ Implemented |
| SET-4 | Users can export their data as a JSON file | ✅ Implemented |
| SET-5 | Users can import data from a previously exported JSON file | ✅ Implemented |
| SET-6 | Users can reset all data (with confirmation modal) | ✅ Implemented |
| SET-7 | Users can change their password | ✅ Implemented |

---

## 3. Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NFR-1 | The app must be accessible via a public URL | ✅ GitHub Pages |
| NFR-2 | Data must persist between sessions | ✅ PostgreSQL via Supabase |
| NFR-3 | The app must be responsive on desktop and mobile | ✅ Tailwind responsive classes |
| NFR-4 | No paid third-party APIs | ✅ All free services |
| NFR-5 | Passwords must be stored securely | ✅ bcrypt (rounds=10) |
| NFR-6 | API routes must be protected with authentication | ✅ JWT middleware |
| NFR-7 | Rate limiting must be applied to auth endpoints | ✅ 20 req / 15 min |

---

## 4. Technical Constraints

- No Node.js build step — frontend must run as static files
- Backend must support both SQLite (local) and PostgreSQL (production) without code changes
- Frontend and backend are hosted on separate domains — CORS must be configured
- All monetary values stored as integer cents to avoid floating-point errors

---

## 5. Out of Scope

- Email verification
- Forgot password / password reset via email
- Multi-currency support
- Bank account integrations / CSV import
- Mobile native app
