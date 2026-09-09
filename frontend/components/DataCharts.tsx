"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { BarChart3, PieChart as PieIcon } from "lucide-react";

interface DataChartsProps {
  charts: Array<{
    id: string;
    title: string;
    type: 'bar' | 'pie';
    xAxisKey?: string;
    data: Array<any>;
  }>;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export default function DataCharts({ charts }: DataChartsProps) {
  if (!charts || charts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-white">Extracted Data & Visualizations</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map((chart) => (
          <div key={chart.id} className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
            <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center justify-between">
              <span>{chart.title}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {chart.type} chart
              </span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                    >
                      {chart.data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                    />
                  </PieChart>
                ) : (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey={chart.xAxisKey || 'category'} stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#FFF' }}
                    />
                    {Object.keys(chart.data[0] || {})
                      .filter(k => k !== (chart.xAxisKey || 'category') && k !== 'unit')
                      .map((key, idx) => (
                        <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
