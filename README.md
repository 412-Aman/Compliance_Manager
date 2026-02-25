#This Is Our Main Project For Deriv:

# AI Payments Fraud Detection System

[![GitHub](https://img.shields.io/badge/GitHub-AI_PAYMENT_PROCESS-blue?logo=github)](https://github.com/bhargavramgajula007/AI_PAYMENT_PROCESS)

# Real-time payout approval system with explainable AI and fraud ring detection for trading platforms and fintech.
# Check it out

---
# Now about this project:
## What It Does

- **Auto-approves 85-95%** of legitimate withdrawals in <2 seconds
- **Detects fraud rings** via graph analysis of shared devices/IPs/payment methods
- **Explains every decision** with structured evidence and AI-generated rationales
- **Learns from feedback** to reduce false positives over time

---

## Core Features

### 1. Real-Time Payout Decisioning
- Sub-2-second approve/escalate/block decisions
- 40+ risk signals: account age, velocity, trading patterns, device sharing
- MAD-based outlier detection for robust scoring
- Policy-driven thresholds with auto-calibration

### 2. Fraud Ring Detection
- Graph analysis of shared identifiers (device/IP/payment tokens)
- 1-2 hop expansion to find connected accounts
- Automatic exposure calculation
- One-click bulk containment

### 3. Explainable AI
Every decision includes:
```json
{
  "decision": "BLOCK",
  "risk_score": 720,
  "reason_codes": ["NEW_PAYMENT_METHOD", "MINIMAL_TRADING"],
  "explanation": {
    "summary": "New card + no trades + rapid withdrawal",
    "timeline": ["Deposit $2600 at 11:40", "1 trade ($45) at 12:01", "Withdraw $2500 at 12:34"],
    "counterfactuals": ["If card verified 30+ days ago → risk drops to 300"],
    "similar_cases": ["case_12: confirmed fraud, 89% similar"]
  }
}
```

### 4. Natural Language Queries
```
"Show accounts with deposits >$500, minimal trading, withdrawals in last 24h"
  ↓
Safe SQL query plan → Execute → Results
```

### 5. Automated Incident Response
When rings detected:
- Executive summary with timeline
- Bulk lock/block actions
- Customer communication drafts
- Compliance documentation

---

## Architecture

```
Events (Kafka) → Feature Compute → Redis Cache
                      ↓
              Risk Engine (MAD scoring)
                      ↓
              LLM Explainer (Schema-locked JSON)
                      ↓
              Postgres + Audit Log
                      ↓
              UI (Queue/Cases/Graph)
```

**Latency**: Payout decision <2s p95, Ring detection <10s

---

## Tech Stack

**Backend**: FastAPI, PostgreSQL, Redis, Kafka  
**Frontend**: Next.js, Tailwind CSS, TypeScript  
**AI**: OpenAI/Anthropic/Gemini (schema-locked outputs)  
**Graph**: In-memory or Neo4j

---

## Quick Start

### Backend
```bash
git clone https://github.com/bhargavramgajula007/AI_PAYMENT_PROCESS
cd AI_PAYMENT_PROCESS/apps/backend

python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy redis psycopg2-binary openai

# Setup .env with DATABASE_URL, REDIS_URL, LLM_API_KEY
python -m src.db.init_db
uvicorn src.main:app --reload --port 8000
```

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

**URLs**: API http://localhost:8000 | UI http://localhost:3000

---

## Key Event Schemas

### withdrawal_requested
```json
{
  "withdrawal_id": "wd_456",
  "account_id": "acct_123",
  "amount": 2500.00,
  "payment_method_id": "pm_789",
  "requested_at": "2026-02-07T12:34:56Z"
}
```

### officer_decision (feedback)
```json
{
  "case_id": "case_777",
  "decision": "confirm_fraud | confirm_legit | override_approve",
  "decided_by": "officer_12"
}
```

---

## API Endpoints

```bash
POST /events                              # Ingest events
POST /withdrawals/{id}/decision           # Get risk decision
GET  /cases?status=ESCALATED              # Review queue
GET  /rings/{id}                          # Ring details
POST /copilot/query-plan                  # NL query
POST /actions/lock-accounts               # Bulk actions
POST /feedback/officer-decision           # Learning loop
```

---

## Risk Scoring

```python
# 40+ features computed in real-time
features = {
  'acct_age_days': 5,
  'pm_first_time_withdrawal': True,
  'trading_volume_since_deposit': 45,
  'amount_vs_p95_zscore': 4.2,  # MAD-based
  'device_account_count': 3
}

# Policy-based decision
if risk_score < 200:   decision = 'AUTO_APPROVE'
elif risk_score < 600: decision = 'ESCALATE'
else:                  decision = 'BLOCK'
```

---

## Fraud Ring Detection

```python
# Graph edges: shared device/IP/payment method
ring = graph.expand_from_seed(
    seed='acct_123',
    hops=2,
    min_weight=0.6
)

# Output: 12 accounts, $18.4K exposure, shared device_hash_999
```

---

## Database Schema

```sql
CREATE TABLE decisions (
  decision_id UUID PRIMARY KEY,
  withdrawal_id VARCHAR(100),
  account_id VARCHAR(100),
  risk_score INT,
  risk_band VARCHAR(20),
  reason_codes JSONB,
  llm_explanation JSONB,
  created_at TIMESTAMPTZ
);

CREATE TABLE rings (
  ring_id VARCHAR(100) PRIMARY KEY,
  member_accounts JSONB,
  shared_identifiers JSONB,
  exposure_usd DECIMAL(12,2),
  created_at TIMESTAMPTZ
);

CREATE TABLE audit_log (
  log_id UUID PRIMARY KEY,
  actor VARCHAR(100),
  action VARCHAR(100),
  target_id VARCHAR(100),
  details JSONB,
  timestamp TIMESTAMPTZ
);
```

---

## Demo Flow (7 min)

1. **Baseline**: 200 accounts, auto-approvals flying by
2. **Fraud injection**: 12 accounts from same device, deposits $500-$2500, no trades, simultaneous withdrawals
3. **Detection**: First withdrawal blocked, ring detected <10s
4. **Investigation**: Officer sees full evidence, graph view, AI explanation
5. **Containment**: One-click lock all 12 accounts, $18.4K blocked
6. **Feedback**: Officer confirms fraud → system calibrates

---

## Metrics

- Auto-approval rate: 85-95%
- Fraud catch rate: >95%
- False positive rate: <5%
- Officer workload reduction: 80%
- Decision latency p95: <2s

---

## Security

- Payment data tokenized (no raw PAN)
- IPs/devices hashed
- Complete audit trail (actor, timestamp, justification)
- RBAC for officer/investigator/admin roles
- Model versioning for every decision

---

## Learning Loop

```python
# Officer confirms fraud/legit
feedback(case_id, label='confirmed_fraud')
  → Update reason code stats
  → Adjust thresholds (bounded changes)
  → Add case to retrieval memory (vector DB)
  → Audit calibration event
```

---

## Additional Project: Blockchain Compliance Engine

Companion system for crypto platforms:
- Real-time blockchain monitoring (Ethereum, Polygon, Arbitrum)
- Live regulatory updates (FATF, FCA, FinCEN)
- AI-powered obligation extraction
- Impact simulation for regulatory changes

**Tech**: FastAPI, Etherscan V2 API, Google Gemini, Next.js

---

## Deployment

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:14-alpine
  redis:
    image: redis:7-alpine
  backend:
    build: ./apps/backend
    environment:
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://...
      LLM_API_KEY: ...
```

**Production**: Railway, Render, or Vercel

---

## License

Hackathon Project - 2026
