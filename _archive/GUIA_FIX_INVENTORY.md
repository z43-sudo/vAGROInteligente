# 🔧 CORREÇÃO ESPECÍFICA - INVENTORY (ESTOQUE)

## ❌ PROBLEMA

Os dados adicionados no **Inventory (Estoque)** não estão sendo salvos no Supabase.

## ✅ SOLUÇÃO

Execute o script SQL completo `FIX_INVENTORY_COMPLETO.sql` no Supabase.

---

## 🚀 PASSO A PASSO

### 1️⃣ Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto

### 2️⃣ Abrir SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### 3️⃣ Executar Script

1. Abra o arquivo: `FIX_INVENTORY_COMPLETO.sql`
2. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor (Ctrl+V)
4. Clique em **"Run"** ou pressione **Ctrl+Enter**
5. Aguarde as mensagens de sucesso

### 4️⃣ Verificar Resultado

Você deve ver mensagens como:

```
✅ Tabela inventory_items já existe!
✅ Políticas criadas para INVENTORY_ITEMS
✅ TESTE DE INSERÇÃO
✅ CORREÇÃO COMPLETA APLICADA!
```

### 5️⃣ Testar no Aplicativo

1. Recarregue o aplicativo (F5)
2. Vá em **"Estoque"** → **"Adicionar Item"**
3. Preencha os dados:
   - Nome: Teste Soja
   - Categoria: Sementes
   - Quantidade: 100
   - Unidade: sc
   - Quantidade Mínima: 20
   - Localização: Armazém A
4. Clique em **"Adicionar ao Estoque"**
5. ✅ O item deve aparecer na lista!

---

## 🔍 VERIFICAÇÃO

### No Aplicativo:

1. O item aparece na lista imediatamente? ✅
2. Após recarregar (F5), o item ainda está lá? ✅
3. Não aparece alerta de erro? ✅

### No Console (F12):

Abra o console e procure por:
- ✅ `✅ Item salvo com sucesso!`
- ❌ Se aparecer erro, copie e me envie

### No Supabase Dashboard:

1. Vá em **"Table Editor"**
2. Selecione **"inventory_items"**
3. Veja se os itens aparecem lá ✅

---

## 🎯 O QUE O SCRIPT FAZ

### 1. Verifica e Cria a Tabela
- Verifica se `inventory_items` existe
- Cria se não existir
- Garante todas as colunas necessárias

### 2. Configura Permissões
- Remove políticas antigas restritivas
- Cria 4 políticas novas PERMISSIVAS:
  - **SELECT**: Permite ler dados
  - **INSERT**: Permite adicionar dados
  - **UPDATE**: Permite atualizar dados
  - **DELETE**: Permite deletar dados

### 3. Testa Inserção
- Insere um item de teste
- Verifica se foi salvo
- Remove o item de teste

### 4. Mostra Estatísticas
- Total de itens
- Itens por status (Crítico, Baixo, Normal)
- Número de fazendas diferentes

---

## 🐛 TROUBLESHOOTING

### Problema: "Erro ao executar script SQL"

**Solução**:
1. Certifique-se de copiar TODO o script
2. Verifique se não há caracteres especiais
3. Execute novamente

### Problema: "Item não aparece no Supabase"

**Solução**:
1. Abra o console (F12)
2. Vá na aba "Network"
3. Adicione um item
4. Procure por requisições para "inventory_items"
5. Veja se há erro 403 ou 401
6. Se sim, execute o script SQL novamente

### Problema: "Item aparece localmente mas não no Supabase"

**Solução**:
1. Verifique sua conexão com internet
2. Abra o console (F12)
3. Procure por erros em vermelho
4. Execute o script SQL novamente
5. Limpe o cache (Ctrl+Shift+Delete)

---

## 📊 ESTRUTURA DA TABELA

A tabela `inventory_items` tem as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | TEXT | ID único do item |
| `name` | TEXT | Nome do item |
| `category` | TEXT | Categoria (Sementes, Fertilizantes, etc) |
| `quantity` | NUMERIC | Quantidade atual |
| `unit` | TEXT | Unidade (sc, ton, L, un) |
| `min_quantity` | NUMERIC | Quantidade mínima (alerta) |
| `location` | TEXT | Localização física |
| `last_restock` | TEXT | Data da última reposição |
| `status` | TEXT | Status (Normal, Baixo, Crítico) |
| `farm_id` | TEXT | ID da fazenda |
| `created_at` | TIMESTAMPTZ | Data de criação |

---

## ✅ CHECKLIST FINAL

Após executar o script:

- [ ] Script executado sem erros
- [ ] Mensagens de sucesso apareceram
- [ ] Aplicativo recarregado (F5)
- [ ] Consegue adicionar item no estoque
- [ ] Item aparece na lista
- [ ] Item persiste após recarregar
- [ ] Console mostra "✅ Item salvo com sucesso!"
- [ ] Item aparece no Supabase Dashboard

---

## 🎉 RESULTADO ESPERADO

Após executar o script:

✅ **Adicionar itens funciona perfeitamente**
✅ **Dados salvos no Supabase automaticamente**
✅ **Sem alertas de erro**
✅ **Dados persistem após recarregar**
✅ **Sincronização em tempo real**

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Execute o script SQL
2. ✅ Teste adicionar um item
3. ✅ Verifique no Supabase Dashboard
4. ✅ Use o sistema normalmente!

---

**Arquivo**: `FIX_INVENTORY_COMPLETO.sql`
**Data**: 03/12/2025
**Status**: ✅ PRONTO PARA EXECUTAR
