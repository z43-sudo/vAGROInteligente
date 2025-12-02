import React, { useState } from 'react';
import { Sprout, Calendar, ArrowUpRight, Filter, Download, Plus, X } from 'lucide-react';
import { Crop } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../contexts/AppContext';

const Crops: React.FC = () => {
  const { crops, addCrop } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrop, setNewCrop] = useState<Partial<Crop>>({
    name: '',
    area: '',
    stage: 'Vegetativo',
    progress: 0,
    daysToHarvest: 0,
    status: 'active'
  });

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
  // Dados vazios para estado inicial
  const data: any[] = [];

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

      {/* Stats */}
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

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
        <h3 className="font-bold text-gray-800 mb-6">Histórico de Produção (sacas)</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSoja" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166534" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMilho" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ca8a04" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="so" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorSoja)" name="Soja" />
              <Area type="monotone" dataKey="mi" stroke="#ca8a04" strokeWidth={3} fillOpacity={1} fill="url(#colorMilho)" name="Milho" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Sprout size={48} className="mb-4 opacity-20" />
            <p>Nenhum dado histórico disponível</p>
          </div>
        )}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {crops.length > 0 ? (
                crops.map((crop, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{crop.name}</td>
                    <td className="px-6 py-4">Soja Intacta</td> {/* Placeholder for now as Crop type might need update */}
                    <td className="px-6 py-4">{crop.area}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">{crop.stage}</span></td>
                    <td className="px-6 py-4">--/--/----</td>
                    <td className="px-6 py-4 flex items-center gap-1 text-green-600 font-medium"><div className="w-2 h-2 rounded-full bg-green-500"></div> {crop.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma safra cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Safra */}
      {
        isModalOpen && (
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
        )
      }
    </div >
  );
};

export default Crops;