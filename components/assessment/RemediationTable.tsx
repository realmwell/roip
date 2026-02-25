"use client";

import { MessageSquare } from "lucide-react";
import type { Remediation } from "@/lib/assessment-narrative";

interface RemediationTableProps {
  plan: Remediation[];
}

const priorityConfig = {
  high: { bg: "bg-red/10", text: "text-red", label: "High" },
  medium: { bg: "bg-amber/10", text: "text-amber", label: "Medium" },
  low: { bg: "bg-green/10", text: "text-green", label: "Low" },
};

const effortConfig = {
  low: { bg: "bg-green/10", text: "text-green", label: "Low" },
  medium: { bg: "bg-amber/10", text: "text-amber", label: "Medium" },
  high: { bg: "bg-red/10", text: "text-red", label: "High" },
};

export default function RemediationTable({ plan }: RemediationTableProps) {
  if (plan.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-fg">Remediation Plan</h3>
      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-muted/50">
                <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-fg">
                  Action
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-fg w-24">
                  Priority
                </th>
                <th className="text-center px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-fg w-24">
                  Effort
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-fg">
                  Expected Impact
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {plan.map((item, idx) => {
                const pConf = priorityConfig[item.priority];
                const eConf = effortConfig[item.effort];

                return (
                  <tr
                    key={idx}
                    className="border-b border-surface-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-fg font-medium">
                      {item.action}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pConf.bg} ${pConf.text}`}
                      >
                        {pConf.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${eConf.bg} ${eConf.text}`}
                      >
                        {eConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-fg">
                      {item.expectedImpact}
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={`/chat?q=${encodeURIComponent(item.chatQuery)}`}
                        className="text-blue hover:text-blue/80"
                        title="Ask about this"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
