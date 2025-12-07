import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield, Users, Search, Filter, Edit2, Save, X,
    CheckCircle, XCircle, Clock, AlertTriangle, Crown,
    TrendingUp, Calendar, Mail, Building2, RefreshCw,
    Download, Trash2, Check, Activity, UserPlus, DollarSign
} from 'lucide-react';

// Tipagem correta baseada no banco de dados real
interface UserProfile {
    id: string; // ID da tabela (PK)
    user_id: string; // ID do Auth (FK)
    email: string;
    full_name: string | null;
    farm_id: string | null;
    role: string | null;
    subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise';
    subscription_status: 'active' | 'trial' | 'suspended' | 'inactive';
    created_at: string;
    updated_at?: string;
}

export default function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Estados de Filtro e Busca
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPlan, setFilterPlan] = useState<string>('all');

    // Estados de Edição
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
    const [saving, setSaving] = useState(false);

    // Estados de Seleção em Massa
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Estatísticas
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        trial: 0,
        suspended: 0,
        revenue: 0
    });

    useEffect(() => {
        checkPermissionAndLoad();
    }, [user]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, filterStatus, filterPlan]);

    // 1. Verificação de Permissão e Carregamento Inicial
    const checkPermissionAndLoad = async () => {
        if (!user?.email) return;

        // Verificação Hardcoded para segurança extra no frontend
        const isSuperAdmin = user.email.toLowerCase() === 'wallisom_53@outlook.com';

        if (isSuperAdmin) {
            setIsAdmin(true);
            loadUsers();
        } else {
            // Verifica no banco se existe na tabela admin_users
            const { data } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();

            if (data) {
                setIsAdmin(true);
                loadUsers();
            } else {
                setLoading(false);
                setIsAdmin(false);
            }
        }
    };

    // 2. Carregar Usuários do Banco
    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setUsers(data as UserProfile[]);
                calculateStats(data as UserProfile[]);
            }
        } catch (err) {
            console.error('Erro ao carregar usuários:', err);
            alert('Erro ao carregar lista de usuários check o console.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Calcular Estatísticas
    const calculateStats = (data: UserProfile[]) => {
        const planPrices = { free: 0, basic: 147, professional: 247, enterprise: 500 };

        setStats({
            total: data.length,
            active: data.filter(u => u.subscription_status === 'active').length,
            trial: data.filter(u => u.subscription_status === 'trial').length,
            suspended: data.filter(u => u.subscription_status === 'suspended').length,
            revenue: data.reduce((acc, curr) => {
                if (curr.subscription_status === 'active') {
                    return acc + (planPrices[curr.subscription_plan] || 0);
                }
                return acc;
            }, 0)
        });
    };

    // 4. Filtragem Local
    const filterUsers = () => {
        let result = [...users];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.email?.toLowerCase().includes(term) ||
                u.full_name?.toLowerCase().includes(term) ||
                u.farm_id?.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== 'all') {
            result = result.filter(u => u.subscription_status === filterStatus);
        }

        if (filterPlan !== 'all') {
            result = result.filter(u => u.subscription_plan === filterPlan);
        }

        setFilteredUsers(result);
    };

    // 5. Ações de Edição
    const startEditing = (user: UserProfile) => {
        setEditingId(user.id);
        setEditForm({ ...user });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveUser = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    subscription_plan: editForm.subscription_plan,
                    subscription_status: editForm.subscription_status,
                    full_name: editForm.full_name,
                    role: editForm.role,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingId); // Usa o ID da tabela (PK)

            if (error) throw error;

            // Atualiza localmente
            setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...editForm } as UserProfile : u));
            setEditingId(null);
            alert('Usuário atualizado com sucesso!');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            alert(`Erro ao salvar: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // 6. Ações em Massa
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredUsers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const deleteSelected = async () => {
        if (!confirm(`Tem certeza que deseja deletar ${selectedIds.size} usuários?`)) return;

        setSaving(true);
        try {
            const idsToDelete = Array.from(selectedIds);
            const { error } = await supabase
                .from('user_profiles')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
            setSelectedIds(new Set());
            alert('Usuários removidos com sucesso.');
        } catch (err: any) {
            alert(`Erro ao deletar: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // RenderHelpers
    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            trial: 'bg-blue-100 text-blue-700',
            suspended: 'bg-red-100 text-red-700',
            inactive: 'bg-gray-100 text-gray-700'
        };
        const label = {
            active: 'Ativo', trial: 'Trial', suspended: 'Suspenso', inactive: 'Inativo'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.inactive}`}>
                {label[status as keyof typeof label] || status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando painel admin...</div>;
    if (!isAdmin) return <div className="p-8 text-center text-red-500 font-bold">Acesso Negado.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="text-green-600" />
                            Painel Administrativo
                        </h1>
                        <p className="text-gray-500">Gerenciamento total de usuários e assinaturas</p>
                    </div>
                    <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm">
                        <RefreshCw size={18} /> Atualizar Lista
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total Usuários</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Ativos</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Em Trial</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Suspensos</p>
                        <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Receita Est.</p>
                        <p className="text-2xl font-bold text-emerald-600">R$ {stats.revenue}</p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar nome, email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Status: Todos</option>
                            <option value="active">Ativo</option>
                            <option value="trial">Trial</option>
                            <option value="suspended">Suspenso</option>
                        </select>
                        <select
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                            value={filterPlan}
                            onChange={e => setFilterPlan(e.target.value)}
                        >
                            <option value="all">Plano: Todos</option>
                            <option value="free">Gratuito</option>
                            <option value="basic">Básico</option>
                            <option value="professional">Profissional</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            <Trash2 size={18} /> Deletar ({selectedIds.size})
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                                            onChange={toggleAll}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Farm ID / Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plano</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(u.id)}
                                                onChange={() => toggleSelection(u.id)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                            />
                                        </td>

                                        {/* Modo Edição ou Visualização */}
                                        {editingId === u.id ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <input
                                                        className="w-full border rounded px-2 py-1 mb-1 text-sm"
                                                        value={editForm.full_name || ''}
                                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                        placeholder="Nome Completo"
                                                    />
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        value={editForm.role || ''}
                                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                                        placeholder="Role (ex: owner)"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm w-full"
                                                        value={editForm.subscription_plan}
                                                        onChange={e => setEditForm({ ...editForm, subscription_plan: e.target.value as any })}
                                                    >
                                                        <option value="free">Gratuito</option>
                                                        <option value="basic">Básico</option>
                                                        <option value="professional">Profissional</option>
                                                        <option value="enterprise">Enterprise</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="border rounded px-2 py-1 text-sm w-full"
                                                        value={editForm.subscription_status}
                                                        onChange={e => setEditForm({ ...editForm, subscription_status: e.target.value as any })}
                                                    >
                                                        <option value="active">Ativo</option>
                                                        <option value="trial">Trial</option>
                                                        <option value="suspended">Suspenso</option>
                                                        <option value="inactive">Inativo</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={saveUser} disabled={saving} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
                                                            <Save size={16} />
                                                        </button>
                                                        <button onClick={cancelEditing} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{u.full_name || 'Sem nome'}</div>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-mono">{u.farm_id || '-'}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{u.role || 'member'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 font-medium">
                                                        {u.subscription_plan}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(u.subscription_status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => startEditing(u)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Nenhum usuário encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
