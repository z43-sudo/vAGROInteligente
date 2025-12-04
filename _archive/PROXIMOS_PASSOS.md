# Próximas Implementações Necessárias

## ✅ Já Implementado

1. **Context API** - Sistema de estado global criado
2. **Nova Atividade** - Formulário salva atividades no contexto
3. **Dashboard** - Parcialmente conectado ao contexto

## 🔧 Pendente de Implementação

### 1. Completar Dashboard - Atividades Recentes

O Dashboard precisa exibir as atividades do contexto. Atualizar a seção "Atividades Recentes":

```tsx
// No Dashboard.tsx, linha ~148
<div className="space-y-4">
  {activities.length === 0 ? (
    <p className="text-center text-gray-500 py-8">
      Nenhuma atividade cadastrada. Clique em "Nova Atividade" para começar!
    </p>
  ) : (
    activities.map((activity) => (
      <div key={activity.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
        {/* Conteúdo da atividade */}
      </div>
    ))
  )}
</div>
```

### 2. Criar Página "Adicionar Item ao Estoque"

Criar arquivo: `pages/AddInventoryItem.tsx`

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Save } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const AddInventoryItem: React.FC = () => {
  const navigate = useNavigate();
  const { addInventoryItem } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sementes' as 'Sementes' | 'Fertilizantes' | 'Defensivos' | 'Peças' | 'Combustível',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    location: '',
    lastRestock: new Date().toISOString().split('T')[0],
    status: 'Normal' as 'Normal' | 'Baixo' | 'Crítico'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem(formData);
    alert('Item adicionado ao estoque!');
    navigate('/estoque');
  };

  return (
    // Formulário similar ao NewActivity
  );
};
```

### 3. Criar Página "Adicionar Máquina"

Criar arquivo: `pages/AddMachine.tsx`

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Save } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const AddMachine: React.FC = () => {
  const navigate = useNavigate();
  const { addMachine } = useApp();
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    status: 'Parado' as 'Operando' | 'Manutenção' | 'Parado',
    hours: 0,
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMachine({
      ...formData,
      id: Date.now().toString()
    });
    alert('Máquina adicionada!');
    navigate('/maquinas');
  };

  return (
    // Formulário similar ao NewActivity
  );
};
```

### 4. Adicionar Rotas no App.tsx

```tsx
import AddInventoryItem from './pages/AddInventoryItem';
import AddMachine from './pages/AddMachine';

// Nas rotas:
<Route path="/adicionar-item" element={<AddInventoryItem />} />
<Route path="/adicionar-maquina" element={<AddMachine />} />
```

### 5. Atualizar Inventory.tsx

Adicionar botão que leva para a página de adicionar item:

```tsx
<Link 
  to="/adicionar-item"
  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
>
  <Plus size={18} />
  Adicionar Item
</Link>
```

E usar itens do contexto:

```tsx
const { inventoryItems } = useApp();
const items = inventoryItems;
```

### 6. Atualizar Machines.tsx

Adicionar botão e usar máquinas do contexto:

```tsx
const { machines: machinesFromContext } = useApp();
const machines = machinesFromContext;

// Botão:
<Link 
  to="/adicionar-maquina"
  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
>
  <Plus size={18} />
  Adicionar Máquina
</Link>
```

### 7. Revisar Todos os Botões

Garantir que todos os botões levam a rotas corretas:

**Dashboard:**
- ✅ Nova Atividade → `/nova-atividade`
- ✅ Relatório → `/relatorios`
- ✅ Irrigação → `/irrigacao`
- ✅ Alerta Pragas → `/alertas-pragas`
- ✅ Máquina → `/maquinas`
- ✅ Transporte → `/transporte`

**Inventory:**
- ⏳ Adicionar Item → `/adicionar-item`
- ⏳ Solicitar (cada item) → Modal ou página dedicada

**Machines:**
- ⏳ Adicionar Máquina → `/adicionar-maquina`

**Outras páginas:**
- Verificar botões em Activities, Livestock, Logistics, etc.

## 📝 Checklist de Implementação

- [ ] Completar exibição de atividades no Dashboard
- [ ] Criar página AddInventoryItem.tsx
- [ ] Criar página AddMachine.tsx
- [ ] Adicionar rotas no App.tsx
- [ ] Atualizar Inventory.tsx para usar contexto
- [ ] Atualizar Machines.tsx para usar contexto
- [ ] Adicionar botões "Adicionar" em todas as páginas relevantes
- [ ] Revisar e testar todas as navegações
- [ ] Garantir que dados persistem entre navegações

## 🎯 Resultado Esperado

Quando completo, o sistema terá:
1. Atividades criadas em "Nova Atividade" aparecendo em "Atividades Recentes" no Dashboard
2. Botão "Adicionar Item" no Estoque levando para formulário dedicado
3. Botão "Adicionar Máquina" em Máquinas levando para formulário dedicado
4. Todos os dados salvos no contexto e compartilhados entre páginas
5. Valores dinâmicos atualizando automaticamente
