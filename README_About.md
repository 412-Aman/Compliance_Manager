# AI Compliance Manager 🛡️

## Overview
The **AI Compliance Manager** is a state-of-the-art, real-time monitoring and regulatory intelligence platform designed for the crypto industry. It bridges the gap between complex on-chain transaction data and human-readable compliance intelligence using Advanced AI (Google Gemini).

The platform provides compliance officers with a "Command Center" to monitor customer risk, detect behavioral anomalies, and stay ahead of global regulatory changes.

---

## 🚀 Key Features

### 1. **Live Transaction Guard**
- **Real-time Monitoring**: Connects directly to Ethereum, Polygon, and Arbitrum via Etherscan V2 APIs.
- **Automated Ingestion**: A background worker continuously polls for new transactions for all monitored customer addresses.
- **Visual Status**: Instant feedback on customer activity (🟢 ACTIVE, 🟡 PENDING, ⚪ IDLE).

### 2. **AI-Driven Anomaly Detection**
- **Smart Scoring**: Uses robust Z-score analysis (Median Absolute Deviation) to detect amount spikes and velocity surges.
- **AI Analysis**: Every alert is analyzed by Google Gemini to provide a human-readable **Explanation** and **Actionable Compliance Advice**.
- **Dynamic Fallbacks**: In case of API limits, the system generates deep heuristic explanations to ensure zero-blind-spot monitoring.

### 3. **Regulatory Radar 📡**
- **Global Scrapers**: Automatically tracks updates from the FCA (UK), FinCEN (US), FATF, and MFSA.
- **AI Summarization**: Converts dense, complex legal documents into concise summaries and key obligations.
- **Impact Simulation**: Allows compliance teams to "test drive" proposed regulatory changes against historic data to predict alert volume increases.

### 4. **Compliance Command Center**
- **Real-time Notifications**: Instant alert delivery via WebSockets (Toast notifications).
- **Audit Logging**: Every action—from polling to manual alert review—is recorded in a permanent audit trail.
- **Customer 360**: Deep-dive views of customer addresses, including full transaction history and risk profiles.

---

## 🏗️ Technical Architecture

### **Frontend** (apps/web)
- **Framework**: React + Vite
- **Styling**: Vanilla CSS with modern "Glassmorphism" aesthetics.
- **Real-time**: Custom WebSocket hooks for live alert streaming.
- **Icons**: Lucide-React for a premium, accessible interface.

### **Backend** (apps/backend)
- **Framework**: FastAPI (Asynchronous Python)
- **Database**: SQLAlchemy + SQLite (Local) / PostgreSQL (Optional)
- **AI Engine**: Google Gemini 2.0 Flash (with dynamic fallback logic).
- **Blockchain**: Etherscan API V2 integration for multi-chain support.

---

## 🔄 How It Works (The Lifecycle)

1. **Add Customer**: A user adds a wallet address (ETH/Polygon/Arbitrum).
2. **Auto-Poll**: The background worker detects a new transaction on-chain.
3. **Analyze**: The scoring engine calculates a risk score based on historical behavior.
4. **AI Consult**: If suspicious, Gemini analyzes the "Drivers" (velocity, amount, etc.) and writes a report.
5. **Alert**: A notification pops up on the dashboard in real-time.
6. **Remediate**: The officer reviews the AI advice and confirms or dismisses the threat.

---

## 🛠️ Notable Highlights for Hackathon
- **V2 Migration**: Fully migrated to Etherscan API V2 for future-proof blockchain data.
- **Deployment Ready**: Includes `Procfile`, `vercel.json`, and `railway.json` for one-click deployment.
- **Resilient AI**: Implements custom rate-limiting and dynamic heuristic generation to handle AI API quotas gracefully.
