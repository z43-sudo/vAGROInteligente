import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Users, Search, Filter, Edit2, Save, X,
    CheckCircle, XCircle, Clock, AlertTriangle, Crown,
    TrendingUp, Calendar, Mail, Building2, RefreshCw,
    Download, Trash2, Check, BarChart3, Activity,
    UserPlus, DollarSign, Zap, Eye, ChevronDown
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
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        trial: 0,
        suspended: 0,
        newThisMonth: 0,
        revenue: 0,
    });

    // Verificar se o usuário é admin
    useEffect(() => {
        checkAdminAccess();
    }, [user]);

    // Setup Realtime Subscription
    useEffect(() => {
        if (!isAdmin) return;

        const channel = supabase
            .channel('admin-users-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_profiles'
                },
                (payload) => {
                    console.log('🔄 Realtime update received:', payload);
                    setSyncStatus('syncing');

                    // Handle different types of changes
                    if (payload.eventType === 'INSERT') {
                        setUsers(prev => [payload.new as UserProfile, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setUsers(prev => prev.map(u =>
                            u.id === payload.new.id ? payload.new as UserProfile : u
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setUsers(prev => prev.filter(u => u.id !== payload.old.id));
                    }

                    setLastSync(new Date());
                    setTimeout(() => setSyncStatus('synced'), 500);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdmin]);

    // Recalculate stats when users change
    useEffect(() => {
        calculateStats(users);
    }, [users]);

    const checkAdminAccess = async () => {
        if (!user?.email) {
            setIsAdmin(false);
            setLoading(false);
            return;
        }

        // Mock Admin Access for specific user
        if (user.email === 'wallisom_53@outlook.com') {
            setIsAdmin(true);
            loadUsers();
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
            setSyncStatus('syncing');
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
            setFilteredUsers(data || []);
            setLastSync(new Date());
            setSyncStatus('synced');
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            setSyncStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (userList: UserProfile[]) => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newThisMonth = userList.filter(u =>
            new Date(u.created_at) >= firstDayOfMonth
        ).length;

        // Simple revenue calculation (you can adjust based on your pricing)
        const planPrices = { free: 0, basic: 147, professional: 247, enterprise: 500 };
        const revenue = userList
            .filter(u => u.subscription_status === 'active')
            .reduce((sum, u) => sum + (planPrices[u.subscription_plan as keyof typeof planPrices] || 0), 0);

        setStats({
            total: userList.length,
            active: userList.filter(u => u.subscription_status === 'active').length,
            trial: userList.filter(u => u.subscription_status === 'trial').length,
            suspended: userList.filter(u => u.subscription_status === 'suspended').length,
            newThisMonth,
            revenue,
        });
    };

    // Filtrar usuários
    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.farm_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(u => u.subscription_status === filterStatus);
        }

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

            if (error) throw error;

            setEditingUser(null);
            setEditForm({});
            showToast('✅ Usuário atualizado com sucesso!', 'success');
        } catch (err: any) {
            console.error('❌ Erro ao atualizar usuário:', err);
            showToast(`❌ Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingUser(null);
        setEditForm({});
    };

    // Bulk Actions
    const toggleUserSelection = (userId: string) => {
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        setSelectedUsers(newSelection);
        setShowBulkActions(newSelection.size > 0);
    };

    const selectAllFiltered = () => {
        const allIds = new Set(filteredUsers.map(u => u.id));
        setSelectedUsers(allIds);
        setShowBulkActions(allIds.size > 0);
    };

    const clearSelection = () => {
        setSelectedUsers(new Set());
        setShowBulkActions(false);
    };

    const handleBulkAction = async (action: 'activate' | 'suspend' | 'delete') => {
        if (selectedUsers.size === 0) return;

        const confirmMessage = action === 'delete'
            ? `Tem certeza que deseja DELETAR ${selectedUsers.size} usuários? Esta ação não pode ser desfeita!`
            : `Tem certeza que deseja ${action === 'activate' ? 'ativar' : 'suspender'} ${selectedUsers.size} usuários?`;

        if (!confirm(confirmMessage)) return;

        setSaving(true);
        try {
            const userIds = Array.from(selectedUsers);

            if (action === 'delete') {
                const { error } = await supabase
                    .from('user_profiles')
                    .delete()
                    .in('id', userIds);
                if (error) throw error;
            } else {
                const newStatus = action === 'activate' ? 'active' : 'suspended';
                const { error } = await supabase
                    .from('user_profiles')
                    .update({ subscription_status: newStatus })
                    .in('id', userIds);
                if (error) throw error;
            }

            clearSelection();
            showToast(`✅ ${selectedUsers.size} usuários ${action === 'delete' ? 'deletados' : 'atualizados'}!`, 'success');
        } catch (err: any) {
            showToast(`❌ Erro: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Nome', 'Email', 'Farm ID', 'Plano', 'Status', 'Data de Criação'];
        const rows = filteredUsers.map(u => [
            u.full_name || '',
            u.email,
            u.farm_id || '',
            u.subscription_plan,
            u.subscription_status,
            new Date(u.created_at).toLocaleDateString('pt-BR')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showToast('✅ Dados exportados com sucesso!', 'success');
    };

    // Toast notification system
    const showToast = (message: string, type: 'success' | 'error') => {
        // Simple alert for now - you can replace with a proper toast library
        alert(message);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
                                <p className="text-gray-600">Gerencie todos os usuários e assinaturas em tempo real</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Sync Status Indicator */}
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${syncStatus === 'synced' ? 'bg-green-50 text-green-700' :
                                syncStatus === 'syncing' ? 'bg-blue-50 text-blue-700' :
                                    'bg-red-50 text-red-700'
                                }`}>
                                <Activity size={16} className={syncStatus === 'syncing' ? 'animate-pulse' : ''} />
                                <span className="text-xs font-medium">
                                    {syncStatus === 'synced' ? 'Sincronizado' :
                                        syncStatus === 'syncing' ? 'Sincronizando...' :
                                            'Erro de sinc.'}
                                </span>
                            </div>
                            <button
                                onClick={() => loadUsers()}
                                disabled={loading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white shadow-md`}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                <span className="text-sm font-medium">
                                    {loading ? 'Carregando...' : 'Recarregar'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                            Logado como: <strong className="text-green-600">{user?.email}</strong>
                        </span>
                        <span className="text-xs text-gray-400 ml-4">
                            Última atualização: {lastSync.toLocaleTimeString('pt-BR')}
                        </span>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <Users className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Ativos</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Trial</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.trial}</p>
                            </div>
                            <Clock className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Suspensos</p>
                                <p className="text-3xl font-bold text-red-600">{stats.suspended}</p>
                            </div>
                            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Novos/Mês</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth}</p>
                            </div>
                            <UserPlus className="w-12 h-12 text-purple-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Receita</p>
                                <p className="text-2xl font-bold text-emerald-600">R$ {stats.revenue}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-emerald-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {showBulkActions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                                {selectedUsers.size} usuário(s) selecionado(s)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('activate')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                                Ativar Selecionados
                            </button>
                            <button
                                onClick={() => handleBulkAction('suspend')}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                            >
                                Suspender Selecionados
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Deletar Selecionados
                            </button>
                            <button
                                onClick={clearSelection}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters & Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative md:col-span-2">
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={selectAllFiltered}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <Check size={16} />
                            Selecionar Todos ({filteredUsers.length})
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={(e) => e.target.checked ? selectAllFiltered() : clearSelection()}
                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                        />
                                    </th>
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
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p>Nenhum usuário encontrado</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${selectedUsers.has(user.id) ? 'bg-blue-50' : ''
                                            }`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.has(user.id)}
                                                    onChange={() => toggleUserSelection(user.id)}
                                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                />
                                            </td>
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
                                                                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                                                    } text-white`}
                                                            >
                                                                {saving ? (
                                                                    <RefreshCw size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                    <p>Mostrando {filteredUsers.length} de {users.length} usuários • Atualização em tempo real ativa</p>
                </div>
            </div>
        </div>
    );
}
