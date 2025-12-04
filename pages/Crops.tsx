import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, Filter, Download, Plus, X, TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import { Crop } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { fetchCommodityPrices, fetchPriceHistory, calculateMarketInsights, CommodityPrice, HistoricalPrice } from '../services/commodityService';

const Crops: React.FC = () => {
  const { crops, addCrop, deleteCrop } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Preços das commodities (agora com 6 commodities)
  const [commodityPrices, setCommodityPrices] = useState<CommodityPrice[]>([]);

  // Dados históricos para o gráfico (últimos 30 dias)
  const [priceHistory, setPriceHistory] = useState<HistoricalPrice[]>([]);

  const [newCrop, setNewCrop] = useState<Partial<Crop>>({
    name: '',
    area: '',
    stage: 'Vegetativo',
    progress: 0,
    daysToHarvest: 0,
    status: 'active'
  });

  // Carregar preços ao montar o componente
  useEffect(() => {
    loadPrices();
    loadHistory();
  }, []);

  // Atualizar preços a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadPrices();
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const loadPrices = async () => {
    try {
      const prices = await fetchCommodityPrices();
      setCommodityPrices(prices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar preços:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await fetchPriceHistory();
      setPriceHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const refreshPrices = async () => {
    setLoading(true);
    await loadPrices();
    setLoading(false);
  };

  const handleExport = () => {
    const headers = ['Nome', 'Área', 'Estágio', 'Progresso', 'Dias para Colheita', 'Status'];
    const csvContent = [
      headers.join(','),
      ...crops.map(crop => [
        crop.name,
        crop.area,
        crop.stage,
        crop.progress,
        crop.daysToHarvest,
        crop.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'safras.csv';
    link.click();
  };

  const handleSave = () => {
    if (newCrop.name && newCrop.area) {
      addCrop({
        id: Date.now().toString(),
        name: newCrop.name,
        area: newCrop.area,
        stage: newCrop.stage as any,
        progress: Number(newCrop.progress) || 0,
        daysToHarvest: Number(newCrop.daysToHarvest) || 0,
        status: 'active'
      } as Crop);
      setIsModalOpen(false);
      setNewCrop({
        name: '',
        area: '',
        stage: 'Vegetativo',
        progress: 0,
        daysToHarvest: 0,
        status: 'active'
      });
    }
  };

  const getColorClasses = (color: string) => {
    const colors: any = {
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    };
    return colors[color] || colors.green;
  };

  // Calcular insights do mercado
  const marketInsights = commodityPrices.length > 0 ? calculateMarketInsights(commodityPrices) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Safras</h2>
          <p className="text-gray-500">Acompanhamento detalhado do plantio à colheita.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-lg hover:bg-green-900"
          >
            <Plus size={16} /> Nova Safra
          </button>
        </div>
      </div>

      {/* PAINEL DE COTAÇÕES EM TEMPO REAL */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Cotações em Tempo Real</h3>
                <p className="text-green-100 text-sm">Preços atualizados do mercado agrícola</p>
              </div>
            </div>
            <button
              onClick={refreshPrices}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>
          <div className="mt-4 text-sm text-green-100">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Cards de Preços */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {commodityPrices.map((commodity, idx) => {
              const colors = getColorClasses(commodity.color);
              const isPositive = commodity.change >= 0;

              return (
                <div
                  key={idx}
                  className={`${colors.bg} border ${colors.border} rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{commodity.icon}</span>
                      <span className={`font-bold ${colors.text}`}>{commodity.name}</span>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="text-green-600" size={20} />
                    ) : (
                      <TrendingDown className="text-red-600" size={20} />
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="text-3xl font-bold text-gray-800">
                      R$ {commodity.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{commodity.unit}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{commodity.change.toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isPositive ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráfico de Histórico de Preços */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-700" />
              Histórico de Preços - Últimos 30 Dias
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                  tickFormatter={(value) => `R$ ${Math.round(value)}`}
                />
                <Tooltip
                  formatter={(value: any) => `R$ ${Math.round(value)}`}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '12px',
                    backgroundColor: 'white'
                  }}
                  itemStyle={{
                    color: '#374151',
                    fontWeight: '500'
                  }}
                  labelStyle={{
                    color: '#6b7280',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="soja"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Soja (R$/sc)"
                />
                <Line
                  type="monotone"
                  dataKey="milho"
                  stroke="#eab308"
                  strokeWidth={3}
                  dot={{ fill: '#eab308', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Milho (R$/sc)"
                />
                <Line
                  type="monotone"
                  dataKey="cafe"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Café (R$/sc)"
                />
                <Line
                  type="monotone"
                  dataKey="algodao"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Algodão (R$/@)"
                />
                <Line
                  type="monotone"
                  dataKey="feijao"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: '#dc2626', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Feijão (R$/sc)"
                />
                <Line
                  type="monotone"
                  dataKey="trigo"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Trigo (R$/sc)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Insights do Mercado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={18} />
                <span className="text-sm font-semibold text-gray-700">Maior Alta</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {marketInsights?.highestGain.name || 'N/A'}
              </div>
              <div className="text-sm text-green-600 font-medium">
                +{marketInsights?.highestGain.changePercent.toFixed(2)}% hoje
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="text-red-600" size={18} />
                <span className="text-sm font-semibold text-gray-700">Maior Baixa</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {marketInsights?.lowestGain.name || 'N/A'}
              </div>
              <div className="text-sm text-red-600 font-medium">
                {marketInsights?.lowestGain.changePercent.toFixed(2)}% hoje
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-blue-600" size={18} />
                <span className="text-sm font-semibold text-gray-700">Volatilidade</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {marketInsights?.volatility || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">
                {marketInsights?.volatility === 'Alta' ? 'Mercado instável' :
                  marketInsights?.volatility === 'Moderada' ? 'Mercado estável' :
                    'Mercado muito estável'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats de Produção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Sprout size={20} /></div>
            <span className="text-sm text-gray-500 font-medium">Soja Estimada</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-800">0 sc</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              - 0%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Sprout size={20} /></div>
            <span className="text-sm text-gray-500 font-medium">Milho Estimado</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-800">0 sc</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
              - 0%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Calendar size={20} /></div>
            <span className="text-sm text-gray-500 font-medium">Próxima Colheita</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-800">--/--</h3>
            <span className="text-sm text-gray-500">Sem previsão</span>
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Detalhamento por Talhão</h3>
          <button className="text-gray-500 hover:text-gray-700"><Filter size={20} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Talhão</th>
                <th className="px-6 py-4">Cultura</th>
                <th className="px-6 py-4">Área</th>
                <th className="px-6 py-4">Estágio</th>
                <th className="px-6 py-4">Data Plantio</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {crops.length > 0 ? (
                crops.map((crop, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{crop.name}</td>
                    <td className="px-6 py-4">Soja Intacta</td>
                    <td className="px-6 py-4">{crop.area}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">{crop.stage}</span></td>
                    <td className="px-6 py-4">--/--/----</td>
                    <td className="px-6 py-4 flex items-center gap-1 text-green-600 font-medium"><div className="w-2 h-2 rounded-full bg-green-500"></div> {crop.status}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja deletar esta safra?')) {
                            deleteCrop(crop.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Deletar safra"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma safra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Safra */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nova Safra</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Talhão/Safra</label>
                <input
                  type="text"
                  value={newCrop.name}
                  onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: Talhão A - Soja"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área (ha)</label>
                <input
                  type="text"
                  value={newCrop.area}
                  onChange={e => setNewCrop({ ...newCrop, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: 150 ha"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estágio</label>
                  <select
                    value={newCrop.stage}
                    onChange={e => setNewCrop({ ...newCrop, stage: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Vegetativo">Vegetativo</option>
                    <option value="Floração">Floração</option>
                    <option value="Enchimento">Enchimento</option>
                    <option value="Maturação">Maturação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dias p/ Colheita</label>
                  <input
                    type="number"
                    value={newCrop.daysToHarvest}
                    onChange={e => setNewCrop({ ...newCrop, daysToHarvest: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progresso (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newCrop.progress}
                  onChange={e => setNewCrop({ ...newCrop, progress: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="text-right text-sm text-gray-500 mt-1">{newCrop.progress}%</div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800 transition-colors mt-4"
              >
                Salvar Safra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;