import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, Calendar, Tractor, Beef,
  Truck, Package, DollarSign, CloudRain, Users, Settings, Leaf, BarChart3, X, MessageSquare, LogOut, Newspaper, Shield, Award, Brain, MapPin
} from 'lucide-react';
import { NavigationItem } from '../types';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isMobileMenuOpen, closeMobileMenu, crops } = useApp();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      // Mock Admin Access for specific user
      if (user.email === 'wallisom_53@outlook.com') {
        setIsAdmin(true);
        return;
      }

      try {
        if (!supabase) {
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (data && !error) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Safras', path: '/safras', icon: Sprout, count: crops.length > 0 ? crops.length : undefined },
    { name: 'Atividades', path: '/atividades', icon: Calendar },
    { name: 'Máquinas', path: '/maquinas', icon: Tractor },
    { name: 'Pecuária', path: '/pecuaria', icon: Beef },
    { name: 'Logística', path: '/logistica', icon: Truck },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Financeiro', path: '/financeiro', icon: DollarSign },
    { name: 'Clima', path: '/clima', icon: CloudRain },
    { name: 'Equipe', path: '/equipe', icon: Users },
    { name: 'Gestor', path: '/gestor', icon: BarChart3 },
    { name: 'Mapeamento de Área', path: '/mapeamento-area', icon: MapPin },
    { name: 'IA Inteligente', path: '/ia-recomendacoes', icon: Brain },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Notícias', path: '/noticias', icon: Newspaper },
    { name: 'Parceiros', path: '/parceiros', icon: Award },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      <div className={`
        w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-800 p-2 rounded-xl text-white">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">Agro</h1>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Inteligente</span>
            </div>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${isActive
                  ? 'bg-green-800 text-white shadow-md shadow-green-200'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Settings */}
        <div className="p-4 border-t border-gray-100">
          <Link
            to="/configuracoes"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${location.pathname === '/configuracoes'
              ? 'bg-green-800 text-white'
              : 'text-gray-600 hover:bg-green-50 hover:text-green-800'
              }`}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </Link>

          <button
            onClick={() => {
              closeMobileMenu();
              signOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 mt-2"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;