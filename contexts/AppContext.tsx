import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Activity, Machine, InventoryItem, Livestock, TeamMember, Crop, Notification } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
    name: string;
    role: string;
    email: string;
    farm_id: string;
}

interface AppContextType {
    activities: Activity[];
    addActivity: (activity: Omit<Activity, 'id' | 'time'>) => void;
    deleteActivity: (id: string) => void;
    inventoryItems: InventoryItem[];
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    deleteInventoryItem: (id: string) => void;
    machines: Machine[];
    addMachine: (machine: Machine) => void;
    deleteMachine: (id: string) => void;
    livestock: Livestock[];
    addLivestock: (animal: Livestock) => void;
    deleteLivestock: (id: string) => void;
    teamMembers: TeamMember[];
    addTeamMember: (member: TeamMember) => void;
    crops: Crop[];
    addCrop: (crop: Crop) => void;
    deleteCrop: (id: string) => void;
    currentUser: UserProfile;
    updateCurrentUser: (user: UserProfile) => void;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
    farmDetails: {
        name: string;
        cnpj: string;
        address: string;
        coordinates?: string;
    };
    updateFarmDetails: (details: { name?: string; cnpj?: string; address?: string; coordinates?: string }) => void;
    notifications: Notification[];
    markAllNotificationsAsRead: () => void;
    clearAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to calculate crop progress
const calculateCropStatus = (crop: Crop): Crop => {
    if (!crop.startDate || !crop.cycleDuration) return crop;

    const start = new Date(crop.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If start date is in the future
    if (now < start) {
        return { ...crop, progress: 0, daysToHarvest: crop.cycleDuration };
    }

    const progress = Math.min(100, Math.max(0, Math.round((daysElapsed / crop.cycleDuration) * 100)));
    const daysToHarvest = Math.max(0, crop.cycleDuration - daysElapsed);

    // Auto-update stage based on progress (Simplified logic)
    let stage = crop.stage;
    if (progress < 20) stage = 'Vegetativo';
    else if (progress < 50) stage = 'Floração';
    else if (progress < 80) stage = 'Enchimento';
    else stage = 'Maturação';

    return {
        ...crop,
        progress,
        daysToHarvest,
        stage
    };
};

// ============================================================================
// FUNÇÕES DE CACHE PERSISTENTE (localStorage)
// ============================================================================
const CACHE_VERSION = '1.0';

// Salvar dados no cache (localStorage) com chave específica do farm_id
const saveToCache = (farmId: string, dataType: string, data: any) => {
    try {
        const cacheKey = `agro_cache_${farmId}_${dataType}_v${CACHE_VERSION}`;
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            version: CACHE_VERSION
        }));
    } catch (error) {
        console.warn('⚠️ Erro ao salvar no cache:', error);
    }
};

// Carregar dados do cache
const loadFromCache = (farmId: string, dataType: string): any[] => {
    try {
        const cacheKey = `agro_cache_${farmId}_${dataType}_v${CACHE_VERSION}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            console.log(`✅ Dados ${dataType} carregados do cache`);
            return parsed.data || [];
        }
    } catch (error) {
        console.warn(`⚠️ Erro ao carregar ${dataType} do cache:`, error);
    }
    return [];
};

// Limpar cache específico de um usuário
const clearUserCache = (farmId: string) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(`agro_cache_${farmId}_`)) {
            localStorage.removeItem(key);
        }
    });
    console.log('🗑️ Cache do usuário limpo');
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // SEGURANÇA: Inicializar com vazio para evitar vazamento de dados
    const [currentUser, setCurrentUser] = useState<UserProfile>({
        name: 'Usuário',
        role: 'Proprietário',
        email: '',
        farm_id: '' // Vazio até carregar o usuário real
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    const [farmDetails, setFarmDetails] = useState({
        name: 'Carregando...',
        cnpj: '',
        address: '',
        coordinates: ''
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const updateFarmDetails = (details: Partial<typeof farmDetails>) => {
        setFarmDetails(prev => {
            const newDetails = { ...prev, ...details };
            // Salvar com chave específica do usuário
            if (currentUser.farm_id) {
                const storageKey = `farmDetails_${currentUser.farm_id}`;
                localStorage.setItem(storageKey, JSON.stringify(newDetails));
            }
            return newDetails;
        });
    };

    // Intelligent Notifications Logic
    useEffect(() => {
        const generateNotifications = () => {
            const newNotifications: Notification[] = [];

            // 1. Inventory Alerts
            inventoryItems.forEach(item => {
                if (item.quantity <= item.minQuantity) {
                    newNotifications.push({
                        id: `inv-${item.id}`,
                        title: 'Estoque Baixo',
                        message: `O item ${item.name} está abaixo do nível mínimo (${item.quantity} ${item.unit}).`,
                        type: item.quantity === 0 ? 'error' : 'warning',
                        timestamp: 'Agora',
                        read: false
                    });
                }
            });

            // 2. Machine Maintenance Alerts
            machines.forEach(machine => {
                if (machine.status === 'Manutenção') {
                    newNotifications.push({
                        id: `mac-${machine.id}`,
                        title: 'Máquina em Manutenção',
                        message: `${machine.name} está em manutenção.`,
                        type: 'warning',
                        timestamp: 'Agora',
                        read: false
                    });
                }
            });

            // 3. Livestock Health Alerts
            livestock.forEach(animal => {
                if (animal.status === 'Doente' || animal.status === 'Tratamento') {
                    newNotifications.push({
                        id: `ani-${animal.id}`,
                        title: 'Alerta Sanitário',
                        message: `Animal ${animal.tag} (${animal.type}) está ${animal.status.toLowerCase()}.`,
                        type: 'error',
                        timestamp: 'Agora',
                        read: false
                    });
                }
            });

            // 4. Urgent Activities
            activities.forEach(activity => {
                if (activity.status === 'Urgente') {
                    newNotifications.push({
                        id: `act-${activity.id}`,
                        title: 'Atividade Urgente',
                        message: `${activity.title}: ${activity.description}`,
                        type: 'warning',
                        timestamp: activity.time,
                        read: false
                    });
                }
            });

            setNotifications(newNotifications);
        };

        generateNotifications();
    }, [inventoryItems, machines, livestock, activities]);

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // ============================================================================
    // AUTO-SAVE: Salvar no cache sempre que os dados mudarem
    // ============================================================================
    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'activities', activities);
        }
    }, [activities, currentUser.farm_id]);

    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'inventory', inventoryItems);
        }
    }, [inventoryItems, currentUser.farm_id]);

    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'machines', machines);
        }
    }, [machines, currentUser.farm_id]);

    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'livestock', livestock);
        }
    }, [livestock, currentUser.farm_id]);

    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'team', teamMembers);
        }
    }, [teamMembers, currentUser.farm_id]);

    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            saveToCache(currentUser.farm_id, 'crops', crops);
        }
    }, [crops, currentUser.farm_id]);

    useEffect(() => {
        if (supabase) {
            fetchUser();
        }
    }, []);

    // ============================================================================
    // CARREGAR CACHE + SINCRONIZAR: farm_id mudou
    // ============================================================================
    useEffect(() => {
        if (currentUser.farm_id && currentUser.farm_id !== '') {
            // 1. CARREGAR DO CACHE IMEDIATAMENTE (velocidade)
            console.log('📦 Carregando dados do cache...');
            const cachedActivities = loadFromCache(currentUser.farm_id, 'activities');
            const cachedInventory = loadFromCache(currentUser.farm_id, 'inventory');
            const cachedMachines = loadFromCache(currentUser.farm_id, 'machines');
            const cachedLivestock = loadFromCache(currentUser.farm_id, 'livestock');
            const cachedTeam = loadFromCache(currentUser.farm_id, 'team');
            const cachedCrops = loadFromCache(currentUser.farm_id, 'crops');

            if (cachedActivities.length > 0) setActivities(cachedActivities);
            if (cachedInventory.length > 0) setInventoryItems(cachedInventory);
            if (cachedMachines.length > 0) setMachines(cachedMachines);
            if (cachedLivestock.length > 0) setLivestock(cachedLivestock);
            if (cachedTeam.length > 0) setTeamMembers(cachedTeam);
            if (cachedCrops.length > 0) setCrops(cachedCrops);

            // 2. SINCRONIZAR COM SUPABASE EM BACKGROUND
            if (supabase) {
                fetchData();
            }
        }
    }, [currentUser.farm_id]);

    const fetchUser = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const farmId = user.user_metadata?.farm_id || 'farm-' + user.id;
            setCurrentUser(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.full_name || 'Usuário',
                farm_id: farmId,
                role: user.user_metadata?.role || 'Proprietário'
            }));

            // Carregar dados específicos deste usuário do localStorage
            const storageKey = `farmDetails_${farmId}`;
            const savedFarmDetails = localStorage.getItem(storageKey);
            if (savedFarmDetails) {
                setFarmDetails(JSON.parse(savedFarmDetails));
            } else {
                // Se não tiver dados salvos, usar nome do usuário como padrão
                setFarmDetails({
                    name: user.user_metadata?.full_name || 'Minha Fazenda',
                    cnpj: '',
                    address: '',
                    coordinates: ''
                });
            }
        }
    };

    const fetchData = async () => {
        if (!supabase || !currentUser.farm_id) return;

        // Proteção extra: não buscar se for ID padrão antigo ou vazio
        if (currentUser.farm_id.startsWith('default-farm-')) return;

        try {
            const userFarmId = currentUser.farm_id;

            const { data: activitiesData } = await supabase.from('activities').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (activitiesData) setActivities(activitiesData as Activity[]);

            const { data: inventoryData } = await supabase.from('inventory_items').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (inventoryData) setInventoryItems(inventoryData as InventoryItem[]);

            const { data: machinesData } = await supabase.from('machines').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (machinesData) setMachines(machinesData as Machine[]);

            const { data: livestockData } = await supabase.from('livestock').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (livestockData) setLivestock(livestockData as Livestock[]);

            const { data: teamData } = await supabase.from('team_members').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (teamData) setTeamMembers(teamData as TeamMember[]);

            const { data: cropsData } = await supabase.from('crops').select('*').eq('farm_id', userFarmId).order('created_at', { ascending: false });
            if (cropsData) {
                const updatedCrops = (cropsData as Crop[]).map(crop => calculateCropStatus(crop));
                setCrops(updatedCrops);
            }

        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        }
    };

    const addActivity = async (activity: Omit<Activity, 'id' | 'time'>) => {
        const newActivity: Activity = {
            ...activity,
            id: Date.now().toString(),
            time: 'Agora mesmo',
            farm_id: currentUser.farm_id
        };
        setActivities(prev => [newActivity, ...prev]);
        if (supabase) {
            try {
                const { error } = await supabase.from('activities').insert([newActivity]);
                if (error) {
                    console.error('❌ Erro ao salvar atividade no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Atividade salva com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
        const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
            farm_id: currentUser.farm_id
        };
        setInventoryItems(prev => [...prev, newItem]);
        if (supabase) {
            try {
                const { error } = await supabase.from('inventory_items').insert([newItem]);
                if (error) {
                    console.error('❌ Erro ao salvar item no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Item salvo com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const addMachine = async (machine: Machine) => {
        const machineWithFarm = { ...machine, farm_id: currentUser.farm_id };
        setMachines(prev => [...prev, machineWithFarm]);
        if (supabase) {
            try {
                const { error } = await supabase.from('machines').insert([machineWithFarm]);
                if (error) {
                    console.error('❌ Erro ao salvar máquina no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Máquina salva com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const addLivestock = async (animal: Livestock) => {
        const animalWithFarm = { ...animal, farm_id: currentUser.farm_id };
        setLivestock(prev => [...prev, animalWithFarm]);
        if (supabase) {
            try {
                const { error } = await supabase.from('livestock').insert([animalWithFarm]);
                if (error) {
                    console.error('❌ Erro ao salvar animal no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Animal salvo com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const addTeamMember = async (member: TeamMember) => {
        const memberWithFarm = { ...member, farm_id: currentUser.farm_id };
        setTeamMembers(prev => [...prev, memberWithFarm]);
        if (supabase) {
            try {
                const { error } = await supabase.from('team_members').insert([memberWithFarm]);
                if (error) {
                    console.error('❌ Erro ao salvar membro no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Membro salvo com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const addCrop = async (crop: Crop) => {
        const cropWithFarm = { ...crop, farm_id: currentUser.farm_id };
        const updatedCrop = calculateCropStatus(cropWithFarm);
        setCrops(prev => [...prev, updatedCrop]);
        if (supabase) {
            try {
                const { error } = await supabase.from('crops').insert([updatedCrop]);
                if (error) {
                    console.error('❌ Erro ao salvar safra no Supabase:', error);
                    // Mantém localmente mesmo com erro
                } else {
                    console.log('✅ Safra salva com sucesso!');
                }
            } catch (err) {
                console.error('❌ Erro inesperado:', err);
                // Mantém localmente mesmo com erro
            }
        }
    };

    const updateCurrentUser = (user: UserProfile) => {
        setCurrentUser(user);
    };

    const deleteActivity = async (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id));
        if (supabase) {
            await supabase.from('activities').delete().eq('id', id);
        }
    };

    const deleteInventoryItem = async (id: string) => {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
        if (supabase) {
            await supabase.from('inventory_items').delete().eq('id', id);
        }
    };

    const deleteMachine = async (id: string) => {
        setMachines(prev => prev.filter(m => m.id !== id));
        if (supabase) {
            await supabase.from('machines').delete().eq('id', id);
        }
    };

    const deleteLivestock = async (id: string) => {
        setLivestock(prev => prev.filter(l => l.id !== id));
        if (supabase) {
            await supabase.from('livestock').delete().eq('id', id);
        }
    };

    const deleteCrop = async (id: string) => {
        setCrops(prev => prev.filter(c => c.id !== id));
        if (supabase) {
            await supabase.from('crops').delete().eq('id', id);
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const clearAllData = async () => {
        if (!currentUser.farm_id) return;

        try {
            const userFarmId = currentUser.farm_id;

            // Limpar do Supabase (se disponível)
            if (supabase) {
                await Promise.all([
                    supabase.from('activities').delete().eq('farm_id', userFarmId),
                    supabase.from('crops').delete().eq('farm_id', userFarmId),
                    supabase.from('machines').delete().eq('farm_id', userFarmId),
                    supabase.from('livestock').delete().eq('farm_id', userFarmId),
                    supabase.from('inventory_items').delete().eq('farm_id', userFarmId),
                    supabase.from('team_members').delete().eq('farm_id', userFarmId),
                ]);
            }

            // Limpar estado local
            setActivities([]);
            setCrops([]);
            setMachines([]);
            setLivestock([]);
            setInventoryItems([]);
            setTeamMembers([]);

            // 🆕 LIMPAR CACHE localStorage
            clearUserCache(userFarmId);

            console.log('✅ Todos os dados foram limpos com sucesso (incluindo cache)!');
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            throw error;
        }
    };

    return (
        <AppContext.Provider
            value={{
                activities,
                addActivity,
                deleteActivity,
                inventoryItems,
                addInventoryItem,
                deleteInventoryItem,
                machines,
                addMachine,
                deleteMachine,
                livestock,
                addLivestock,
                deleteLivestock,
                teamMembers,
                addTeamMember,
                crops,
                addCrop,
                deleteCrop,

                currentUser,
                updateCurrentUser,
                isMobileMenuOpen,
                toggleMobileMenu,
                closeMobileMenu,
                darkMode, toggleDarkMode,
                farmDetails, updateFarmDetails,
                notifications, markAllNotificationsAsRead,
                clearAllData
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
