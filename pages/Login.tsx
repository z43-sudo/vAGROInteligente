import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Tractor, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await signIn(email, password);

            if (error) throw error;

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main Card */}
            <div className="w-full max-w-[400px] z-10 px-4">
                <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden group">

                    {/* Top Gradient Line Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-70" />

                    {/* Header with Glowing Icon */}
                    <div className="pt-10 pb-6 flex flex-col items-center relative">
                        <div className="relative mb-5 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                            <div className="relative bg-[#0f172a] p-4 rounded-2xl border border-green-500/30 shadow-lg shadow-green-500/10 ring-1 ring-white/5">
                                <Tractor className="w-8 h-8 text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Agro Inteligente</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-slate-600"></span>
                            <span className="text-slate-400 text-xs uppercase tracking-widest font-medium">Portal do Usuário</span>
                            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-slate-600"></span>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="px-8 pb-10">
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center flex items-center justify-center gap-2 animate-fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
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
                                        placeholder="Sua senha"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center text-slate-400 hover:text-slate-300 cursor-pointer group/check">
                                    <div className="relative">
                                        <input type="checkbox" className="peer sr-only" />
                                        <div className="w-4 h-4 border border-slate-600 rounded bg-slate-800/50 peer-checked:bg-green-500 peer-checked:border-green-500 transition-all"></div>
                                        <div className="absolute inset-0 text-white opacity-0 peer-checked:opacity-100 flex items-center justify-center pointer-events-none">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="ml-2 text-xs font-medium transition-colors group-hover/check:text-green-400/80">Lembrar acesso</span>
                                </label>
                                <a href="#" className="text-xs font-medium text-green-500 hover:text-green-400 transition-colors hover:underline decoration-green-500/50 underline-offset-4">
                                    Esqueceu a senha?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden group/btn flex items-center justify-center py-3.5 px-4 bg-[#14532d] hover:bg-[#166534] border border-green-600/30 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(22,101,52,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />

                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-green-200" />
                                ) : (
                                    <span className="flex items-center gap-2 relative z-10">
                                        Entrar na Plataforma <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link to="/signup" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group/link">
                                Não tem uma conta?
                                <span className="ml-1.5 text-green-400 group-hover/link:text-green-300">Criar agora</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white font-light">
                        Powered by Agro Inteligente
                    </p>
                </div>
            </div>
        </div>
    );
}
