# 🔧 Corrigir "Supabase client não inicializado"

## Problema
Você tem múltiplos servidores rodando e o `.env` não está sendo carregado.

## Solução Rápida

### 1️⃣ Parar TODOS os servidores

No terminal onde está rodando `npm run dev`, pressione:
```
Ctrl + C
```

Faça isso em TODAS as janelas de terminal que estão rodando o servidor.

### 2️⃣ Verificar se parou

Execute no PowerShell:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### 3️⃣ Limpar cache do Vite

```bash
rm -rf node_modules/.vite
```

Ou no Windows:
```powershell
Remove-Item -Recurse -Force node_modules\.vite
```

### 4️⃣ Iniciar servidor novamente

```bash
npm run dev
```

**IMPORTANTE**: Inicie apenas UMA vez!

### 5️⃣ Verificar se funcionou

1. Abra `http://localhost:3000`
2. Abra o Console do navegador (F12)
3. Procure por erros

Se ainda mostrar "Supabase client não inicializado":
- Verifique se o `.env` tem as credenciais corretas
- Certifique-se de que não há espaços extras nas linhas
- Confirme que as variáveis começam com `VITE_`

## ✅ Checklist

- [ ] Parei todos os servidores (Ctrl+C)
- [ ] Matei processos Node restantes
- [ ] Limpei o cache do Vite
- [ ] Iniciei o servidor apenas uma vez
- [ ] Abri o navegador em `http://localhost:3000`
- [ ] Não há mais erro de "client não inicializado"

## 🆘 Se ainda não funcionar

Verifique o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://leqjxutnvjnbygkpsnnq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- ✅ Sem espaços antes ou depois do `=`
- ✅ Sem aspas nas URLs
- ✅ Começa com `VITE_`
