import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, MapPin, Search, CheckCircle, RefreshCw, Navigation } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { toggleMobileMenu, currentUser, farmDetails, updateFarmDetails, notifications, markAllNotificationsAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleSyncLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          updateFarmDetails({ coordinates: newCoords });
          setIsLocating(false);
        },
        (error) => {
          console.error("Erro ao obter localização", error);
          setIsLocating(false);
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocalização não é suportada pelo seu navegador.");
    }
  };

  const getNotificationColor = (type: 'info' | 'warning' | 'error' | 'success') => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-800';
    }
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
        {/* Farm Selector & GPS */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:border-green-200 hover:shadow-sm">
          <div className={`p-1.5 rounded-lg ${farmDetails.coordinates ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            <MapPin size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-700 leading-tight">{farmDetails.name}</span>

            {!farmDetails.coordinates ? (
              <button
                onClick={handleSyncLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors mt-0.5"
              >
                {isLocating ? (
                  <RefreshCw size={10} className="animate-spin" />
                ) : (
                  <Navigation size={10} />
                )}
                {isLocating ? 'Buscando satélites...' : 'Sincronizar GPS'}
              </button>
            ) : (
              <div className="flex items-center gap-2 mt-0.5 group cursor-pointer" onClick={handleSyncLocation} title="Clique para atualizar GPS">
                <span className="text-[10px] font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle size={10} />
                  {farmDetails.coordinates}
                </span>
                <RefreshCw size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            onClick={handleNotificationClick}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Notificações</h3>
                {unreadCount > 0 && (
                  <span
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-green-600 hover:text-green-700 cursor-pointer font-medium"
                  >
                    Marcar todas como lidas
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Tudo certo por aqui!</p>
                    <p className="text-xs mt-1">Nenhuma notificação no momento.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold ${getNotificationColor(notification.type)}`}>{notification.title}</h4>
                        <span className="text-xs text-gray-400">{notification.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{notification.message}</p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                  <button className="text-xs font-bold text-green-700 hover:text-green-800">Ver todas</button>
                </div>
              )}
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