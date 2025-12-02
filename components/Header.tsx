import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, MapPin, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { toggleMobileMenu, currentUser, farmDetails } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'Alerta de Chuva', message: 'Previsão de chuva forte para as próximas 2h.', time: '5 min atrás', read: false, type: 'warning' },
    { id: 2, title: 'Manutenção Concluída', message: 'Trator T-04 pronto para uso.', time: '1h atrás', read: false, type: 'success' },
    { id: 3, title: 'Estoque Baixo', message: 'Fertilizante NPK abaixo do nível mínimo.', time: '3h atrás', read: true, type: 'error' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white h-20 px-8 flex items-center justify-between gap-4 sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-sm bg-white/80">
      {/* Left Section: Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button onClick={toggleMobileMenu} className="md:hidden text-gray-600 hover:text-gray-800">
          <Menu size={24} />
        </button>

        {/* Search Bar - Extended */}
        <div className="relative flex-1 max-w-3xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar safras, atividades, máquinas..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        {/* Farm Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{farmDetails.name}</span>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Ativa</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAsRead();
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Notificações</h3>
                <span className="text-xs text-gray-500 hover:text-green-700 cursor-pointer">Marcar todas como lidas</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-gray-800">{notification.title}</h4>
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                <button className="text-xs font-bold text-green-700 hover:text-green-800">Ver todas</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <Link to="/perfil" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors px-2 py-1">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.role}</p>
          </div>
          <div className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-800/20">
            <User size={20} />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;