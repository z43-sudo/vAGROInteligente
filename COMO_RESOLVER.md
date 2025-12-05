# 🔧 Resolver "Supabase client não inicializado" - DEFINITIVO

## 🎯 Problema
O erro "Supabase client não inicializado" acontece porque:
1. As credenciais no `.env` não estão sendo lidas
2. O servidor não foi reiniciado após alterar o `.env`

## ✅ Solução em 5 Passos

### 1️⃣ Verificar o arquivo `.env`

Abra o arquivo `.env` e confirme que está assim:

```env
VITE_SUPABASE_URL=https://leqjxutnvjnbygkpsnnq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcWp4dXRudmpuYnlna3Bzbm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4ODI4NTQsImV4cCI6MjA4MDQ1ODg1NH0.8dsqT58jgczslIBF7LwLgF-FlrCfcucl0UXyDtH583I
VITE_OPENWEATHER_API_KEY=40d5f15178e828993fb96d0e2a1ea4ab
```

**Importante:**
- ❌ Sem espaços antes ou depois do `=`
- ❌ Sem aspas nas URLs
- ✅ Deve começar com `VITE_`

### 2️⃣ Limpar o Supabase (OPCIONAL)

Se quiser começar do zero no banco de dados:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o arquivo `LIMPAR_SUPABASE_COMPLETO.sql`

Isso vai:
- ❌ Deletar todas as tabelas
- ✅ Recriar tudo do zero
- ✅ Configurar RLS corretamente
- ✅ Adicionar você como admin

### 3️⃣ Parar o servidor

No terminal, pressione:
```
Ctrl + C
```

### 4️⃣ Limpar cache

```bash
rm -rf node_modules/.vite
```

Ou no PowerShell:
```powershell
Remove-Item -Recurse -Force node_modules\.vite
```

### 5️⃣ Reiniciar o servidor

```bash
npm run dev
```

**IMPORTANTE**: Inicie apenas UMA vez!

## 🧪 Testar

1. Abra `http://localhost:3000`
2. Pressione `F12` para abrir o Console
3. Procure por erros

Se aparecer "Supabase client não inicializado":
- O `.env` está errado
- O servidor não foi reiniciado
- Há espaços ou caracteres extras no `.env`

## ✅ Deve funcionar agora!

Após seguir esses passos:
1. Vá em `http://localhost:3000/login`
2. Clique em "Cadastrar"
3. Crie sua primeira conta
4. Faça login

## 🆘 Ainda com erro?

Envie uma screenshot do:
1. Arquivo `.env` completo
2. Console do navegador (F12)
3. Terminal onde está rodando `npm run dev`
