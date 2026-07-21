'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie';
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
  height?: number;
  pieNameKey?: string;
  pieValueKey?: string;
}

const DEFAULT_COLORS = [
  '#06b6d4', // Cyan (Primary)
  '#10b981', // Emerald (Medical/Accent)
  '#eab308', // Yellow
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f97316', // Orange
];

export function ReportChart({
  data,
  type,
  xKey,
  yKeys = [],
  colors = DEFAULT_COLORS,
  height = 300,
  pieNameKey,
  pieValueKey,
}: ReportChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border border-dashed rounded-lg bg-card/50" 
        style={{ height }}
      >
        <span className="text-sm text-muted-foreground">No hay datos disponibles para mostrar</span>
      </div>
    );
  }

  // Common Tooltip Styles
  const tooltipContentStyle = {
    backgroundColor: 'var(--color-dark-900)',
    border: '1px solid var(--color-dark-800)',
    borderRadius: '8px',
    color: 'var(--color-dark-50)',
  };

  if (type === 'bar') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-800)" />
            <XAxis 
              dataKey={xKey} 
              stroke="var(--color-dark-500)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--color-dark-500)" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-800)" />
            <XAxis 
              dataKey={xKey} 
              stroke="var(--color-dark-500)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--color-dark-500)" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            {yKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]} 
                strokeWidth={2}
                activeDot={{ r: 6 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie' && pieNameKey && pieValueKey) {
    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={pieValueKey}
              nameKey={pieNameKey}
              label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
