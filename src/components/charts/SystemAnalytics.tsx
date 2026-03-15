"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const data = [
  { name: 'Mon', completed: 12, aiAccuracy: 88 },
  { name: 'Tue', completed: 19, aiAccuracy: 92 },
  { name: 'Wed', completed: 15, aiAccuracy: 85 },
  { name: 'Thu', completed: 22, aiAccuracy: 94 },
  { name: 'Fri', completed: 30, aiAccuracy: 91 },
  { name: 'Sat', completed: 10, aiAccuracy: 89 },
  { name: 'Sun', completed: 8, aiAccuracy: 95 },
];

export const SystemAnalytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Completion Bar Chart */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">Weekly Task Completion</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ color: '#6366F1' }}
              />
              <Bar dataKey="completed" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Accuracy Area Chart */}
      <div className="glass-panel p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">AI Prediction Accuracy (%)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#555" fontSize={12} hide />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="aiAccuracy" stroke="#22C55E" fillOpacity={1} fill="url(#colorAcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};