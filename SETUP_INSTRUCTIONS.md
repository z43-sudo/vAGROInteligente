# Configuração do Supabase

Para corrigir o erro de autenticação e conectar o aplicativo ao Supabase, você precisa configurar as credenciais no arquivo `.env`.

## Passos:

1.  Acesse o painel do seu projeto no Supabase: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  Vá em **Project Settings** (ícone de engrenagem) -> **API**.
3.  Copie a **Project URL**.
4.  Copie a **anon** / **public** Key.
5.  Abra o arquivo `.env` na raiz do projeto.
6.  Preencha as variáveis conforme abaixo:

```env
VITE_SUPABASE_URL=sua_url_do_projeto_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

7.  Salve o arquivo.
8.  Reinicie o servidor de desenvolvimento (pare com `Ctrl+C` e rode `npm run dev` novamente).

## Observação

O erro na tela de login ("Sistema não configurado") desaparecerá assim que essas chaves forem configuradas corretamente.
