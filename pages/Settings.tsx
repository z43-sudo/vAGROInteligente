import React, { useState, useEffect } from 'react';
import { Bell, Lock, Globe, Moon, Save, Smartphone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Settings: React.FC = () => {
    const { darkMode, toggleDarkMode, farmDetails, updateFarmDetails } = useApp();
    const [notifications, setNotifications] = useState(true);

    // Local state for form fields to allow editing before saving
    const [formData, setFormData] = useState(farmDetails);

    // Update local state when context changes (e.g. initial load)
    useEffect(() => {
        setFormData(farmDetails);
    }, [farmDetails]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateFarmDetails(formData);
        alert('Configurações salvas com sucesso!');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
                    <p className="text-gray-500 dark:text-gray-400">Preferências globais do sistema e da conta.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-lg hover:bg-green-900 transition-colors"
                >
                    <Save size={16} /> Salvar Alterações
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation for Settings (Visual only for now) */}
                <div className="col-span-1 space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-green-50 text-green-800 font-medium flex items-center gap-3 dark:bg-green-900/20 dark:text-green-400">
                        <Globe size={18} /> Geral
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Bell size={18} /> Notificações
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Lock size={18} /> Segurança
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Smartphone size={18} /> Integrações
                    </button>
                </div>

                {/* Content Area */}
                <div className="col-span-2 space-y-6">

                    {/* Section: General */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Globe size={20} className="text-gray-400" /> Configurações da Fazenda
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Fazenda</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Preferences */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Moon size={20} className="text-gray-400" /> Preferências de Interface
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">Modo Escuro</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ativar tema escuro para a interface.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">Notificações Push</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receber alertas no navegador.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
