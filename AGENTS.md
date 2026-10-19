# AGENTS.md

## Visão do projeto

Este repositório contém uma aplicação web responsiva para exames de faixa de Judô.

Tecnologias principais:

- HTML5.
- Tailwind CSS via CDN.
- JavaScript ES Modules no navegador.
- Supabase JS SDK opcional.
- `localStorage` como fallback offline.
- jsPDF e AutoTable para relatórios.
- PWA com `manifest.webmanifest` e `sw.js`.

## Arquivos importantes

- `index.html`: estrutura da interface.
- `app.js`: regras de negócio, renderização, armazenamento, filtros e PDFs.
- `judomaterials.json`: matriz curricular oficial usada pela aplicação.
- `schema.sql`: estrutura do banco Supabase.
- `manifest.webmanifest`: configuração do PWA.
- `sw.js`: cache offline e instalação do PWA.
- `README.md`: instruções resumidas de publicação.
- `DOCUMENTACAO.md`: documentação técnica completa.

## Regras curriculares

O campo `belt` de cada item representa a faixa do exame em que o conteúdo deve ser avaliado.

Os exames disponíveis são:

```text
Cinza, Azul, Amarela, Laranja, Verde, Roxa e Marrom
```

Branca e Preta não devem ser adicionadas ao fluxo atual sem uma solicitação explícita.

Os exames são acumulativos. A seleção de uma faixa inclui os conteúdos das faixas anteriores.

### Regra da faixa Marrom

Ao selecionar Marrom:

- sortear três técnicas diferentes de cada grupo;
- exibir todos os fundamentos;
- preservar as técnicas sorteadas ao editar um exame já salvo;
- gerar um novo sorteio quando o usuário sair e selecionar Marrom novamente.

Não substituir o sorteio por seleção fixa das primeiras técnicas.

## Regras de avaliação

### Técnicas

Notas de 0 a 5:

- 0: não sabe ou erro grave.
- 1: insuficiente.
- 2: em desenvolvimento.
- 3: básico e funcional.
- 4: bom, com pequenos ajustes.
- 5: execução perfeita.

### Fundamentos

Notas permitidas: 0, 2, 3, 4 e 5.

- 0: não demonstrou.
- 2: reconhece, mas não explica.
- 3: conhecimento parcial.
- 4: domínio parcial.
- 5: domínio completo.

Cada grupo de fundamentos vale como uma única unidade na média. Os itens do grupo são calculados primeiro e sua média representa o grupo inteiro.

## Armazenamento

O sistema deve continuar funcionando sem credenciais Supabase.

- Exames offline: chave `judo-exams-v1`.
- Turmas offline: chave `judo-classes-v1`.
- Supabase configurado: usar as tabelas `exames` e `turmas`.

Não remover o fallback de `localStorage`.

Ao adicionar ou alterar campos de exame, atualizar todos estes pontos:

1. Formulário em `index.html`.
2. Função `save()`.
3. Função `edit()`.
4. Histórico e filtros.
5. PDF individual.
6. PDF consolidado.
7. `schema.sql`.
8. `DOCUMENTACAO.md` e `README.md`, quando necessário.

## Turmas

O cadastro de turma é secundário e deve permanecer recolhido dentro de `Gerenciar turmas`.

A seleção da turma no exame é obrigatória. Turmas devem poder ser salvas no `localStorage` e no Supabase quando disponível.

## PDFs

Todo PDF deve conter a descrição das notas técnicas e dos fundamentos.

O PDF individual deve conter:

- aluno;
- turma;
- faixa;
- nota;
- status;
- todos os itens avaliados;
- observações e sugestões.

O PDF consolidado deve conter primeiro o resumo filtrado e depois os detalhes individuais dos exames encontrados.

## Interface

- Manter layout mobile-first.
- Usar classes Tailwind existentes como referência visual.
- Manter as abas com estado ativo vermelho e estado inativo branco.
- Exibir badges para status e para a cor da faixa.
- Não deixar texto branco sobre fundo claro.
- Selects devem usar largura total, bordas arredondadas e foco consistente.

## PWA

O projeto é um PWA instalável, não um APK nativo.

- Não remover `manifest.webmanifest`.
- Não remover o registro de `sw.js`.
- O Service Worker só funciona corretamente em HTTPS ou ambiente local servido por HTTP.
- A abertura direta por `file://` não representa o funcionamento completo do PWA.

## Validação

Após alterações em JavaScript:

```bash
node --check app.js
```

Após alterações no JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('judomaterials.json')); console.log('JSON válido')"
```

Verificar também se os arquivos referenciados existem:

```bash
test -f index.html && test -f app.js && test -f judomaterials.json && test -f manifest.webmanifest && test -f sw.js
```

## Cuidados com alterações

- Não inventar técnicas que não estejam no PDF ou no `judomaterials.json`.
- Não alterar a correspondência das faixas sem confirmar a regra curricular.
- Não usar comandos destrutivos como `git reset --hard`.
- Não remover dados existentes do usuário.
- Não colocar chaves privadas no frontend.
- O Supabase usado no frontend deve utilizar somente a chave pública `anon`.
- Para produção multiusuário, revisar as políticas RLS abertas do exemplo e adicionar autenticação.

