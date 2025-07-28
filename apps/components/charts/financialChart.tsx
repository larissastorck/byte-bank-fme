import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
interface FinancialData {
  name: string;
  valor: number;
}

const FinancialChart: React.FC = () => {
  const data: FinancialData[] = [
    { name: "Jan", valor: 1200 },
    { name: "Fev", valor: 2100 },
    { name: "Mar", valor: 800 },
    { name: "Abr", valor: 1600 },
    { name: "Mai", valor: 900 },
    { name: "Jun", valor: 1700 },
  ];

  return (
    <div className="w-full h-64" role="region" aria-labelledby="financial-chart-heading">
      <h3 id="financial-chart-heading" className="sr-only">
        Gráfico financeiro: valores mensais de Janeiro a Junho
      </h3>

      <div 
        role="img" 
        aria-label="Gráfico de linha mostrando a variação de valores de Janeiro a Junho" 
        className="w-full h-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#374151", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: "#374151", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={{ stroke: "#d1d5db" }}
              tickMargin={10}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip 
              formatter={(value) => [`R$ ${value}`, 'Valor']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ 
                stroke: "#10b981", 
                strokeWidth: 2, 
                r: 4,
                fill: '#ffffff'
              }}
              activeDot={{ 
                r: 6,
                stroke: "#10b981",
                strokeWidth: 2,
                fill: '#ffffff'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;