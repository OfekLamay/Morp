import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataItem[];
  title: string;
  height?: number;
}

export default function CustomPieChart({ data, title, height = 300 }: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <div className="grid-card p-5 h-full">
      <h2 className="text-lg font-medium text-foreground mb-4">{title}</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} (${((value/total)*100).toFixed(1)}%)`, 'Count']}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                borderColor: '#e2e8f0',
                color: '#1e293b',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '8px 12px',
                fontWeight: 500
              }}
              itemStyle={{
                color: '#64748b'
              }}
              labelStyle={{
                fontWeight: 600,
                color: '#0f172a'
              }}
            />
            <Legend 
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ 
                paddingLeft: '20px', 
                fontSize: '12px', 
                color: 'hsl(var(--muted-foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
