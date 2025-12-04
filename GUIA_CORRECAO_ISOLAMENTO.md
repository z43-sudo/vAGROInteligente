# 🛡️ GUIA DE CORREÇÃO DE ISOLAMENTO DE DADOS

Este guia resolve o problema crítico onde usuários conseguiam ver dados uns dos outros.

---

## 🚨 O PROBLEMA
O sistema estava usando uma configuração de segurança permissiva e, em alguns casos, carregava um "ID de fazenda padrão" antes do login completar, misturando dados.

## ✅ A SOLUÇÃO
1.  **Banco de Dados (Supabase)**: Criamos um script que **força** cada usuário a ver apenas dados que tenham o seu `farm_id`.
2.  **Frontend (App)**: Atualizamos o código para **nunca** buscar dados se o usuário não estiver 100% autenticado com sua fazenda carregada.

---

## 🛠️ PASSO A PASSO PARA APLICAR A CORREÇÃO

### 1. Atualizar o Banco de Dados (OBRIGATÓRIO)
1.  Acesse o [Supabase SQL Editor](https://app.supabase.com).
2.  Crie uma nova Query.
3.  Copie e cole o conteúdo do arquivo:
    👉 **`FIX_RLS_DEFINITIVO.sql`**
4.  Clique em **Run**.
    *   *Isso vai resetar todas as permissões e aplicar as regras estritas.*

### 2. Reiniciar o Aplicativo
1.  No terminal onde o projeto está rodando:
    *   Pressione `Ctrl + C` para parar.
    *   Execute `npm run dev` novamente.
2.  No navegador:
    *   Faça **Logout** (Sair) da conta atual.
    *   Limpe o cache do navegador se possível (ou use aba anônima).
    *   Faça **Login** novamente.

---

## 🧪 COMO TESTAR SE FUNCIONOU

### Teste de Isolamento
1.  **Abra dois navegadores** (ex: Chrome e uma Aba Anônima, ou Chrome e Edge).
2.  **Navegador 1**: Logue com **Usuário A**.
    *   Crie uma Atividade: "Teste A".
3.  **Navegador 2**: Logue com **Usuário B** (crie uma conta nova se precisar).
    *   Vá na tela de Atividades.
    *   **Resultado Esperado**: Você **NÃO** deve ver "Teste A".
    *   Crie uma Atividade: "Teste B".
4.  **Volte ao Navegador 1**:
    *   Atualize a página.
    *   **Resultado Esperado**: Você **NÃO** deve ver "Teste B", apenas "Teste A".

---

## ❓ DÚVIDAS COMUNS

**P: Meus dados sumiram?**
R: Não. Eles estão lá, mas agora só aparecem se o seu usuário for o dono real deles. Se você criou dados com um usuário de teste antigo sem `farm_id` correto, eles podem ficar ocultos. O script tenta corrigir isso automaticamente para a maioria dos casos.

**P: Erro "Failed to fetch"?**
R: Verifique seu arquivo `.env.local`. As chaves do Supabase devem estar corretas.
