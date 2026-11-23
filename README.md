# Camélia Beauty

**Beleza, cuidado e autoestima.**

## Sobre o projeto

A Camélia Beauty é uma plataforma fictícia de comércio eletrônico desenvolvida como parte de um projeto interdisciplinar acadêmico.

O projeto tem como proposta apresentar uma loja virtual de produtos de beleza, maquiagem e autocuidado, oferecendo uma experiência de navegação simples, agradável e intuitiva.

A identidade visual foi pensada para transmitir elegância, delicadeza e sofisticação, utilizando tons claros, detalhes dourados e a flor camélia como elemento de inspiração.

## Objetivo

Desenvolver uma aplicação web que integre conhecimentos de Desenvolvimento Web e Banco de Dados, utilizando tecnologias de front-end, back-end e armazenamento persistente de informações.

## Público-alvo

Pessoas interessadas em produtos de beleza, maquiagem e cuidados pessoais.

## Identidade da marca

- **Nome:** Camélia Beauty
- **Slogan:** Beleza, cuidado e autoestima.
- **Assistente virtual:** Cecília
- **Estilo visual:** elegante, delicado e sofisticado.

---

*Projeto acadêmico desenvolvido para fins educacionais.*

## Tecnologias utilizadas

### Front-end
- HTML5: estrutura das páginas.
- CSS3: estilização e responsividade.
- JavaScript: interatividade e funcionalidades do site.

### Back-end
- Node.js: ambiente de execução JavaScript.
- Express: criação da API e gerenciamento das rotas.
- CORS: comunicação entre front-end e back-end.
- dotenv: gerenciamento das variáveis de ambiente.
- pg: conexão com o banco de dados PostgreSQL.
- Google Gemini API: integração de inteligência artificial para o atendimento virtual.

### Banco de dados
- PostgreSQL: armazenamento persistente das informações.
- Neon: hospedagem do banco de dados.

### Controle de versão
- Git: controle de versões do projeto.
- GitHub: armazenamento e compartilhamento do código-fonte.

## Funcionalidades implementadas

- Apresentação da marca Camélia Beauty.
- Seções de apresentação, produtos e contato.
- Catálogo com 25 produtos fictícios.
- Organização dos produtos em quatro categorias.
- Carrinho de compras com cálculo do total.
- Formulário de contato integrado à API.
- Cadastro e consulta de produtos pelo back-end.
- Atualização e exclusão lógica de produtos.
- Registro demonstrativo de pedidos.
- Persistência de dados no PostgreSQL.
- Assistente virtual Cecília integrada à API Google Gemini.
- Atendimento automatizado com personalidade e regras próprias.
- Consulta ao catálogo de produtos diretamente no PostgreSQL pela assistente virtual.


## Estrutura do projeto

```text
camelia-beauty/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
├── database/
│   ├── schema.sql
│   ├── dados.sql
│   ├── atualizacao_clientes.sql
│   └── DER-Camelia-Beauty.drawio
├── index.html
├── style.css
├── script.js
├── .gitignore
└── README.md
```

## Banco de dados

O projeto utiliza PostgreSQL, hospedado na plataforma Neon.

O banco de dados possui cinco tabelas principais:

| Tabela | Finalidade |
|---|---|
| categorias | Armazena as categorias dos produtos. |
| produtos | Armazena os produtos da loja. |
| clientes | Armazena os dados enviados pelo formulário de contato. |
| pedidos | Registra os pedidos realizados. |
| itens_pedido | Armazena os produtos e quantidades de cada pedido. |

### Relacionamentos

- Cada produto pertence a uma categoria.
- Cada pedido está associado a um cliente.
- Cada item de pedido está associado a um pedido e a um produto.


### Scripts SQL

Os scripts para criação, atualização e preenchimento do banco estão disponíveis na pasta `database/`:

- `schema.sql`: criação das cinco tabelas e do índice.
- `dados.sql`: inserção das quatro categorias e dos 25 produtos fictícios.
- `atualizacao_clientes.sql`: adiciona campos complementares à tabela de clientes, caso ainda não existam.


### Como configurar o banco de dados

1. Crie um banco de dados PostgreSQL.
2. Configure a variável `DATABASE_URL` no arquivo `backend/.env`.
3. Execute o conteúdo de `database/schema.sql` para criar as tabelas e o índice.
4. Se necessário, execute o conteúdo de `database/atualizacao_clientes.sql` para adicionar os campos complementares à tabela de clientes.
5. Execute o conteúdo de `database/dados.sql` para inserir as categorias e os 25 produtos fictícios.

Os scripts SQL permitem reproduzir a estrutura e os dados iniciais do banco em uma nova instalação.

## API — Rotas disponíveis

O back-end utiliza Node.js e Express para disponibilizar as seguintes rotas:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica o funcionamento do servidor. |
| GET | `/api/status` | Consulta o status da API. |
| GET | `/api/produtos` | Lista os produtos ativos. |
| POST | `/api/produtos` | Cadastra um produto. |
| PUT | `/api/produtos/:id` | Atualiza um produto. |
| DELETE | `/api/produtos/:id` | Realiza a exclusão lógica de um produto. |
| POST | `/api/contato` | Registra uma mensagem de contato. |
| POST | `/api/pedidos` | Registra um pedido demonstrativo. |
| POST | `/api/cecilia` | Envia mensagens à assistente Cecília e recebe respostas geradas pela API Google Gemini com base no catálogo ativo. |

As operações de banco de dados utilizam consultas parametrizadas para evitar a inserção direta de valores nas instruções SQL.

## Como executar o projeto

### 1. Pré-requisitos

- Node.js instalado.
- npm instalado.
- Banco de dados PostgreSQL configurado.
- Chave de API do Google Gemini, obtida no Google AI Studio.

### 2. Clonar o repositório

```bash
git clone https://github.com/Liana-lr/camelia-beauty.git
cd camelia-beauty
```

### 3. Instalar as dependências

```bash
cd backend
npm install
```

### 4. Configurar as variáveis de ambiente

Crie um arquivo chamado `.env` dentro da pasta `backend/`, utilizando o arquivo `.env.example` como modelo.

Configure a variável `DATABASE_URL` com a URL de conexão do seu banco PostgreSQL.

Configure a variável `GEMINI_API_KEY` com uma chave de API obtida no Google AI Studio.

A variável `PORT` define a porta utilizada pelo servidor, configurada inicialmente como 3000.

**Importante:** não compartilhe nem publique o arquivo `.env` no GitHub, pois ele contém informações privadas de conexão e acesso à API.

### 5. Executar o servidor

Ainda dentro da pasta `backend/`, execute:

```bash
node server.js
```

O servidor será iniciado na porta 3000.

### 6. Acessar o site

Abra o arquivo `index.html` no navegador para visualizar o front-end.

## Observações

- O projeto possui finalidade acadêmica e demonstrativa.
- Os pedidos não realizam cobranças reais.
- Os produtos e demais dados comerciais são fictícios.
