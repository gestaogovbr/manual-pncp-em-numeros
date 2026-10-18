// Define o tamanho padrão inicial (100%)
let tamanhoAtual = 100;

// Quando a página carregar, verifica se o usuário já tinha escolhido um tamanho antes
document.addEventListener("DOMContentLoaded", function() {
    let tamanhoSalvo = localStorage.getItem("tamanhoFonteManual");
    if (tamanhoSalvo) {
        tamanhoAtual = parseInt(tamanhoSalvo);
        aplicarFonte();
    }
});

function aumentarFonte() {
    if (tamanhoAtual < 150) { // Limite máximo de 150% para não quebrar o layout
        tamanhoAtual += 10;
        aplicarFonte();
    }
}

function diminuirFonte() {
    if (tamanhoAtual > 70) { // Limite mínimo de 70%
        tamanhoAtual -= 10;
        aplicarFonte();
    }
}

function resetarFonte() {
    tamanhoAtual = 100;
    aplicarFonte();
}

function aplicarFonte() {
    // Busca a caixa principal onde fica o texto do manual no tema Read the Docs / Sphinx
    let conteudo = document.querySelector('.rst-content') || document.querySelector('[role="main"]') || document.querySelector('.wy-nav-content');
    
    if (conteudo) {
        conteudo.style.fontSize = tamanhoAtual + "%";
        // Salva a escolha do usuário no navegador
        localStorage.setItem("tamanhoFonteManual", tamanhoAtual);
    }
}
