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
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'Operando' | 'Manutenção' | 'Parado';
  hours: number;
  location: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  status: 'Em andamento' | 'Concluído' | 'Urgente' | 'Agendado';
  time: string;
  type: 'irrigation' | 'maintenance' | 'alert' | 'harvest';
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
