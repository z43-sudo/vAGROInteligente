import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MetricCardProps } from '../types';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend, trendValue, icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${
            title.includes('Total') ? 'bg-yellow-100 text-yellow-700' :
            title.includes('Produtividade') ? 'bg-green-100 text-green-700' :
            title.includes('Máquinas') ? 'bg-emerald-100 text-emerald-700' :
            'bg-blue-100 text-blue-700'
        }`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {trend === 'up' && <ArrowUpRight size={16} className="text-green-600" />}
        {trend === 'down' && <ArrowDownRight size={16} className="text-green-600" />} 
        {/* Note: The screenshot uses green for positive outcomes even if it's 'down' for cost in some contexts, but here cost down is good. 
            However, screenshot shows Cost per Hectare -5% vs plan as Green. So Green is good. */}
        <span className="font-semibold text-green-600">{trendValue}</span>
        <span className="text-gray-400">{subtitle}</span>
      </div>
    </div>
  );
};

export default MetricCard;