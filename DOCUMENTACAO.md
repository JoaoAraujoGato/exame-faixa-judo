# Documentação do Sistema de Exame de Faixa de Judô

## 1. Visão geral

O projeto é uma aplicação web responsiva para registrar exames de faixa de Judô. Ele funciona como uma SPA simples usando HTML, Tailwind CSS e JavaScript modularizado em um único arquivo principal.

A aplicação pode funcionar de duas formas:

- Offline, usando `localStorage` do navegador.
- Online, usando Supabase como banco de dados PostgreSQL.

O conteúdo curricular utilizado pela aplicação está no arquivo `judomaterials.json`.

## 2. Arquivos do projeto

### `index.html`

Contém a estrutura visual da aplicação:

- Cabeçalho do sistema.
- Botões de navegação entre Novo exame e Histórico.
- Formulário do aluno, turma, faixa e nota de corte.
- Guias explicativos das notas.
- Área dinâmica das técnicas e fundamentos.
- Tabela de histórico.
- Filtros e botão de exportação.

As classes do Tailwind CSS são usadas diretamente no HTML para definir layout, cores, espaçamento, responsividade e estados visuais.

### `app.js`

É o arquivo principal da aplicação. Ele controla:

- Carregamento do currículo.
- Renderização das técnicas e fundamentos.
- Cálculo da média.
- Cadastro e edição de exames.
- Histórico e filtros.
- Turmas.
- Persistência local e Supabase.
- Exportação de PDFs.
- Instalação como PWA.

### `judomaterials.json`

É a fonte de dados curricular. Cada item possui, entre outros campos:

```json
{
  "id": "nage-ashi-01",
  "type": "tecnica",
  "group": "Nage Waza / Ashi Waza",
  "name": "O Soto Gari",
  "belt": "cinza"
}
```

O campo `belt` representa a faixa do exame em que o conteúdo deve ser avaliado. A aplicação usa a ordem acumulativa definida em `examOrder`.

### `schema.sql`

Cria as tabelas do Supabase:

- `alunos`: cadastro de alunos.
- `turmas`: turmas disponíveis.
- `exames`: resumo de cada avaliação.
- `itens_avaliacao`: estrutura preparada para armazenar itens individuais.

O campo `details` da tabela `exames` guarda atualmente os detalhes da avaliação em formato JSON.

### `manifest.webmanifest`

Define os metadados do aplicativo instalável:

- Nome do aplicativo.
- Nome curto.
- Cor do tema.
- Tela inicial.
- Modo standalone.

### `sw.js`

É o Service Worker do PWA. Ele armazena os arquivos principais em cache para permitir abertura offline depois do primeiro carregamento.

### `README.md`

Contém o guia resumido de publicação no GitHub Pages e configuração do Supabase.

## 3. Inicialização da aplicação

O HTML carrega as bibliotecas externas:

- Tailwind CSS via CDN.
- Supabase JS SDK.
- jsPDF.
- jsPDF AutoTable.

Depois carrega:

```html
<script type="module" src="app.js"></script>
```

No final do `app.js`, a função `load()` é executada.

Ela:

1. Lê o arquivo `judomaterials.json`.
2. Preenche os selects de faixa.
3. Consulta exames e turmas no Supabase, se configurado.
4. Carrega turmas do `localStorage`, quando necessário.
5. Renderiza o formulário.
6. Renderiza o histórico.

## 4. Faixas e conteúdo acumulativo

Os exames disponíveis são:

```text
Cinza → Azul → Amarela → Laranja → Verde → Roxa → Marrom
```

O exame escolhido inclui o conteúdo de todas as faixas anteriores.

Exemplo:

- Exame Azul = conteúdos de Cinza e Azul.
- Exame Verde = conteúdos de Cinza, Azul, Amarela, Laranja e Verde.

Branca e Preta não fazem parte deste fluxo de exames.

## 5. Regra especial da faixa Marrom

Quando a faixa Marrom é selecionada, a função `accumulated()`:

1. Obtém todas as técnicas acumuladas.
2. Divide as técnicas por grupo.
3. Sorteia três técnicas de cada grupo.
4. Mantém todos os fundamentos.

O sorteio é armazenado em `marromSelection` durante a avaliação. Ao editar um exame Marrom salvo, os mesmos itens originalmente sorteados são restaurados.

Ao trocar de faixa e selecionar Marrom novamente, um novo sorteio é realizado.

## 6. Avaliação das técnicas

Cada técnica possui uma nota de 0 a 5:

| Nota | Significado |
|---:|---|
| 0 | Não sabe ou apresenta erro grave |
| 1 | Insuficiente |
| 2 | Em desenvolvimento |
| 3 | Básico e funcional |
| 4 | Bom, com pequenos ajustes |
| 5 | Execução perfeita |

Cada técnica também possui um campo de observação individual.

## 7. Avaliação dos fundamentos

Os fundamentos usam as seguintes notas:

| Nota | Significado |
|---:|---|
| 0 | Não demonstrou |
| 2 | Reconhece, mas não explica |
| 3 | Conhecimento parcial |
| 4 | Domínio parcial: sabe aplicar ou explicar |
| 5 | Domínio completo |

Cada fundamento também possui um campo para sugestão de melhoria.

## 8. Cálculo da média

As técnicas são calculadas individualmente.

Os fundamentos são agrupados por categoria. Cada grupo vale como uma única avaliação, usando a média dos seus itens.

Exemplo:

```text
Ukemi: 5, 4, 3, 4
Média do grupo Ukemi: 4,0
```

Nesse caso, o grupo inteiro Ukemi conta como uma única nota 4,0, e não como quatro avaliações separadas.

A média final combina:

- cada técnica individual;
- cada grupo de fundamentos avaliado.

A nota de corte padrão é 3,0. O avaliador pode alterar esse valor no formulário.

## 9. Cadastro de turmas

O campo `className` permite selecionar uma turma já cadastrada.

Novas turmas são criadas na seção recolhida `Gerenciar turmas`.

As turmas são armazenadas:

- em `localStorage`, quando offline;
- na tabela `turmas`, quando o Supabase está configurado.

O histórico possui filtro por turma.

## 10. Salvamento e edição

Ao salvar, a função `save()` cria um objeto com:

- identificador do exame;
- aluno;
- turma;
- faixa;
- nota final;
- nota de corte;
- status;
- detalhes de cada item;
- data e hora.

Se não houver `editingId`, um novo exame é criado.

Se houver `editingId`, o exame existente é substituído pelo novo conteúdo.

O botão `Editar` carrega novamente todos os dados, incluindo notas, observações, fundamentos e técnicas sorteadas da faixa Marrom.

## 11. Histórico

O histórico exibe:

- data;
- aluno;
- turma;
- badge colorida da faixa;
- nota final;
- status;
- botão de edição;
- botão de PDF individual;
- botão de exclusão.

Os filtros disponíveis são:

- data inicial;
- data final;
- turma;
- faixa.

## 12. Exportação de PDF

### PDF individual

O botão `PDF` de cada linha gera um relatório individual contendo:

- aluno;
- turma;
- faixa;
- nota final;
- status;
- guia de notas técnicas;
- guia de notas dos fundamentos;
- avaliação de cada item;
- observações e sugestões.

### PDF consolidado

O botão `Exportar resumo + detalhes` gera um único PDF com:

1. Tabela geral dos exames filtrados.
2. Detalhes completos de cada exame depois da tabela.

Os filtros aplicados no histórico também são aplicados ao PDF.

## 13. Supabase

No início do `app.js`, preencha:

```javascript
const SUPABASE_URL = "https://seu-projeto.supabase.co";
const SUPABASE_ANON_KEY = "sua-chave-anon";
```

Se os valores ficarem vazios, o sistema usa automaticamente `localStorage`.

Para configurar o banco:

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o conteúdo atualizado de `schema.sql`.
4. Copie a URL do projeto.
5. Copie a chave pública `anon`.
6. Cole os valores no início de `app.js`.

## 14. Publicação no GitHub Pages

Envie estes arquivos para o repositório:

```text
index.html
app.js
judomaterials.json
schema.sql
manifest.webmanifest
sw.js
```

Depois:

1. Crie um repositório no GitHub.
2. Envie para a raiz os arquivos `index.html`, `app.js`, `judomaterials.json`, `manifest.webmanifest` e `sw.js`.
3. Abra `Settings > Pages`.
4. Escolha `Deploy from a branch`.
5. Selecione a branch `main` e a pasta `/root`.
6. Clique em `Save` e aguarde a publicação.
7. Abra a URL publicada usando HTTPS.

O `schema.sql` deve ser executado no SQL Editor do Supabase; ele não precisa ser publicado para o navegador. O `README.md` e este arquivo são apenas documentação.

O PWA precisa ser publicado em HTTPS para o Service Worker e a instalação funcionarem corretamente. A abertura local por `file://` permite testar a interface, mas não representa o funcionamento completo do PWA.

## 15. Boas práticas para futuras alterações

- Atualize primeiro `judomaterials.json` quando alterar o conteúdo curricular.
- Não coloque técnicas diretamente no HTML.
- Mantenha as regras de negócio no `app.js`.
- Faça backup antes de alterar o `schema.sql`.
- Ao adicionar um campo ao exame, atualize simultaneamente:
  - o formulário HTML;
  - a função `save()`;
  - a função `edit()`;
  - a tabela do histórico;
  - os PDFs;
  - o banco de dados.
- Execute `node --check app.js` depois de cada alteração importante.
- Valide o JSON com:

```bash
node -e "JSON.parse(require('fs').readFileSync('judomaterials.json')); console.log('JSON válido')"
```
