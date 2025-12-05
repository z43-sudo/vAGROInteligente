import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Leaf, Tractor, Wheat, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

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
            {/* Background 3D Elements (CSS Only) */}
            {/* Background Elements removed for cleaner look */}

            <div className="w-full max-w-md z-10 p-4">
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">

                    {/* Header Section */}
                    <div className="relative h-32 bg-gradient-to-br from-green-900 to-[#0f172a] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-green-500/20 p-3 rounded-full mb-2 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                <Tractor className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-wide">AGRO INTELIGENTE</h2>
                            <p className="text-green-400/80 text-xs uppercase tracking-widest mt-1">Gestão Agrícola Avançada</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8">
                        <h3 className="text-xl text-white font-semibold mb-6 text-center">Bem-vindo de volta</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
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
                                <label className="text-sm text-gray-400 ml-1">Senha de Acesso</label>
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

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-400 hover:text-gray-300 cursor-pointer">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 text-green-500 rounded border-gray-700 bg-[#0f172a] focus:ring-green-500/20" />
                                    <span className="ml-2">Lembrar-me</span>
                                </label>
                                <a href="#" className="text-green-400 hover:text-green-300 transition-colors">Esqueceu a senha?</a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-900/20 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Acessar Painel <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-gray-400 text-sm">
                                Ainda não tem acesso?{' '}
                                <Link to="/signup" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                                    Solicitar conta
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs">
                        &copy; 2024 Agro Inteligente. Todos os direitos reservados.
                        <br />
                        Sistema de Gestão Agrícola v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
