"use client";

import AlertTable from "../../components/AlertTable";

export default function AlertsPage() {
    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-5xl font-extrabold mb-2">System Alerts</h1>
                    <p className="text-base text-[var(--text-tertiary)]">Review detected behavioral anomalies.</p>
                </div>
            </div>
            <AlertTable />
        </div>
    )
}
