import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TrendingUp, Tractor, DollarSign, CloudSun, Droplets, Wind, Plus, FileText, Bug, Truck, ChevronRight, CheckCircle2, AlertTriangle, Clock, Calendar, MapPin as MapPinIcon, Trash2, AlertCircle, Edit2, Save, X } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { Crop, Machine, Activity } from '../types';
import { generateFarmInsight } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';
import WhatsAppButton from '../components/WhatsAppButton';
import { useGeolocation } from '../hooks/useGeolocation';
import { getCurrentWeather, WeatherData } from '../services/weatherService';

const Dashboard: React.FC = () => {
  const { activities, updateActivity, deleteActivity, machines: fleetFromContext, currentUser, crops, clearAllData } = useApp();
  const [insight, setInsight] = useState<string>('');
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Activity Editing State
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editActivityForm, setEditActivityForm] = useState<Partial<Activity>>({});

  const startEditingActivity = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setEditActivityForm(activity);
  };

  const cancelEditingActivity = () => {
    setEditingActivityId(null);
    setEditActivityForm({});
  };

  const handleUpdateActivity = async () => {
    if (editingActivityId && editActivityForm) {
      await updateActivity(editingActivityId, editActivityForm);
      setEditingActivityId(null);
      setEditActivityForm({});
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      await deleteActivity(id);
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (location) {
        const data = await getCurrentWeather(undefined, undefined, location.latitude, location.longitude);
        setWeather(data);
      } else if (!geoLoading && !location) {
        // Fallback if no location permission or error, maybe fetch default
        const data = await getCurrentWeather();
        setWeather(data);
      }
    };
    fetchWeather();
  }, [location, geoLoading]);

  // Get current date formatted in Portuguese

  // Get current date formatted in Portuguese
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  // Get first name
  const firstName = currentUser?.name?.split(' ')[0] || 'Usuário';

  // Real-time clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Determine greeting based on time
  const hour = time.getHours();
  let greeting = 'Bom dia';
  if (hour >= 12 && hour < 18) {
    greeting = 'Boa tarde';
  } else if (hour >= 18) {
    greeting = 'Boa noite';
  }

  useEffect(() => {
    // Simulate AI loading insight
    const fetchInsight = async () => {
      const context = {
        date: formattedDate,
        productivity: '62 sc/ha (+8%)',
        machines: '8/12 operating',
        weather: '28C, rain forecasted'
      };
      try {
        const text = await generateFarmInsight(context);
        setInsight(text);
      } catch (e) {
        // Silently fail or set default
      }
    };
    // fetchInsight(); // Disabled to avoid API key usage without setup, relying on static "Good morning"
  }, [formattedDate]);



  // Usar máquinas do contexto se houver, senão array vazio
  const fleet: Machine[] = fleetFromContext.length > 0 ? fleetFromContext : [];

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      setShowClearModal(false);
      alert('✅ Todos os dados foram limpos com sucesso!');
    } catch (error) {
      alert('❌ Erro ao limpar dados. Tente novamente.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {greeting}, {firstName}! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-gray-500 mt-1">Aqui está o resumo da sua fazenda hoje, {formattedDate}.</p>
          {insight && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl text-green-800 text-sm flex items-start gap-2">
              <div className="bg-white p-1 rounded-full shadow-sm"><Sprout size={14} /></div>
              <div><span className="font-semibold">Insight AI:</span> {insight}</div>
            </div>
          )}
        </div>
        <div className="text-right hidden md:block">
          <div className="flex items-center gap-2 text-gray-500 mb-1 justify-end">
            <Clock size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Horário de Brasília</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight">{timeString}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Área Total Plantada"
          value="0 ha"
          subtitle="vs. safra anterior"
          trend="neutral"
          trendValue=""
          icon={<Sprout size={24} />}
        />
        <MetricCard
          title="Produtividade Média"
          value="0 sc/ha"
          subtitle="acima da meta"
          trend="neutral"
          trendValue=""
          icon={<TrendingUp size={24} />}
        />
        <MetricCard
          title="Máquinas Operando"
          value={`${fleet.filter(m => m.status === 'Operando').length}/${fleet.length}`}
          subtitle={fleet.filter(m => m.status === 'Manutenção').length > 0 ? `${fleet.filter(m => m.status === 'Manutenção').length} em manutenção` : 'Nenhuma em manutenção'}
          trend="neutral"
          trendValue=""
          icon={<Tractor size={24} />}
        />
        <MetricCard
          title="Custo por Hectare"
          value="R$ 0"
          subtitle="vs. planejado"
          trend="neutral"
          trendValue=""
          icon={<DollarSign size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Crops Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-500"><Sprout size={20} /></span>
              <h3 className="font-bold text-gray-800 text-lg">Safras em Andamento</h3>
            </div>

            <div className="space-y-6">
              {crops.map((crop) => (
                <div key={crop.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100/50 hover:border-green-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                        <LeafIcon stage={crop.stage} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{crop.name}</h4>
                        <p className="text-sm text-gray-500">{crop.area}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${crop.stage === 'Floração' ? 'bg-green-100 text-green-700' :
                      crop.stage === 'Enchimento' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                      {crop.stage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Progresso</span>
                    <span className="font-semibold text-gray-700">{crop.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-green-700 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${crop.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-400">~{crop.daysToHarvest} dias para colheita</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-green-700" />
                <h3 className="font-bold text-gray-800 text-lg">Atividades Recentes</h3>
              </div>
              <Link to="/atividades" className="text-sm text-green-700 hover:text-green-800 font-medium">Ver todas</Link>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium mb-2">Nenhuma atividade registrada</p>
                  <p className="text-sm text-gray-400 mb-4">Comece criando uma nova atividade</p>
                  <Link
                    to="/nova-atividade"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Nova Atividade
                  </Link>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'irrigation' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'maintenance' ? 'bg-green-50 text-green-600' :
                        activity.type === 'alert' ? 'bg-orange-50 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {activity.type === 'irrigation' && <Droplets size={20} />}
                      {activity.type === 'maintenance' && <Tractor size={20} />}
                      {activity.type === 'alert' && <Bug size={20} />}
                      {activity.type === 'harvest' && <Calendar size={20} />}
                    </div>

                    <div className="flex-1">
                      {editingActivityId === activity.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editActivityForm.title || ''}
                            onChange={(e) => setEditActivityForm({ ...editActivityForm, title: e.target.value })}
                            className="w-full border rounded px-2 py-1 text-sm font-bold text-gray-800"
                            placeholder="Título"
                          />
                          <input
                            type="text"
                            value={editActivityForm.description || ''}
                            onChange={(e) => setEditActivityForm({ ...editActivityForm, description: e.target.value })}
                            className="w-full border rounded px-2 py-1 text-xs text-gray-500"
                            placeholder="Descrição"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={editActivityForm.status}
                              onChange={(e) => setEditActivityForm({ ...editActivityForm, status: e.target.value as any })}
                              className="border rounded px-2 py-1 text-xs"
                            >
                              <option value="Em andamento">Em andamento</option>
                              <option value="Concluído">Concluído</option>
                              <option value="Urgente">Urgente</option>
                              <option value="Agendado">Agendado</option>
                            </select>
                            <div className="flex gap-1 ml-auto">
                              <button onClick={handleUpdateActivity} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14} /></button>
                              <button onClick={cancelEditingActivity} className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"><X size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 text-sm">{activity.title}</h4>
                            <div className="flex items-center gap-2">
                              <ActivityBadge status={activity.status} />
                              <div className="hidden group-hover:flex gap-1">
                                <button
                                  onClick={() => startEditingActivity(activity)}
                                  className="text-blue-500 hover:text-blue-700 bg-white shadow-sm p-1 rounded-full border border-gray-100"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-red-500 hover:text-red-700 bg-white shadow-sm p-1 rounded-full border border-gray-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">

          {/* Weather Widget */}
          <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100">
            <div className="flex items-center gap-2 mb-4">
              <CloudSun className="text-sky-600" size={20} />
              <h3 className="font-bold text-gray-800">Clima Hoje</h3>
            </div>

            {weather ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-start">
                      <span className="text-5xl font-bold text-gray-800">{weather.temperature}°</span>
                      <span className="text-2xl text-gray-500 mt-1 ml-1">C</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 capitalize">{weather.condition}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPinIcon size={12} /> {weather.location}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                      <Droplets size={14} className="text-sky-500" />
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                      <Wind size={14} className="text-sky-500" />
                      <span>{weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                {/* Forecast placeholder or simplified forecast if available in dashboard context, 
                    for now keeping static or removing since we only fetched current weather here. 
                    Let's keep a simple static forecast or remove it to avoid confusion if it doesn't match.
                    The user asked to update "Clima da dashboard", so let's try to keep the layout but maybe static for forecast 
                    unless we fetch it too. For simplicity and speed, I'll fetch forecast too or just leave static for now 
                    but the prompt implies "update". Let's just show current weather details well.
                */}
                <div className="text-center">
                  <Link to="/clima" className="text-sm text-sky-600 font-medium hover:underline">Ver previsão completa</Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                {geoLoading ? <p className="text-gray-500">Obtendo localização...</p> : <p className="text-gray-500">Carregando clima...</p>}
                {geoError && <p className="text-xs text-red-400 mt-2">{geoError}</p>}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-6">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/nova-atividade" className="bg-green-700 hover:bg-green-800 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Plus size={20} />
                <span className="text-xs font-semibold">Nova Atividade</span>
              </Link>
              <Link to="/relatorios" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <FileText size={20} className="text-green-700" />
                <span className="text-xs font-semibold">Relatório</span>
              </Link>
              <Link to="/irrigacao" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Droplets size={20} className="text-green-700" />
                <span className="text-xs font-semibold">Irrigação</span>
              </Link>
              <Link to="/alertas-pragas" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Bug size={20} className="text-green-700" />
                <span className="text-xs font-semibold">Alerta Pragas</span>
              </Link>
              <Link to="/maquinas" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Tractor size={20} className="text-green-700" />
                <span className="text-xs font-semibold">Máquina</span>
              </Link>
              <Link to="/transporte" className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors">
                <Truck size={20} className="text-green-700" />
                <span className="text-xs font-semibold">Transporte</span>
              </Link>
              <button
                onClick={() => setShowClearModal(true)}
                className="bg-white hover:bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors col-span-2"
              >
                <Trash2 size={20} />
                <span className="text-xs font-semibold">Limpar Dados</span>
              </button>
            </div>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tractor size={20} className="text-green-700 text-bold" />
                <h3 className="font-bold text-gray-800 text-lg">Status da Frota</h3>
              </div>
              <button className="text-sm text-green-700 hover:text-green-800 font-medium">Ver todas</button>
            </div>

            <div className="space-y-4">
              {fleet.map(machine => (
                <div key={machine.id} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-stone-200 p-2 rounded-lg text-stone-600">
                        <Tractor size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{machine.name}</h4>
                        <MachineBadge status={machine.status} />
                      </div>
                    </div>
                    <div className="text-gray-400">
                      {machine.status === 'Operando' && <CheckCircle2 size={18} className="text-green-500" />}
                      {machine.status === 'Manutenção' && <AlertTriangle size={18} className="text-orange-500" />}
                      {machine.status === 'Parado' && <Clock size={18} />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 ml-12">{machine.type}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal de Confirmação de Limpeza */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Limpar Todos os Dados?</h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-semibold mb-2">⚠️ ATENÇÃO: Esta ação é irreversível!</p>
              <p className="text-sm text-red-700">
                Todos os seus dados serão permanentemente deletados:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4">
                <li>• Todas as atividades</li>
                <li>• Todas as safras</li>
                <li>• Todas as máquinas</li>
                <li>• Todo o gado/pecuária</li>
                <li>• Todo o estoque</li>
                <li>• Todos os membros da equipe</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Sim, Limpar Tudo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

// Helper Components for Dashboard
const LeafIcon = ({ stage }: { stage: string }) => {
  return <Sprout size={20} />;
};

const ActivityBadge = ({ status }: { status: string }) => {
  let styles = '';
  switch (status) {
    case 'Em andamento': styles = 'bg-blue-100 text-blue-700 border border-blue-200'; break;
    case 'Concluído': styles = 'bg-green-100 text-green-700 border border-green-200'; break;
    case 'Urgente': styles = 'bg-orange-100 text-orange-700 border border-orange-200'; break;
    case 'Agendado': styles = 'bg-gray-100 text-gray-700 border border-gray-200'; break;
    default: styles = 'bg-gray-100 text-gray-700';
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${styles}`}>{status}</span>;
}

const MachineBadge = ({ status }: { status: string }) => {
  let styles = '';
  switch (status) {
    case 'Operando': styles = 'bg-green-100 text-green-700'; break;
    case 'Manutenção': styles = 'bg-orange-100 text-orange-700'; break;
    case 'Parado': styles = 'bg-gray-200 text-gray-700'; break;
    default: styles = 'bg-gray-100 text-gray-700';
  }
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${styles}`}>{status}</span>;
}

export default Dashboard;