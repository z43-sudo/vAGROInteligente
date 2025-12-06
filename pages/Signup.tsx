import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, User, Lock, Mail, ArrowRight, Loader2, Users, Building2 } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isOwner, setIsOwner] = useState(true); // true = Dono, false = Membro
    const [farmCode, setFarmCode] = useState(''); // Código da fazenda para membros
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let finalFarmId = '';

            if (isOwner) {
                // Gerar NOVO farm_id único para o Dono
                finalFarmId = `farm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            } else {
                // Usar o código fornecido para Membros
                if (!farmCode.trim()) throw new Error('Por favor, insira o código da fazenda.');
                finalFarmId = farmCode.trim();
            }

            const { error } = await signUp(email, password, {
                full_name: fullName,
                farm_id: finalFarmId,
                role: isOwner ? 'owner' : 'member' // Salvar o papel do usuário
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
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-[450px] z-10 px-4">
                <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden">

                    {/* Top Gradient Line Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-70" />

                    {/* Header Section */}
                    <div className="pt-8 pb-6 px-8 border-b border-slate-700/30 bg-[#0f172a]/30">
                        <div className="flex flex-col items-center">
                            <div className="bg-green-500/10 p-3 rounded-full border border-green-500/20 mb-3 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                <Leaf className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Nova Conta Corporativa</h2>
                            <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">Junte-se à gestão inteligente</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center flex items-center justify-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">

                            {/* Type Toggle - Glass Style */}
                            <div className="p-1 bg-slate-950/50 rounded-xl border border-slate-700/50 flex mb-6 relative">
                                <button
                                    type="button"
                                    onClick={() => setIsOwner(true)}
                                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${isOwner ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Building2 size={14} />
                                    EMPRESA / DONO
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOwner(false)}
                                    className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${!isOwner ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Users size={14} />
                                    COLABORADOR
                                </button>
                                {/* Sliding Background */}
                                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-700 rounded-lg transition-all duration-300 ease-out border border-slate-600 ${isOwner ? 'left-1' : 'left-[calc(50%+4px)]'}`} />
                            </div>

                            <div className="space-y-1.5 group/input">
                                <div className="relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-500 group-focus-within/input:text-green-400 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-green-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-green-500/10 transition-all duration-300"
                                        placeholder="Nome completo"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group/input">
                                <div className="relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-500 group-focus-within/input:text-green-400 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-green-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-green-500/10 transition-all duration-300"
                                        placeholder="Email corporativo"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group/input">
                                <div className="relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-slate-500 group-focus-within/input:text-green-400 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-green-500/50 focus:bg-slate-900/80 focus:ring-2 focus:ring-green-500/10 transition-all duration-300"
                                        placeholder="Definir senha"
                                    />
                                </div>
                            </div>

                            {!isOwner && (
                                <div className="space-y-1.5 animate-fade-in pt-2">
                                    <label className="text-[10px] font-bold text-green-500 uppercase tracking-wider ml-1 mb-1 block">Código da Fazenda</label>
                                    <div className="relative group/code">
                                        <div className="absolute top-1/2 -translate-y-1/2 left-3.5 text-green-500/70">
                                            <Building2 size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required={!isOwner}
                                            value={farmCode}
                                            onChange={(e) => setFarmCode(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3 bg-green-500/5 border border-green-500/30 rounded-xl text-green-100 placeholder-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all font-mono text-sm tracking-wide"
                                            placeholder="Ex: farm_123..."
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden group/btn flex items-center justify-center py-3.5 px-4 bg-[#14532d] hover:bg-[#166534] border border-green-600/30 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(22,101,52,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-[0.98] mt-4"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />

                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-green-200" />
                                ) : (
                                    <span className="flex items-center gap-2 relative z-10 text-sm uppercase tracking-wide">
                                        {isOwner ? 'Criar Fazenda Digital' : 'Solicitar Acesso'} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
                            <p className="text-slate-500 text-xs">
                                Já tem sua conta?{' '}
                                <Link to="/login" className="text-green-400 hover:text-green-300 font-bold transition-colors hover:underline decoration-green-500/30 underline-offset-4 ml-1">
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white font-light">
                        Segurança Criptografada
                    </p>
                </div>
            </div>
        </div>
    );
}
