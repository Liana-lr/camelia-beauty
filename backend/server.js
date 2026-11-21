
const express = require("express");
const cors = require("cors");
const pool = require("./db");

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
        const { nome, email, itens, forma_pagamento } = req.body;

        if (
            !nome?.trim() ||
            !email?.trim() ||
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
            `INSERT INTO clientes (nome, email, mensagem)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [nome.trim(), email.trim(), "Cliente realizou um pedido."]
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


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor Camélia Beauty funcionando na porta ${PORT}`);
});
