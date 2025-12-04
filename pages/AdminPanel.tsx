import React, { useState, useEffect } from 'react';
import {
    Shield, Users, Search, Filter, Edit2, Save, X,
    CheckCircle, XCircle, Clock, AlertTriangle, Crown,
    TrendingUp, Calendar, Mail, Building2, RefreshCw, Database
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resettingCache, setResettingCache] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        trial: 0,
        suspended: 0,
    });

    // Verificar se o usuário é admin
    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    const checkAdminAccess = async () => {
        if (!user?.email) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', user.email)
                .single();

            if (error || !data) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            setIsAdmin(true);
            loadUsers();
        } catch (err) {
            console.error('Erro ao verificar acesso admin:', err);
            setIsAdmin(false);
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
            setFilteredUsers(data || []);
            calculateStats(data || []);
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetSystemCache = async () => {
        if (!confirm('⚠️ ATENÇÃO!\n\nEsta ação irá:\n\n1. Forçar reload de TODOS os dados do sistema\n2. Corrigir problemas de sincronização\n3. Garantir que cada usuário veja apenas seus dados\n\nDeseja continuar?')) {
            return;
        }

        setResettingCache(true);
        try {
            console.log('🔄 Iniciando reset do cache do sistema...');

            // 1. Recarregar todos os usuários
            console.log('📥 Recarregando usuários...');
            await loadUsers();

            // 2. Verificar e corrigir farm_ids
            console.log('🔧 Verificando farm_ids...');
            const { data: usersData } = await supabase
                .from('user_profiles')
                .select('user_id, farm_id');

            if (usersData) {
                for (const user of usersData) {
                    if (!user.farm_id || user.farm_id === '' || user.farm_id.startsWith('default-farm')) {
                        console.log(`🔧 Corrigindo farm_id para usuário ${user.user_id}`);
                        await supabase
                            .from('user_profiles')
                            .update({ farm_id: `farm-${user.user_id}` })
                            .eq('user_id', user.user_id);
                    }
                }
            }

            // 3. Forçar reload final
            console.log('🔄 Reload final...');
            await loadUsers();

            console.log('✅ Reset do cache concluído!');
            alert('✅ Reset do Sistema Concluído!\n\n' +
                'Todos os dados foram recarregados.\n' +
                'Farm IDs foram corrigidos.\n\n' +
                'Instrua os usuários a:\n' +
                '1. Fazer LOGOUT\n' +
                '2. Fazer LOGIN novamente\n' +
                '3. Verificar se veem apenas seus dados');
        } catch (error) {
            console.error('❌ Erro ao resetar cache:', error);
            alert('❌ Erro ao resetar cache do sistema.\n\nVerifique o console (F12) para mais detalhes.');
        } finally {
            setResettingCache(false);
        }
    };

    const calculateStats = (userList: UserProfile[]) => {
        setStats({
            total: userList.length,
            active: userList.filter(u => u.subscription_status === 'active').length,
            trial: userList.filter(u => u.subscription_status === 'trial').length,
            suspended: userList.filter(u => u.subscription_status === 'suspended').length,
        });
    };

    // Filtrar usuários
    useEffect(() => {
        let filtered = users;

        // Filtro de busca
        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.farm_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro de status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(u => u.subscription_status === filterStatus);
        }

        // Filtro de plano
        if (filterPlan !== 'all') {
            filtered = filtered.filter(u => u.subscription_plan === filterPlan);
        }

        setFilteredUsers(filtered);
    }, [searchTerm, filterStatus, filterPlan, users]);

    const handleEdit = (userId: string) => {
        const userToEdit = users.find(u => u.id === userId);
        if (userToEdit) {
            setEditingUser(userId);
            setEditForm(userToEdit);
        }
    };

    const handleSave = async () => {
        if (!editingUser || !editForm) return;

        setSaving(true);
        try {
            console.log('💾 Salvando alterações no Supabase...');
            console.log('Dados a serem salvos:', {
                id: editingUser,
                subscription_plan: editForm.subscription_plan,
                subscription_status: editForm.subscription_status,
            });

            // Atualizar no Supabase
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    subscription_plan: editForm.subscription_plan,
                    subscription_status: editForm.subscription_status,
                    subscription_start_date: editForm.subscription_start_date || new Date().toISOString(),
                    subscription_end_date: editForm.subscription_end_date,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingUser);

            if (error) {
                console.error('❌ Erro do Supabase:', error);
                throw error;
            }

            console.log('✅ Dados salvos no Supabase com sucesso!');

            // Recarregar TODOS os dados do Supabase para garantir sincronização
            console.log('🔄 Recarregando dados do Supabase...');
            await loadUsers();

            // Limpar formulário de edição
            setEditingUser(null);
            setEditForm({});

            console.log('✅ Atualização completa!');
            alert('✅ Usuário atualizado com sucesso!\n\nAs alterações foram salvas no banco de dados.');
        } catch (err: any) {
            console.error('❌ Erro ao atualizar usuário:', err);
            alert(`❌ Erro ao atualizar usuário:\n\n${err.message || 'Erro desconhecido'}\n\nVerifique o console (F12) para mais detalhes.`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingUser(null);
        setEditForm({});
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Ativo' },
            trial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Trial' },
            inactive: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle, label: 'Inativo' },
            suspended: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Suspenso' },
        };
        const badge = badges[status as keyof typeof badges] || badges.inactive;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon size={12} />
                {badge.label}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        const badges = {
            free: { color: 'bg-gray-100 text-gray-600', label: 'Gratuito' },
            basic: { color: 'bg-blue-100 text-blue-600', label: 'Básico' },
            professional: { color: 'bg-purple-100 text-purple-600', label: 'Profissional' },
            enterprise: { color: 'bg-yellow-100 text-yellow-700', label: 'Enterprise' },
        };
        const badge = badges[plan as keyof typeof badges] || badges.free;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando painel...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
                    <p className="text-gray-600">
                        Você não tem permissão para acessar o painel de administração.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl text-white shadow-lg">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
                                <p className="text-gray-600">Gerencie todos os usuários e assinaturas</p>
                            </div>
                        </div>
                        <button
                            onClick={() => loadUsers()}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${loading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } text-white`}
                            title="Recarregar dados"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            <span className="text-sm font-medium">
                                {loading ? 'Carregando...' : 'Recarregar'}
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                            Logado como: <strong className="text-green-600">{user?.email}</strong>
                        </span>
                    </div>
                </div>

                {/* Reset System Cache - Seção Destacada */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 mb-6 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <Database size={32} className="text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Reset System Cache</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Corrige problemas de sincronização de dados entre usuários
                                </p>
                                <ul className="text-xs text-gray-500 space-y-1">
                                    <li>• Força reload de todos os dados do sistema</li>
                                    <li>• Corrige farm_ids inválidos ou vazios</li>
                                    <li>• Garante que cada usuário veja apenas seus dados</li>
                                </ul>
                            </div>
                        </div>
                        <button
                            onClick={resetSystemCache}
                            disabled={resettingCache}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-semibold ${resettingCache
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg transform hover:scale-105'
                                } text-white shadow-md`}
                        >
                            <Database size={20} className={resettingCache ? 'animate-spin' : ''} />
                            <span>
                                {resettingCache ? 'Resetando...' : 'Executar Reset'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de Usuários</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <Users className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Assinaturas Ativas</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Em Trial</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.trial}</p>
                            </div>
                            <Clock className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Suspensos</p>
                                <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                            </div>
                            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por email, nome ou farm_id..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="active">Ativo</option>
                                <option value="trial">Trial</option>
                                <option value="inactive">Inativo</option>
                                <option value="suspended">Suspenso</option>
                            </select>
                        </div>

                        {/* Plan Filter */}
                        <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={filterPlan}
                                onChange={(e) => setFilterPlan(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                            >
                                <option value="all">Todos os Planos</option>
                                <option value="free">Gratuito</option>
                                <option value="basic">Básico</option>
                                <option value="professional">Profissional</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Farm ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Plano
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Data de Criação
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Nenhum usuário encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            {editingUser === user.id ? (
                                                <>
                                                    {/* Modo de Edição */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-100 p-2 rounded-full">
                                                                <Mail className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{user.full_name || 'Sem nome'}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Building2 size={16} />
                                                            {user.farm_id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={editForm.subscription_plan}
                                                            onChange={(e) => setEditForm({ ...editForm, subscription_plan: e.target.value as any })}
                                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                                        >
                                                            <option value="free">Gratuito</option>
                                                            <option value="basic">Básico</option>
                                                            <option value="professional">Profissional</option>
                                                            <option value="enterprise">Enterprise</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={editForm.subscription_status}
                                                            onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value as any })}
                                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                                                        >
                                                            <option value="active">Ativo</option>
                                                            <option value="trial">Trial</option>
                                                            <option value="inactive">Inativo</option>
                                                            <option value="suspended">Suspenso</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar size={16} />
                                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={handleSave}
                                                                disabled={saving}
                                                                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${saving
                                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                                    } text-white`}
                                                                title={saving ? "Salvando..." : "Salvar"}
                                                            >
                                                                {saving ? (
                                                                    <>
                                                                        <RefreshCw size={16} className="animate-spin" />
                                                                        <span className="text-xs">Salvando...</span>
                                                                    </>
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                                title="Cancelar"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Modo de Visualização */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-100 p-2 rounded-full">
                                                                <Mail className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{user.full_name || 'Sem nome'}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Building2 size={16} />
                                                            <span className="font-mono text-xs">{user.farm_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getPlanBadge(user.subscription_plan)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(user.subscription_status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar size={16} />
                                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleEdit(user.id)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Mostrando {filteredUsers.length} de {users.length} usuários</p>
                </div>
            </div>
        </div>
    );
}
