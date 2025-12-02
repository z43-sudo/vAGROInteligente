import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Activity, Machine, InventoryItem, Livestock, TeamMember, Crop } from '../types';
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
    };
    updateFarmDetails: (details: { name?: string; cnpj?: string; address?: string }) => void;
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

    const [currentUser, setCurrentUser] = useState<UserProfile>({
        name: 'Gestor',
        role: 'Administrador',
        email: 'admin@agro.com',
        farm_id: 'farm_1' // Default/Mock farm ID
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    const [farmDetails, setFarmDetails] = useState(() => {
        const saved = localStorage.getItem('farmDetails');
        return saved ? JSON.parse(saved) : {
            name: 'Agro Inteligente',
            cnpj: '00.000.000/0001-00',
            address: 'Rodovia BR-163, Km 700'
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

    useEffect(() => {
        if (supabase) {
            fetchData();
            fetchUser();
        }
    }, []);

    // ... (fetchUser and fetchData implementation remains the same)

    const fetchUser = async () => {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUser(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.full_name || 'Gestor',
                farm_id: user.user_metadata?.farm_id || 'farm_1'
            }));
        }
    };

    const fetchData = async () => {
        if (!supabase) return;
        try {
            const { data: activitiesData } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
            if (activitiesData) setActivities(activitiesData as Activity[]);

            const { data: inventoryData } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
            if (inventoryData) setInventoryItems(inventoryData as InventoryItem[]);

            const { data: machinesData } = await supabase.from('machines').select('*').order('created_at', { ascending: false });
            if (machinesData) setMachines(machinesData as Machine[]);

            const { data: livestockData } = await supabase.from('livestock').select('*').order('created_at', { ascending: false });
            if (livestockData) setLivestock(livestockData as Livestock[]);

            const { data: teamData } = await supabase.from('team_members').select('*').order('created_at', { ascending: false });
            if (teamData) setTeamMembers(teamData as TeamMember[]);

            const { data: cropsData } = await supabase.from('crops').select('*').order('created_at', { ascending: false });
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
        };
        setActivities(prev => [newActivity, ...prev]);
        if (supabase) {
            await supabase.from('activities').insert([newActivity]);
        }
    };

    const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
        const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
        };
        // Fix: InventoryItem might not have 'time' property based on previous usage, checking types.ts would be better but assuming based on addActivity pattern or just ignore if not needed.
        // Actually, let's stick to the existing logic but just add the new state.
        setInventoryItems(prev => [...prev, newItem]);
        if (supabase) {
            await supabase.from('inventory_items').insert([newItem]);
        }
    };

    const addMachine = async (machine: Machine) => {
        setMachines(prev => [...prev, machine]);
        if (supabase) {
            await supabase.from('machines').insert([machine]);
        }
    };

    const addLivestock = async (animal: Livestock) => {
        setLivestock(prev => [...prev, animal]);
        if (supabase) {
            await supabase.from('livestock').insert([animal]);
        }
    };

    const addTeamMember = async (member: TeamMember) => {
        setTeamMembers(prev => [...prev, member]);
        if (supabase) {
            await supabase.from('team_members').insert([member]);
        }
    };

    const addCrop = async (crop: Crop) => {
        const updatedCrop = calculateCropStatus(crop);
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
                farmDetails, updateFarmDetails
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
