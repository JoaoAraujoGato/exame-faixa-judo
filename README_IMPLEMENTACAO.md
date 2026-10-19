# Exame de Faixa de Judô

## GitHub Pages

1. Crie um repositório no GitHub.
2. Envie estes arquivos para a raiz do repositório: `index.html`, `app.js`, `judomaterials.json`, `manifest.webmanifest` e `sw.js`. O `schema.sql` é usado no Supabase e o `DOCUMENTACAO.md` é opcional para consulta.
3. No Supabase, crie um projeto, abra o SQL Editor e execute o `schema.sql` atualizado. Para um banco já existente, confirme também a coluna `exames.class_name` e a tabela `turmas`.
4. Copie a URL e a chave pública `anon` do Supabase para `SUPABASE_URL` e `SUPABASE_ANON_KEY` no início de `app.js`. Sem elas, o sistema funciona com `localStorage`.
5. No GitHub, abra `Settings > Pages`, escolha `Deploy from a branch`, selecione `main` e `/root`, e clique em `Save`.
6. Acesse a URL publicada usando `https://`. O Service Worker e a instalação PWA não funcionam corretamente em `file://`.
7. No celular, use o botão `Instalar aplicativo` quando aparecer ou o menu do navegador em `Adicionar à tela inicial`.

Se o projeto for usado com dados reais de vários usuários, configure autenticação e políticas RLS específicas no Supabase. As políticas incluídas no exemplo são abertas para facilitar o primeiro funcionamento.

Os exames disponíveis são Cinza, Azul, Amarela, Laranja, Verde, Roxa e Marrom. Branca e Preta não entram neste fluxo. O campo `belt` do JSON representa diretamente a faixa do exame em que a técnica deve ser avaliada. A avaliação é acumulativa; no exame Marrom são exibidas três técnicas de cada grupo e todos os fundamentos. Exames já salvos podem ser editados pelo botão correspondente no histórico.
