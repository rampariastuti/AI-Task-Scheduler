"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface ChartData {
  name: string;
  tasks: number;
  completed?: number;
  accuracy?: number;
}

interface AnalyticsChartsProps {
  weeklyData: ChartData[];
  accuracyData: any[];
}

export const AnalyticsCharts = ({ weeklyData, accuracyData }: AnalyticsChartsProps) => {
  // TEMPORARY: Sample data for display
  const sampleWeeklyData = [
    { name: "Mon", tasks: 12 },
    { name: "Tue", tasks: 19 },
    { name: "Wed", tasks: 15 },
    { name: "Thu", tasks: 22 },
    { name: "Fri", tasks: 30 },
    { name: "Sat", tasks: 10 },
    { name: "Sun", tasks: 8 },
  ];

  const sampleAccuracyData = [
    { name: "Mon", accuracy: 65 },
    { name: "Tue", accuracy: 72 },
    { name: "Wed", accuracy: 68 },
    { name: "Thu", accuracy: 85 },
    { name: "Fri", accuracy: 92 },
    { name: "Sat", accuracy: 78 },
    { name: "Sun", accuracy: 70 },
  ];

  // Use real data if available, otherwise use sample data
  const displayWeeklyData = weeklyData?.some(d => d.tasks > 0) ? weeklyData : sampleWeeklyData;
  const displayAccuracyData = accuracyData?.some(d => d.accuracy > 0) ? accuracyData : sampleAccuracyData;

  const totalTasks = displayWeeklyData.reduce((acc, day) => acc + (day.tasks || 0), 0);
  const avgAccuracy = Math.round(displayAccuracyData.reduce((acc, day) => acc + (day.accuracy || 0), 0) / 7);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Task Completion Bar Chart */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Weekly Task Activity
          </h3>
          <span className="text-[10px] text-accent-primary bg-accent-primary/10 px-2 py-1 rounded-full">
            {totalTasks} total
          </span>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={displayWeeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              formatter={(value: any) => [`${value} tasks`, 'Created']}
            />
            <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Accuracy Area Chart */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            AI Efficiency
          </h3>
          <span className="text-[10px] text-accent-success bg-accent-success/10 px-2 py-1 rounded-full">
            {avgAccuracy}% avg
          </span>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={displayAccuracyData}>
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              formatter={(value: any) => [`${value}%`, 'Accuracy']}
            />
            <Area 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorAcc)" 
              strokeWidth={3} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};