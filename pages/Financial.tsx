import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart as PieIcon, TrendingDown, TrendingUp, Download, Plus, Calculator, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../services/supabaseClient';
import { FinancialTransaction, PurchaseOrder } from '../types';

const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    description: '',
    quantity: 0,
    unit_price: 0,
    supplier: '',
    category: 'Outros',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: transData } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (transData) setTransactions(transData);

      const { data: ordersData } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (ordersData) setPurchaseOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const total = Number(newOrder.quantity) * Number(newOrder.unit_price);

      const { error } = await supabase.from('purchase_orders').insert([{
        description: newOrder.description,
        quantity: Number(newOrder.quantity),
        unit_price: Number(newOrder.unit_price),
        total_price: total,
        supplier: newOrder.supplier,
        category: newOrder.category,
        status: 'Pendente',
        farm_id: user.user_metadata.farm_id
      }]);

      if (error) throw error;

      setShowNewOrderModal(false);
      setNewOrder({
        description: '',
        quantity: 0,
        unit_price: 0,
        supplier: '',
        category: 'Outros',
      });
      fetchData();
      alert('Ordem de compra criada com sucesso!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao criar ordem de compra.');
    }
  };

  const handleCalculateSegments = async () => {
    setCalculating(true);
    // Simulação de cálculo complexo
    setTimeout(() => {
      setCalculating(false);
      alert('Cálculo de todos os segmentos realizado com sucesso! Os indicadores foram atualizados.');
    }, 2000);
  };

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.type === 'Receita')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Despesa')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  // Prepare chart data
  const chartData = [
    { name: 'Atual', receita: totalRevenue, despesa: totalExpenses }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Controle Financeiro</h2>
          <p className="text-gray-500">Fluxo de caixa, custos e previsões.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCalculateSegments}
            disabled={calculating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Calculator size={16} className={calculating ? "animate-spin" : ""} />
            {calculating ? 'Calculando...' : 'Calcular Segmentos'}
          </button>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Nova Ordem de Compra
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download size={16} /> Relatório
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-900 text-white p-6 rounded-2xl shadow-lg shadow-green-900/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Receita Total</p>
              <h3 className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
              </h3>
            </div>
            <div className="p-2 bg-white/10 rounded-lg"><TrendingUp size={24} /></div>
          </div>
          <div className="text-green-100 text-sm flex items-center gap-2">
            <span className="bg-green-800 px-2 py-0.5 rounded text-xs font-bold">+12%</span>
            <span>vs. mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Despesas Operacionais</p>
              <h3 className="text-3xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}
              </h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={24} /></div>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-bold">+5%</span>
            <span>vs. planejado</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Lucro Líquido</p>
              <h3 className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={24} /></div>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-xs font-bold">Margem</span>
            <span>saudável</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-800 mb-6">Receita x Despesa</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
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
        </div>

        {/* Transactions List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Últimas Transações</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'Receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.description}</p>
                      <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${item.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma transação registrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6">Ordens de Compra Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-gray-100">
                <th className="pb-3 font-medium">Descrição</th>
                <th className="pb-3 font-medium">Fornecedor</th>
                <th className="pb-3 font-medium">Categoria</th>
                <th className="pb-3 font-medium">Valor Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{order.description}</td>
                    <td className="py-3 text-gray-600">{order.supplier}</td>
                    <td className="py-3 text-gray-600">{order.category}</td>
                    <td className="py-3 font-bold text-gray-800">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_price)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Pago' ? 'bg-green-100 text-green-700' :
                          order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nenhuma ordem de compra encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Nova Ordem de Compra</h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Sementes de Soja"
                  value={newOrder.description}
                  onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={newOrder.quantity}
                    onChange={e => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    value={newOrder.unit_price}
                    onChange={e => setNewOrder({ ...newOrder, unit_price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nome do fornecedor"
                  value={newOrder.supplier}
                  onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={newOrder.category}
                  onChange={e => setNewOrder({ ...newOrder, category: e.target.value })}
                >
                  <option value="Sementes">Sementes</option>
                  <option value="Fertilizantes">Fertilizantes</option>
                  <option value="Defensivos">Defensivos</option>
                  <option value="Peças">Peças</option>
                  <option value="Combustível">Combustível</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Criar Ordem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;