
const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "Bem-vinda à API da Camélia Beauty!",
        status: "Servidor funcionando"
    });
});

// Rota de status
app.get("/api/status", (req, res) => {
    res.json({
        sistema: "Camélia Beauty",
        servidor: "Online"
    });
});

// Consulta os produtos armazenados no PostgreSQL
app.get("/api/produtos", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.imagem,
                c.nome AS categoria
            FROM produtos p
            JOIN categorias c ON c.id = p.categoria_id
            WHERE p.ativo = TRUE
            ORDER BY p.id;
        `);

        res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao buscar produtos:", erro.message);
        res.status(500).json({
            erro: "Não foi possível consultar os produtos."
        });
    }
});


// Recebe e salva mensagens do formulário de contato
app.post("/api/contato", async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body;

        // Verifica se os campos foram preenchidos
        if (!nome || !email || !mensagem) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        // Salva os dados no PostgreSQL
        const resultado = await pool.query(
            `INSERT INTO clientes (nome, email, mensagem)
             VALUES ($1, $2, $3)
             RETURNING id, nome, email, mensagem, data_envio`,
            [nome.trim(), email.trim(), mensagem.trim()]
        );

        res.status(201).json({
            mensagem: "Contato recebido com sucesso!",
            cliente: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao salvar contato:", erro.message);

        res.status(500).json({
            erro: "Não foi possível salvar sua mensagem."
        });
    }
});


// Cadastra um novo produto
app.post("/api/produtos", async (req, res) => {
    try {
        const { nome, descricao, preco, imagem, categoria_id } = req.body;

        if (
            !nome?.trim() ||
            !descricao?.trim() ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) <= 0 ||
            !Number.isInteger(Number(categoria_id))
        ) {
            return res.status(400).json({
                erro: "Informe nome, descrição, preço válido e categoria."
            });
        }

        const resultado = await pool.query(
            `INSERT INTO produtos
            (nome, descricao, preco, imagem, categoria_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                nome.trim(),
                descricao.trim(),
                Number(preco),
                imagem || null,
                Number(categoria_id)
            ]
        );

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            produto: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao cadastrar produto:", erro.message);
        res.status(500).json({
            erro: "Não foi possível cadastrar o produto."
        });
    }
});


// Atualiza os dados de um produto
app.put("/api/produtos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, descricao, preco, imagem, categoria_id } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do produto inválido."
            });
        }

        if (
            !nome?.trim() ||
            !descricao?.trim() ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) <= 0 ||
            !Number.isInteger(Number(categoria_id))
        ) {
            return res.status(400).json({
                erro: "Informe nome, descrição, preço válido e categoria."
            });
        }

        const resultado = await pool.query(
            `UPDATE produtos
             SET nome = $1,
                 descricao = $2,
                 preco = $3,
                 imagem = $4,
                 categoria_id = $5
             WHERE id = $6 AND ativo = TRUE
             RETURNING *`,
            [
                nome.trim(),
                descricao.trim(),
                Number(preco),
                imagem || null,
                Number(categoria_id),
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto atualizado com sucesso!",
            produto: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao atualizar produto:", erro.message);
        res.status(500).json({
            erro: "Não foi possível atualizar o produto."
        });
    }
});


// Desativa um produto sem apagar seu histórico do banco
app.delete("/api/produtos/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do produto inválido."
            });
        }

        const resultado = await pool.query(
            `UPDATE produtos
             SET ativo = FALSE
             WHERE id = $1 AND ativo = TRUE
             RETURNING id, nome, ativo`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Produto não encontrado ou já desativado."
            });
        }

        res.json({
            mensagem: "Produto desativado com sucesso!",
            produto: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao desativar produto:", erro.message);
        res.status(500).json({
            erro: "Não foi possível desativar o produto."
        });
    }
});


// Registra um pedido com vários produtos
app.post("/api/pedidos", async (req, res) => {
    const conexao = await pool.connect();

    try {
        const {
            nome,
            email,
            telefone,
            cep,
            endereco,
            numero,
            complemento,
            cidade,
            estado,
            itens,
            forma_pagamento
        } = req.body;

        if (
            !nome?.trim() ||
            !email?.trim() ||
            !telefone?.trim() ||
            !cep?.trim() ||
            !endereco?.trim() ||
            !numero?.trim() ||
            !cidade?.trim() ||
            !estado?.trim() ||
            !Array.isArray(itens) ||
            itens.length === 0 ||
            !["pix", "credito", "debito"].includes(forma_pagamento)
        ) {
            return res.status(400).json({
                erro: "Informe os dados do cliente, os produtos e uma forma de pagamento válida."
            });
        }

        for (const item of itens) {
            if (
                !Number.isInteger(Number(item.produto_id)) ||
                Number(item.produto_id) <= 0 ||
                !Number.isInteger(Number(item.quantidade)) ||
                Number(item.quantidade) <= 0
            ) {
                return res.status(400).json({
                    erro: "Existe um produto ou uma quantidade inválida."
                });
            }
        }

        await conexao.query("BEGIN");

        const cliente = await conexao.query(
            `INSERT INTO clientes
            (nome, email, mensagem, telefone, cep, endereco, numero, complemento, cidade, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id`,
            [
                nome.trim(),
                email.trim(),
                "Cliente realizou um pedido.",
                telefone.trim(),
                cep.trim(),
                endereco.trim(),
                numero.trim(),
                complemento?.trim() || null,
                cidade.trim(),
                estado.trim().toUpperCase()
            ]
        );

        let total = 0;
        const itensCalculados = [];

        for (const item of itens) {
            const produto = await conexao.query(
                `SELECT id, nome, preco
                 FROM produtos
                 WHERE id = $1 AND ativo = TRUE`,
                [Number(item.produto_id)]
            );

            if (produto.rows.length === 0) {
                throw new Error("Um dos produtos não está disponível.");
            }

            const preco = Number(produto.rows[0].preco);
            const quantidade = Number(item.quantidade);

            total += preco * quantidade;

            itensCalculados.push({
                produto_id: Number(item.produto_id),
                quantidade,
                preco_unitario: preco
            });
        }

        const pedido = await conexao.query(
            `INSERT INTO pedidos
             (cliente_id, total, status, forma_pagamento)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                cliente.rows[0].id,
                total,
                "pendente",
                forma_pagamento
            ]
        );

        for (const item of itensCalculados) {
            await conexao.query(
                `INSERT INTO itens_pedido
                 (pedido_id, produto_id, quantidade, preco_unitario)
                 VALUES ($1, $2, $3, $4)`,
                [
                    pedido.rows[0].id,
                    item.produto_id,
                    item.quantidade,
                    item.preco_unitario
                ]
            );
        }

        await conexao.query("COMMIT");

        res.status(201).json({
            mensagem: "Pedido registrado com sucesso!",
            pedido: pedido.rows[0],
            itens: itensCalculados
        });

    } catch (erro) {
        await conexao.query("ROLLBACK");

        console.error("Erro ao registrar pedido:", erro.message);

        res.status(400).json({
            erro: erro.message || "Não foi possível registrar o pedido."
        });

    } finally {
        conexao.release();
    }
});


// Assistente virtual Cecília — integração com Gemini
app.post("/api/cecilia", async (req, res) => {
    try {
        const { mensagem } = req.body;

        if (typeof mensagem !== "string" || !mensagem.trim()) {
            return res.status(400).json({
                erro: "Digite uma mensagem para a Cecília."
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                erro: "A chave da API não está configurada."
            });
        }

        // Busca os produtos disponíveis no banco de dados
        const resultado = await pool.query(`
            SELECT
                p.nome,
                p.descricao,
                p.preco,
                c.nome AS categoria
            FROM produtos p
            JOIN categorias c ON c.id = p.categoria_id
            WHERE p.ativo = TRUE
            ORDER BY p.id;
        `);

        const catalogo = resultado.rows.map(produto =>
            `- ${produto.nome} | Categoria: ${produto.categoria} | Descrição: ${produto.descricao} | Preço: R$ ${Number(produto.preco).toFixed(2)}`
        ).join("\n");

        const respostaGemini = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{
                            text: `
Você é Cecília, a assistente virtual oficial da Camélia Beauty.

IDENTIDADE E PERSONALIDADE:
Você representa exclusivamente a loja Camélia Beauty.
Sua personalidade é elegante, acolhedora, educada, gentil e atenciosa.
Responda sempre em português brasileiro, com clareza e cordialidade.

OBJETIVO:
Seu trabalho é atender clientes e visitantes da Camélia Beauty, ajudando com:
- Informações sobre a loja.
- Categorias e produtos disponíveis.
- Características e descrições dos produtos.
- Preços e dúvidas sobre o catálogo.
- Beleza, maquiagem e cuidados com a pele, cabelos e corpo, desde que relacionados aos produtos da loja.
- Dúvidas sobre compras, pedidos e funcionamento do site.

RESTRIÇÃO DE ASSUNTOS:
Você só pode responder perguntas relacionadas à Camélia Beauty, à sua loja, ao seu catálogo, aos seus produtos e ao atendimento ao cliente.

Se alguém perguntar sobre assuntos sem relação com a loja, como previsão do tempo, notícias, política, esportes, programação, cálculos ou assuntos pessoais, não responda à pergunta.

Nesses casos, responda educadamente:
"Desculpe, mas sou a Cecília, assistente virtual da Camélia Beauty, e posso ajudar apenas com assuntos relacionados à nossa loja e aos nossos produtos. 🌷"

REGRAS SOBRE OS PRODUTOS:
Utilize exclusivamente o catálogo fornecido abaixo.
Não invente produtos, preços, descontos, características, disponibilidade ou informações comerciais.
Se uma informação não estiver disponível no catálogo, informe educadamente que não possui essa informação.

APRESENTAÇÃO DE PREÇOS:
Sempre apresente os preços utilizando o formato monetário brasileiro, como R$ 69,90.
Nunca escreva valores monetários por extenso.
Utilize vírgula para separar os centavos e duas casas decimais.
Sempre confira o preço no catálogo fornecido antes de responder.

FORMATAÇÃO E QUALIDADE DA ESCRITA:
Não utilize Markdown, asteriscos ou símbolos de formatação.
Escreva em português brasileiro correto, com pontuação, vírgulas e acentuação adequadas.
Organize as respostas em frases naturais e parágrafos bem construídos.
Evite apresentar palavras ou categorias soltas, sem pontuação.
Quando mencionar várias categorias em uma frase, separe-as com vírgulas e utilize "e" antes da última categoria.
Exemplo: "Temos produtos de maquiagem, cuidados com a pele, corpo e cabelos."
Mantenha um tom elegante, acolhedor e profissional, sem exagerar nos cumprimentos.

CATÁLOGO ATUAL DA CAMÉLIA BEAUTY:
${catalogo}
`
                        }]
                    },
                    contents: [{
                        role: "user",
                        parts: [{ text: mensagem.trim() }]
                    }],
                    generationConfig: {
                        thinkingConfig: {
                            thinkingLevel: "LOW"
                        },
                        maxOutputTokens: 700
                    }
                })
            }
        );

        const dados = await respostaGemini.json();

        if (!respostaGemini.ok) {
            console.error("Erro da API Gemini:", dados.error?.message);
            return res.status(502).json({
                erro: "Não foi possível obter uma resposta da Cecília."
            });
        }

        const resposta = dados.candidates?.[0]?.content?.parts
            ?.map(parte => parte.text || "")
            .join("")
            .trim();

        if (!resposta) {
            return res.status(502).json({
                erro: "A Cecília não conseguiu gerar uma resposta."
            });
        }

        res.json({ resposta });

    } catch (erro) {
        console.error("Erro na Cecília:", erro.message);
        res.status(500).json({
            erro: "Ocorreu um erro ao conversar com a Cecília."
        });
    }
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor Camélia Beauty funcionando na porta ${PORT}`);
});
