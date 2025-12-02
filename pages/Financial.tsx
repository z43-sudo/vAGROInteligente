import React from 'react';
import { DollarSign, PieChart as PieIcon, TrendingDown, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Financial: React.FC = () => {
  // Dados vazios para estado inicial
  const data: any[] = [];
  const transactions: any[] = [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle Financeiro</h2>
          <p className="text-gray-500">Fluxo de caixa, custos e previsões.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <Download size={16} /> Relatório Fiscal
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-900 text-white p-6 rounded-2xl shadow-lg shadow-green-900/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Receita Total</p>
              <h3 className="text-3xl font-bold">R$ 0,00</h3>
            </div>
            <div className="p-2 bg-white/10 rounded-lg"><TrendingUp size={24} /></div>
          </div>
          <div className="text-green-100 text-sm flex items-center gap-2">
            <span className="bg-green-800 px-2 py-0.5 rounded text-xs font-bold">+0%</span>
            <span>vs. ano anterior</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Despesas Operacionais</p>
              <h3 className="text-3xl font-bold text-gray-800">R$ 0,00</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={24} /></div>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold">+0%</span>
            <span>vs. planejado</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Lucro Líquido</p>
              <h3 className="text-3xl font-bold text-gray-800">R$ 0,00</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold">+0%</span>
            <span>Margem saudável</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-800 mb-6">Receita x Despesa (Semestral)</h3>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="receita" name="Receita" fill="#166534" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <DollarSign size={48} className="mb-4 opacity-20" />
              <p>Nenhum dado financeiro disponível</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Últimas Transações</h3>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'Receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${item.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.val}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma transação recente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;