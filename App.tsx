import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Crops from './pages/Crops';
import Financial from './pages/Financial';
import Activities from './pages/Activities';
import Machines from './pages/Machines';
import Livestock from './pages/Livestock';
import Logistics from './pages/Logistics';
import Inventory from './pages/Inventory';
import Weather from './pages/Weather';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Manager from './pages/Manager';
import NewActivity from './pages/NewActivity';
import IrrigationControl from './pages/IrrigationControl';
import PestAlert from './pages/PestAlert';
import Reports from './pages/Reports';
import Transport from './pages/Transport';
import AddInventoryItem from './pages/AddInventoryItem';
import AddMachine from './pages/AddMachine';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import News from './pages/News';
import AdminPanel from './pages/AdminPanel';
import Partners from './pages/Partners';
import IARecomendacoes from './pages/IARecomendacoes';
import AreaMapping from './pages/AreaMapping';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/safras" element={
              <ProtectedRoute>
                <Layout>
                  <Crops />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Layout>
                  <Financial />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/atividades" element={
              <ProtectedRoute>
                <Layout>
                  <Activities />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/maquinas" element={
              <ProtectedRoute>
                <Layout>
                  <Machines />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/pecuaria" element={
              <ProtectedRoute>
                <Layout>
                  <Livestock />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/logistica" element={
              <ProtectedRoute>
                <Layout>
                  <Logistics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/estoque" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clima" element={
              <ProtectedRoute>
                <Layout>
                  <Weather />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipe" element={
              <ProtectedRoute>
                <Layout>
                  <Team />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/gestor" element={
              <ProtectedRoute>
                <Layout>
                  <Manager />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/nova-atividade" element={
              <ProtectedRoute>
                <Layout>
                  <NewActivity />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/irrigacao" element={
              <ProtectedRoute>
                <Layout>
                  <IrrigationControl />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/alertas-pragas" element={
              <ProtectedRoute>
                <Layout>
                  <PestAlert />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/transporte" element={
              <ProtectedRoute>
                <Layout>
                  <Transport />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/adicionar-item" element={
              <ProtectedRoute>
                <Layout>
                  <AddInventoryItem />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/adicionar-maquina" element={
              <ProtectedRoute>
                <Layout>
                  <AddMachine />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/noticias" element={
              <ProtectedRoute>
                <Layout>
                  <News />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/parceiros" element={
              <ProtectedRoute>
                <Layout>
                  <Partners />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ia-recomendacoes" element={
              <ProtectedRoute>
                <Layout>
                  <IARecomendacoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mapeamento-area" element={
              <ProtectedRoute>
                <Layout>
                  <AreaMapping />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;