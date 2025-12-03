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
    inventoryItems: InventoryItem[];
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
    machines: Machine[];
    addMachine: (machine: Machine) => void;
    livestock: Livestock[];
    addLivestock: (animal: Livestock) => void;
    teamMembers: TeamMember[];
    addTeamMember: (member: TeamMember) => void;
    crops: Crop[];
    addCrop: (crop: Crop) => void;
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // SEGURANÇA: farm_id começa vazio para evitar vazamento de dados
    const [currentUser, setCurrentUser] = useState<UserProfile>({
        name: '',
        role: '',
        email: '',
        farm_id: ''
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    const [farmDetails, setFarmDetails] = useState(() => {
        const saved = localStorage.getItem('farmDetails');
        return saved ? JSON.parse(saved) : {
            name: 'Carregando...',
            cnpj: '',
            address: '',
            coordinates: ''
        };
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
            localStorage.setItem('farmDetails', JSON.stringify(newDetails));
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

    useEffect(() => {
        if (supabase) {
            fetchUser();
        }
    }, []);

    // Fetch data only after user is loaded and has a farm_id
    useEffect(() => {
        if (currentUser.farm_id) {
            fetchData();
        }
    }, [currentUser.farm_id]);

    const fetchUser = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const farmId = user.user_metadata?.farm_id || '';
            setCurrentUser(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.full_name || 'Usuário',
                farm_id: farmId
            }));
        }
    };

    const fetchData = async () => {
        if (!supabase || !currentUser.farm_id) return;
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
        if (!currentUser.farm_id) return;
        const newActivity: Activity = {
            ...activity,
            id: Date.now().toString(),
            time: 'Agora mesmo',
            farm_id: currentUser.farm_id
        };
        setActivities(prev => [newActivity, ...prev]);
        if (supabase) {
            await supabase.from('activities').insert([newActivity]);
        }
    };

    const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
        if (!currentUser.farm_id) return;
        const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
            farm_id: currentUser.farm_id
        };
        setInventoryItems(prev => [...prev, newItem]);
        if (supabase) {
            await supabase.from('inventory_items').insert([newItem]);
        }
    };

    const addMachine = async (machine: Machine) => {
        if (!currentUser.farm_id) return;
        const machineWithFarm = { ...machine, farm_id: currentUser.farm_id };
        setMachines(prev => [...prev, machineWithFarm]);
        if (supabase) {
            await supabase.from('machines').insert([machineWithFarm]);
        }
    };

    const addLivestock = async (animal: Livestock) => {
        if (!currentUser.farm_id) return;
        const animalWithFarm = { ...animal, farm_id: currentUser.farm_id };
        setLivestock(prev => [...prev, animalWithFarm]);
        if (supabase) {
            await supabase.from('livestock').insert([animalWithFarm]);
        }
    };

    const addTeamMember = async (member: TeamMember) => {
        if (!currentUser.farm_id) return;
        const memberWithFarm = { ...member, farm_id: currentUser.farm_id };
        setTeamMembers(prev => [...prev, memberWithFarm]);
        if (supabase) {
            await supabase.from('team_members').insert([memberWithFarm]);
        }
    };

    const addCrop = async (crop: Crop) => {
        if (!currentUser.farm_id) return;
        const cropWithFarm = { ...crop, farm_id: currentUser.farm_id };
        const updatedCrop = calculateCropStatus(cropWithFarm);
        setCrops(prev => [...prev, updatedCrop]);
        if (supabase) {
            await supabase.from('crops').insert([updatedCrop]);
        }
    };

    const updateCurrentUser = (user: UserProfile) => {
        setCurrentUser(user);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <AppContext.Provider
            value={{
                activities,
                addActivity,
                inventoryItems,
                addInventoryItem,
                machines,
                addMachine,
                livestock,
                addLivestock,
                teamMembers,
                addTeamMember,
                crops,
                addCrop,

                currentUser,
                updateCurrentUser,
                isMobileMenuOpen,
                toggleMobileMenu,
                closeMobileMenu,
                darkMode, toggleDarkMode,
                farmDetails, updateFarmDetails,
                notifications, markAllNotificationsAsRead
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
