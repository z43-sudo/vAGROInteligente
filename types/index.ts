import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
}

export interface Crop {
  id: string;
  name: string;
  area: string;
  stage: 'Floração' | 'Enchimento' | 'Vegetativo' | 'Maturação';
  progress: number;
  daysToHarvest: number;
  status: 'active' | 'completed';
  startDate?: string;
  cycleDuration?: number;
  farm_id?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'Operando' | 'Manutenção' | 'Parado';
  hours: number;
  location: string;
  farm_id?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  status: 'Em andamento' | 'Concluído' | 'Urgente' | 'Agendado';
  time: string;
  type: 'irrigation' | 'maintenance' | 'alert' | 'harvest';
  farm_id?: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ElementType;
  count?: number;
}

export interface Livestock {
  id: string;
  tag: string;
  type: 'Bovino' | 'Suíno' | 'Ovino' | 'Equino';
  breed: string;
  weight: number;
  age: number; // months
  status: 'Saudável' | 'Doente' | 'Tratamento' | 'Vendido';
  location: string;
  lastVaccination: string;
  farm_id?: string;
}

export interface LogisticsVehicle {
  id: string;
  plate: string;
  driver: string;
  status: 'Em trânsito' | 'Disponível' | 'Manutenção' | 'Carregando';
  destination?: string;
  cargo?: string;
  eta?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Sementes' | 'Fertilizantes' | 'Defensivos' | 'Peças' | 'Combustível';
  quantity: number;
  unit: string;
  minQuantity: number;
  location: string;
  lastRestock: string;
  status: 'Normal' | 'Baixo' | 'Crítico';
  farm_id?: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Tempestade';
  forecast: {
    day: string;
    temp: number;
    condition: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Tempestade';
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Administrador' | 'Gerente' | 'Agrônomo' | 'Operador' | 'Veterinário';
  email: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  avatar?: string;
  department: string;
  farm_id?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export interface SystemSettings {
  farmName: string;
  location: string;
  units: 'metric' | 'imperial';
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  farm_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  farm_id: string;
  role: 'owner' | 'member';
  subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'suspended' | 'trial';
  subscription_start_date?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'root' | 'admin' | 'support';
  created_at: string;
  updated_at: string;
}
