"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const data = [
  { name: "Mon", tasks: 12 },
  { name: "Tue", tasks: 19 },
  { name: "Wed", tasks: 15 },
  { name: "Thu", tasks: 22 },
  { name: "Fri", tasks: 30 },
  { name: "Sat", tasks: 10 },
  { name: "Sun", tasks: 8 },
];

export const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Task Completion Bar Chart */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">Weekly Task Completion</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
            />
            <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Accuracy Area Chart */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-[400px]">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8">AI Prediction Accuracy (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};