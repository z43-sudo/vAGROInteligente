# 🏗️ ARQUITETURA DO PROJETO - AGRO INTELIGENTE

## 📐 Visão Geral

O **Agro Inteligente** é uma aplicação web completa de gestão agropecuária construída com React, TypeScript, Vite e Supabase.

---

## 🎯 Stack Tecnológico

### Frontend
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.8.2** - Tipagem estática
- **Vite 6.2.0** - Build tool e dev server
- **React Router DOM 7.9.6** - Roteamento
- **Tailwind CSS** - Estilização (via CDN)

### Backend/Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL Database
  - Autenticação
  - Realtime subscriptions
  - Row Level Security (RLS)
  - Storage

### APIs Externas
- **OpenWeatherMap** - Dados climáticos
- **Google Gemini AI** - Insights inteligentes
- **RSS Parser** - Agregação de notícias
- **Leaflet/OpenStreetMap** - Mapas e geolocalização

### Bibliotecas UI/UX
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações
- **React Leaflet** - Componentes de mapa
- **Google Fonts (Inter)** - Tipografia

---

## 📁 Estrutura de Pastas

```
agro-inteligente/
│
├── components/              # Componentes reutilizáveis
│   ├── Header.tsx          # Cabeçalho com notificações e perfil
│   ├── Sidebar.tsx         # Menu de navegação lateral
│   ├── Layout.tsx          # Layout base (Header + Sidebar + Content)
│   ├── MetricCard.tsx      # Cards de métricas
│   ├── ProtectedRoute.tsx  # HOC para proteção de rotas
│   ├── WhatsAppButton.tsx  # Botão flutuante do WhatsApp
│   ├── AgroNewsPanel.tsx   # Painel de notícias
│   ├── LivestockCalculators.tsx  # Calculadoras de pecuária
│   ├── LivestockMarketCharts.tsx # Gráficos de mercado
│   └── SlaughterhouseLogistics.tsx # Logística de frigoríficos
│
├── pages/                  # Páginas da aplicação
│   ├── Dashboard.tsx       # Página principal
│   ├── Login.tsx           # Tela de login
│   ├── Signup.tsx          # Tela de cadastro
│   ├── Crops.tsx           # Gestão de safras
│   ├── Machines.tsx        # Gestão de máquinas
│   ├── Livestock.tsx       # Gestão de pecuária
│   ├── Inventory.tsx       # Gestão de estoque
│   ├── Financial.tsx       # Gestão financeira
│   ├── Activities.tsx      # Lista de atividades
│   ├── Logistics.tsx       # Logística e mapas
│   ├── Transport.tsx       # Gestão de transporte
│   ├── Weather.tsx         # Clima e previsões
│   ├── Team.tsx            # Gestão de equipe
│   ├── Chat.tsx            # Chat em tempo real
│   ├── News.tsx            # Notícias do agronegócio
│   ├── Partners.tsx        # Página de parceiros
│   ├── Profile.tsx         # Perfil do usuário
│   ├── Settings.tsx        # Configurações
│   ├── Manager.tsx         # Visão gerencial
│   ├── Reports.tsx         # Relatórios
│   ├── AdminPanel.tsx      # Painel administrativo
│   ├── NewActivity.tsx     # Adicionar atividade
│   ├── AddInventoryItem.tsx # Adicionar item ao estoque
│   ├── AddMachine.tsx      # Adicionar máquina
│   ├── IrrigationControl.tsx # Controle de irrigação
│   ├── PestAlert.tsx       # Alertas de pragas
│   ├── Checkout.tsx        # Página de checkout
│   └── GenericPage.tsx     # Página genérica
│
├── contexts/               # Gerenciamento de estado global
│   ├── AppContext.tsx      # Estado da aplicação (dados, funcões)
│   └── AuthContext.tsx     # Estado de autenticação
│
├── services/               # Integrações com APIs
│   ├── supabaseClient.ts   # Cliente Supabase
│   ├── weatherService.ts   # Serviço de clima
│   ├── commodityService.ts # Preços de commodities
│   └── geminiService.ts    # Integração Google Gemini
│
├── hooks/                  # Custom React Hooks
│   ├── useGeolocation.ts   # Hook de geolocalização
│   └── useLivestockMarket.ts # Hook de mercado pecuário
│
├── types/                  # Definições TypeScript
│   └── index.ts            # Todas as interfaces e types
│
├── SQL Scripts/           # Scripts do banco de dados
│   ├── LIMPAR_SUPABASE_COMPLETO.sql
│   ├── PARTE_1_TABELAS.sql
│   ├── PARTE_2_POLITICAS.sql
│   ├── PARTE_3_TRIGGERS.sql
│   └── ATIVAR_REALTIME.sql
│
├── App.tsx                # Componente raiz da aplicação
├── index.tsx              # Entry point
├── index.html             # HTML base
├── index.css              # Estilos globais
├── vite.config.ts         # Configuração Vite
├── tsconfig.json          # Configuração TypeScript
├── package.json           # Dependências e scripts
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de .env
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Documentação do projeto
```

---

## 🔄 Fluxo de Dados

### 1. Autenticação
```
Login.tsx
    ↓
AuthContext.signIn()
    ↓
Supabase Auth
    ↓
Session armazenada
    ↓
user.user_metadata.farm_id → usado em todo o app
```

### 2. Dados da Aplicação
```
Dashboard.tsx (ou outra página)
    ↓
useApp() hook
    ↓
AppContext
    ↓
fetchData() → Supabase
    ↓
Estado local (arrays)
    ↓
Renderização
```

### 3. Operações CRUD
```
Usuário interage com UI
    ↓
Função do AppContext (ex: addCrop)
    ↓
1. Insere no Supabase
    ↓
2. Atualiza estado local (setState)
    ↓
UI atualiza automaticamente
```

### 4. Realtime (Chat)
```
Chat.tsx
    ↓
Supabase Realtime subscription
    ↓
Escuta INSERT em 'messages'
    ↓
Callback adiciona msg ao estado
    ↓
UI atualiza em tempo real
```

---

## 🗄️ Esquema do Banco de Dados

### Tabelas Principais

#### `users`
```sql
- id (uuid, PK)
- email (text)
- full_name (text)
- farm_id (uuid) → Chave de isolamento
- role (text) → 'owner' | 'member'
- subscription_plan (text)
- subscription_status (text)
- created_at (timestamp)
```

#### `crops`
```sql
- id (uuid, PK)
- farm_id (uuid, FK) → RLS
- name (text)
- area (text)
- stage (text)
- progress (int)
- days_to_harvest (int)
- status (text)
- start_date (date)
- cycle_duration (int)
- created_at (timestamp)
```

#### `machines`
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- name (text)
- type (text)
- status (text)
- hours (int)
- location (text)
```

#### `livestock`
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- tag (text)
- type (text)
- breed (text)
- weight (numeric)
- age (int)
- status (text)
- location (text)
- last_vaccination (date)
```

#### `inventory`
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- name (text)
- category (text)
- quantity (numeric)
- unit (text)
- min_quantity (numeric)
- location (text)
- last_restock (date)
- status (text)
```

#### `activities`
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- title (text)
- description (text)
- status (text)
- type (text)
- created_at (timestamp)
```

#### `team_members`
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- name (text)
- role (text)
- email (text)
- phone (text)
- status (text)
- department (text)
```

#### `messages` (Chat)
```sql
- id (uuid, PK)
- farm_id (uuid, FK)
- sender_id (uuid)
- sender_name (text)
- content (text)
- created_at (timestamp)
```

#### `admin_users`
```sql
- id (uuid, PK)
- email (text)
- role (text) → 'root' | 'admin' | 'support'
- created_at (timestamp)
```

---

## 🔐 Segurança (RLS - Row Level Security)

### Princípio
Cada tabela tem políticas RLS que garantem que:
- Usuários só veem dados do seu `farm_id`
- Inserções automáticas incluem o `farm_id` do usuário
- Updates e deletes só funcionam para dados do próprio `farm_id`

### Exemplo de Política RLS
```sql
-- SELECT Policy
CREATE POLICY "Users can view own farm data"
ON crops FOR SELECT
USING (farm_id = (auth.jwt() ->> 'user_metadata')::json ->> 'farm_id');

-- INSERT Policy
CREATE POLICY "Users can insert own farm data"
ON crops FOR INSERT
WITH CHECK (farm_id = (auth.jwt() ->> 'user_metadata')::json ->> 'farm_id');
```

---

## 🎨 Arquitetura de Componentes

### Hierarquia de Componentes
```
App
  ├── AuthProvider
  │     ├── AppProvider
  │     │     ├── Router
  │     │     │     ├── Login (público)
  │     │     │     ├── Signup (público)
  │     │     │     └── ProtectedRoute
  │     │     │           ├── Layout
  │     │     │           │     ├── Header
  │     │     │           │     ├── Sidebar
  │     │     │           │     └── {Page Component}
```

### Padrão de Páginas
Todas as páginas protegidas seguem:
```tsx
<ProtectedRoute>
  <Layout>
    <NomeDaPagina />
  </Layout>
</ProtectedRoute>
```

---

## 📊 Gestão de Estado

### Estado Global (AppContext)
```typescript
{
  // Dados
  activities: Activity[]
  crops: Crop[]
  machines: Machine[]
  livestock: Livestock[]
  inventoryItems: InventoryItem[]
  teamMembers: TeamMember[]
  notifications: Notification[]
  
  // Usuário
  currentUser: UserProfile
  
  // Fazenda
  farmDetails: {
    name: string
    cnpj: string
    address: string
    coordinates: string
  }
  
  // UI
  darkMode: boolean
  isMobileMenuOpen: boolean
  
  // Funções CRUD
  addCrop()
  deleteCrop()
  addMachine()
  deleteMachine()
  addLivestock()
  deleteLivestock()
  addInventoryItem()
  deleteInventoryItem()
  addActivity()
  deleteActivity()
  addTeamMember()
  
  // Funções utilitárias
  updateFarmDetails()
  markAllNotificationsAsRead()
  clearAllData()
}
```

### Estado de Autenticação (AuthContext)
```typescript
{
  session: Session | null
  user: User | null
  loading: boolean
  signIn()
  signUp()
  signOut()
}
```

---

## 🚀 Rotas da Aplicação

### Públicas
- `/login` → Login.tsx
- `/signup` → Signup.tsx

### Protegidas
```typescript
const routes = [
  { path: '/', component: Dashboard },
  { path: '/safras', component: Crops },
  { path: '/financeiro', component: Financial },
  { path: '/atividades', component: Activities },
  { path: '/maquinas', component: Machines },
  { path: '/pecuaria', component: Livestock },
  { path: '/logistica', component: Logistics },
  { path: '/estoque', component: Inventory },
  { path: '/clima', component: Weather },
  { path: '/equipe', component: Team },
  { path: '/configuracoes', component: Settings },
  { path: '/perfil', component: Profile },
  { path: '/gestor', component: Manager },
  { path: '/nova-atividade', component: NewActivity },
  { path: '/irrigacao', component: IrrigationControl },
  { path: '/alertas-pragas', component: PestAlert },
  { path: '/relatorios', component: Reports },
  { path: '/transporte', component: Transport },
  { path: '/adicionar-item', component: AddInventoryItem },
  { path: '/adicionar-maquina', component: AddMachine },
  { path: '/chat', component: Chat },
  { path: '/noticias', component: News },
  { path: '/admin', component: AdminPanel }, // Restrito
  { path: '/parceiros', component: Partners },
];
```

---

## 🔌 Integrações

### Supabase
```typescript
// Inicialização
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signUp({ email, password, options: { data } })
supabase.auth.signOut()
supabase.auth.onAuthStateChange()

// Database
supabase.from('crops').select('*')
supabase.from('crops').insert([data])
supabase.from('crops').update(data).eq('id', id)
supabase.from('crops').delete().eq('id', id)

// Realtime
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
  .subscribe()
```

### OpenWeatherMap
```typescript
// Clima atual
const weather = await getCurrentWeather(lat, lon);

// Forecast
const forecast = await getForecast(lat, lon);
```

### Google Gemini
```typescript
const insight = await generateInsight(farmData);
```

---

## 🎨 Design System

### Cores Principais
```css
Verde Principal: #166534 (green-800)
Verde Claro: #dcfce7 (green-100)
Verde Hover: #15803d (green-700)
Cinza Text: #1f2937 (gray-800)
Cinza Light: #f9fafb (gray-50)
Vermelho Alerta: #dc2626 (red-600)
Amarelo Warning: #f59e0b (amber-500)
```

### Tipografia
```css
Font Family: 'Inter', sans-serif
Tamanhos:
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
```

### Espaçamento
Segue escala do Tailwind CSS (4px base)

---

## 📱 Responsividade

### Breakpoints
```css
sm: 640px
md: 768px  → Sidebar fixa aparece
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Estratégia Mobile-First
- Sidebar oculta por padrão em mobile
- Menu hambúrguer
- Overlay de fundo
- Layout de cards em coluna única
- Texto reduzido em mobile

---

## 🧪 Testing Strategy (Planejado)

### Unit Tests
- Hooks personalizados
- Funções de serviço
- Helpers e utils

### Integration Tests
- Fluxos de autenticação
- CRUD operations
- Realtime subscriptions

### E2E Tests
- User flows críticos
- Login → Dashboard → Add Crop → Logout

---

## 🚀 Deploy

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENWEATHER_API_KEY=
```

### Build de Produção
```bash
npm run build
# Output: dist/
```

### Plataformas Recomendadas
- **Vercel** (Recomendado)
- **Netlify**
- **Cloudflare Pages**
- **AWS Amplify**

### Configuração Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 📈 Melhorias Futuras

### Funcionalidades Planejadas
- [ ] Dark Mode completo
- [ ] PWA (Progressive Web App)
- [ ] Notificações Push
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Modo offline
- [ ] Integração com drones
- [ ] Análise de solo com IA
- [ ] Previsão de safra com ML
- [ ] Integração com marketplaces
- [ ] App mobile nativo (React Native)

### Otimizações
- [ ] Code splitting avançado
- [ ] Lazy loading de imagens
- [ ] Service Workers
- [ ] Cache estratégico
- [ ] SSR/SSG (Next.js migration)

---

## 👥 Equipe de Desenvolvimento

**Lead Developer:** Google Deepmind - Antigravity Agent  
**Cliente/Product Owner:** Alisson  
**Projeto:** Agro Inteligente  
**Início:** 2024-11-30  
**Status:** Produção-Ready

---

## 📚 Documentação Adicional

- [VALIDACAO_COMPLETA.md](./VALIDACAO_COMPLETA.md) - Checklist completo
- [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) - Guia de início
- [README.md](./README.md) - Visão geral do projeto

---

**Última atualização:** 2025-12-05  
**Versão da Arquitetura:** 1.0.0
