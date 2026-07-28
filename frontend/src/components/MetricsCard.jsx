import React from 'react';

const MetricsCard = ({ title, value, icon, trend, colorClass = "text-primary" }) => {
  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${colorClass}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default MetricsCard;
