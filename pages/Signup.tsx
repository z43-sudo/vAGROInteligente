import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Leaf, Tractor, Lock, Mail, ArrowRight, Loader2, User, Users, Building2 } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isOwner, setIsOwner] = useState(true); // true = Dono, false = Membro
    const [farmCode, setFarmCode] = useState(''); // Código da fazenda para membros
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            let finalFarmId = '';

            if (isOwner) {
                // Gerar NOVO farm_id único para o Dono
                finalFarmId = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            } else {
                // Usar o código fornecido para Membros
                if (!farmCode.trim()) throw new Error('Por favor, insira o código da fazenda.');
                finalFarmId = farmCode.trim();
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        farm_id: finalFarmId,
                        role: isOwner ? 'owner' : 'member' // Salvar o papel do usuário
                    },
                },
            });

            if (error) throw error;

            alert(`Cadastro realizado com sucesso!\n\n${isOwner ? `Seu Código de Fazenda é: ${finalFarmId}\nGuarde-o para convidar sua equipe!` : 'Você foi vinculado à fazenda com sucesso!'}`);
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background 3D Elements (CSS Only) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="absolute top-20 right-20 w-16 h-16 border border-green-500/30 rounded-xl transform -rotate-12 animate-bounce duration-[3000ms] opacity-50 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]"></div>
                <div className="absolute bottom-40 left-20 w-24 h-24 border border-emerald-500/20 rounded-full transform rotate-12 animate-bounce duration-[4000ms] delay-500 opacity-40 backdrop-blur-sm"></div>
            </div>

            <div className="w-full max-w-md z-10 p-4">
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">

                    {/* Header Section */}
                    <div className="relative h-24 bg-gradient-to-br from-green-900 to-[#0f172a] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="bg-green-500/20 p-2 rounded-full border border-green-500/30">
                                <Leaf className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-wide">Criar Nova Conta</h2>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">

                            {/* Toggle Dono / Membro */}
                            <div className="flex bg-[#0f172a]/50 p-1 rounded-xl border border-gray-700 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOwner(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${isOwner ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Building2 size={16} />
                                    Sou Dono
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOwner(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!isOwner ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <Users size={16} />
                                    Sou Equipe
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Senha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {!isOwner && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-sm text-green-400 ml-1 font-bold">Código da Fazenda (Peça ao Dono)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-green-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required={!isOwner}
                                            value={farmCode}
                                            onChange={(e) => setFarmCode(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-green-900/20 border border-green-500/50 rounded-xl text-green-100 placeholder-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="Ex: farm_123456789"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-900/20 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isOwner ? 'Criar Minha Fazenda' : 'Entrar na Equipe'} <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-gray-400 text-sm">
                                Já possui uma conta?{' '}
                                <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                                    Fazer Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
