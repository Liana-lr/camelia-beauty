
// Produtos selecionados pelo cliente
let carrinho = [];

// Produtos disponíveis recebidos do banco de dados
let produtosDisponiveis = [];

// Adiciona um produto ao carrinho
function adicionarAoCarrinho(produto) {
    const produtoExistente = carrinho.find(
        item => item.id === produto.id
    );

    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        carrinho.push({
            ...produto,
            quantidade: 1
        });
    }

    atualizarCarrinho();
}

// Atualiza as informações exibidas no carrinho
function atualizarCarrinho() {
    const areaItens = document.getElementById("itens-carrinho");
    const contador = document.getElementById("contador-carrinho");
    const valorTotal = document.getElementById("valor-total");
    const botaoFinalizar = document.getElementById("finalizar-compra");

    const quantidadeTotal = carrinho.reduce(
        (total, produto) => total + produto.quantidade,
        0
    );

    const total = carrinho.reduce(
        (soma, produto) => soma + Number(produto.preco) * produto.quantidade,
        0
    );

    contador.textContent = `${quantidadeTotal} itens`;

    document.getElementById("contador-icone").textContent = quantidadeTotal;

    valorTotal.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;

    botaoFinalizar.disabled = carrinho.length === 0;

    if (carrinho.length === 0) {
        areaItens.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return;
    }

    areaItens.innerHTML = carrinho.map(produto => `
        <div class="item-carrinho">
            <strong>${produto.nome}</strong>
            <span>Quantidade: ${produto.quantidade}</span>
            <span>R$ ${(Number(produto.preco) * produto.quantidade)
                .toFixed(2).replace(".", ",")}</span>
        </div>
    `).join("");
}

// Exibe os produtos recebidos do banco de dados
function exibirProdutos(lista) {
    const areaProdutos = document.getElementById("lista-produtos");

    areaProdutos.innerHTML = lista.map(produto => `
        <article class="produto-card">
            <img src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <p class="preco">
                R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}
            </p>

            <button class="adicionar-carrinho" data-id="${produto.id}">
                Adicionar ao carrinho
            </button>

        </article>
    `).join("");
}

// Identifica os cliques nos botões de adicionar ao carrinho
document.getElementById("lista-produtos").addEventListener("click", (evento) => {
    const botao = evento.target.closest(".adicionar-carrinho");

    if (!botao) return;

    const idProduto = Number(botao.dataset.id);

    const produto = produtosDisponiveis.find(
        item => item.id === idProduto
    );

    if (produto) {
        adicionarAoCarrinho(produto);
    }
});

// Busca os produtos através da API
async function carregarProdutos() {
    const areaProdutos = document.getElementById("lista-produtos");

    try {
        areaProdutos.innerHTML = "<p>Carregando produtos...</p>";

        const resposta = await fetch("http://localhost:3000/api/produtos");

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar os produtos.");
        }

        const produtos = await resposta.json();

        produtosDisponiveis = produtos;

        exibirProdutos(produtos);

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        areaProdutos.innerHTML = `
            <p>Não foi possível carregar os produtos.
            Verifique se o servidor está funcionando.</p>
        `;
    }
}

// Inicia o carregamento
carregarProdutos();


// Envio do formulário de contato
const formulario = document.getElementById("form-contato");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    if (!nome || !email || !mensagem) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/api/contato", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                email,
                mensagem
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao enviar mensagem.");
        }

        alert("Sua mensagem foi enviada com sucesso!");

        formulario.reset();

    } catch (erro) {
        console.error("Erro no envio:", erro);
        alert("Não foi possível enviar sua mensagem. Tente novamente.");
    }
});

// Controle de abertura e fechamento do carrinho
const botaoCarrinho = document.getElementById("abrir-carrinho");
const painelCarrinho = document.getElementById("carrinho");
const fundoCarrinho = document.getElementById("fundo-carrinho");

function abrirPainelCarrinho() {
    painelCarrinho.classList.add("aberto");
    fundoCarrinho.classList.add("aberto");
}

function fecharPainelCarrinho() {
    painelCarrinho.classList.remove("aberto");
    fundoCarrinho.classList.remove("aberto");
}

// Abre ao clicar no ícone da sacola
botaoCarrinho.addEventListener("click", abrirPainelCarrinho);

// Fecha ao clicar fora do painel
fundoCarrinho.addEventListener("click", fecharPainelCarrinho);

// Fecha ao pressionar a tecla ESC
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharPainelCarrinho();
    }
});

// Controle de abertura e fechamento da Cecília
const botaoCecilia = document.getElementById("botao-cecilia");
const janelaCecilia = document.getElementById("janela-cecilia");
const fecharCecilia = document.getElementById("fechar-cecilia");

// Abre a conversa ao clicar no botão
botaoCecilia.addEventListener("click", () => {
    janelaCecilia.classList.add("aberta");
});

// Fecha a conversa ao clicar no X
fecharCecilia.addEventListener("click", () => {
    janelaCecilia.classList.remove("aberta");
});

console.log("Cecília: JavaScript carregado!");


// Recebe e responde às mensagens enviadas para Cecília
const formularioCecilia = document.getElementById("form-cecilia");
const entradaCecilia = document.getElementById("entrada-cecilia");
const mensagensCecilia = document.getElementById("mensagens-cecilia");

// Adiciona uma mensagem à conversa


function adicionarMensagemCecilia(texto, remetente) {
    const mensagem = document.createElement("div");

    mensagem.className = `mensagem-cecilia mensagem-${remetente}`;

    if (remetente === "assistente") {
        const textoSeguro = texto
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const textoFormatado = textoSeguro
            .replace(/\s*\*\s+(?=\*\*)/g, "<br>• ")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");

        mensagem.innerHTML = textoFormatado;
    } else {
        mensagem.textContent = texto;
    }

    mensagensCecilia.appendChild(mensagem);
    mensagensCecilia.scrollTop = mensagensCecilia.scrollHeight;
}


// Define a resposta automática da Cecília

async function responderCecilia(texto) {
    try {
        const respostaAPI = await fetch("http://localhost:3000/api/cecilia", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem: texto
            })
        });

        const dados = await respostaAPI.json();

        if (!respostaAPI.ok) {
            throw new Error(dados.erro || "Erro ao conversar com a Cecília.");
        }

        return dados.resposta;

    } catch (erro) {
        console.error("Erro na comunicação com a Cecília:", erro);

        return "Desculpe, não consegui responder neste momento. Por favor, tente novamente.";
    }
}


// Processa o envio da mensagem

formularioCecilia.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const texto = entradaCecilia.value.trim();

    if (!texto) return;

    adicionarMensagemCecilia(texto, "usuario");

    entradaCecilia.value = "";
    entradaCecilia.disabled = true;

    adicionarMensagemCecilia("Cecília está digitando...", "assistente");

    const resposta = await responderCecilia(texto);

    const mensagens = mensagensCecilia.querySelectorAll(".mensagem-assistente");
    const ultimaMensagem = mensagens[mensagens.length - 1];

    ultimaMensagem.textContent = resposta;

    entradaCecilia.disabled = false;
    entradaCecilia.focus();
});