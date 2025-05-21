import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  lines: {
    id: string;
    name: string;
    color: string;
  }[];
  height?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export default function CustomLineChart({ 
  data, 
  title, 
  lines, 
  height = 300, 
  yAxisLabel, 
  xAxisLabel 
}: LineChartProps) {
  return (
    <div className="grid-card p-5 h-full">
      <h2 className="text-lg font-medium  mb-4">{title}</h2>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              label={xAxisLabel ? {
                value: xAxisLabel,
                position: 'insideBottomRight',
                offset: -10,
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              } : undefined}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              label={yAxisLabel ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              } : undefined}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                color: '#000'
              }}
              itemStyle={{ color: '#000' }}
              labelStyle={{ color: '#000', fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '10px', 
                fontSize: '12px', 
                color: '#000'
              }}
              formatter={(value) => <span style={{ color: '#000' }}>{value}</span>}
            />
            {lines.map((line) => (
              <Line
                key={line.id}
                type="monotone"
                dataKey={line.id}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
