/* =========================================================
   SISTEMA DE ESTOQUE - JS FRONTEND
   ========================================================= */

// ⚠️ COLE O LINK DO NOVO WEB APP AQUI DENTRO DAS ASPAS:
const API_URL = "https://script.google.com/macros/s/AKfycbwfl0et6zSe2Biqqc9SgjtU5eIJSMcuvR4r5zPUngbMovVf4xAeihRhUfS-FdQYK7gXFA/exec"; 

window.onload = async function() {
    gerarCabecalhoAutomatico();
    
    let inputProd = document.getElementById('val-produto');
    inputProd.placeholder = "Carregando produtos... ⏳";
    
    // Baixa a lista de produtos no carregamento inicial
    try {
        let req = await fetch(API_URL, { 
            method: 'POST', 
            redirect: 'follow', // Ajuda a evitar bloqueios do Google
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ acao: 'buscar_produtos' }) 
        });
        
        let res = await req.json();
        
        if(res.sucesso && res.produtos && res.produtos.length > 0) {
            let options = '';
            res.produtos.forEach(p => {
                options += `<option value="${p.nome}">`;
            });
            document.getElementById('lista-produtos').innerHTML = options;
            inputProd.placeholder = "Selecione ou digite o produto...";
        } else {
            inputProd.placeholder = "Nenhum produto cadastrado na aba";
        }
    } catch(e) { 
        console.log("Erro ao carregar produtos:", e);
        inputProd.placeholder = "⚠️ Erro: Coloque o Link (API_URL) no script.js";
    }
};

function gerarCabecalhoAutomatico() {
    let idUnico = "VAL-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    document.getElementById('val-id').value = idUnico;
    
    let hj = new Date();
    let formatada = ("0"+hj.getDate()).slice(-2) + "/" + ("0"+(hj.getMonth()+1)).slice(-2) + "/" + hj.getFullYear() + " " + ("0"+hj.getHours()).slice(-2) + ":" + ("0"+hj.getMinutes()).slice(-2);
    document.getElementById('val-data-hora').value = formatada;
}

function abrirModulo(modulo) {
    document.getElementById('tela-home').style.display = 'none';
    if(modulo === 'validade') {
        document.getElementById('tela-validade').style.display = 'flex';
        gerarCabecalhoAutomatico();
    } else {
        alert("Módulo Vasilhame estará disponível em breve!");
        document.getElementById('tela-home').style.display = 'flex';
    }
}

function voltarHome() {
    document.getElementById('tela-validade').style.display = 'none';
    document.getElementById('tela-home').style.display = 'flex';
}

function calcularDiasRestantes() {
    let dt = document.getElementById('val-data-validade').value;
    if(!dt) return;
    
    let valDate = new Date(dt + "T00:00:00");
    let hoje = new Date();
    hoje.setHours(0,0,0,0);
    
    let diff = Math.ceil((valDate - hoje) / (1000 * 3600 * 24));
    document.getElementById('val-dias').value = diff;
    
    let statusEl = document.getElementById('val-status');
    if (diff <= 45) {
        statusEl.value = "VALIDADE CURTA";
        statusEl.style.backgroundColor = "#fee2e2";
        statusEl.style.color = "#dc2626";
    } else if (diff < 60) {
        statusEl.value = "ATENÇÃO";
        statusEl.style.backgroundColor = "#fef3c7";
        statusEl.style.color = "#d97706";
    } else {
        statusEl.value = "OK";
        statusEl.style.backgroundColor = "#d1fae5";
        statusEl.style.color = "#059669";
    }
}

async function salvarLancamento() {
    let produto = document.getElementById('val-produto').value;
    let caixas = document.getElementById('val-caixas').value;
    let unidades = document.getElementById('val-unidades').value;
    let dataVal = document.getElementById('val-data-validade').value;
    
    if(!produto || !dataVal) return alert("❌ Preencha o Produto e a Data de Validade!");
    if(caixas == 0 && unidades == 0) return alert("❌ Insira alguma quantidade (Caixas ou Unidades)!");

    let btn = document.getElementById('btn-salvar');
    btn.innerText = "Salvando... ⏳"; btn.disabled = true;

    let payload = {
        acao: "salvar_validade",
        id: document.getElementById('val-id').value,
        data_hora: document.getElementById('val-data-hora').value,
        produto: produto,
        caixas: caixas,
        unidades: unidades,
        data_validade: dataVal
    };

    try {
        let req = await fetch(API_URL, { 
            method: 'POST', 
            redirect: 'follow',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload) 
        });
        let res = await req.json();
        
        if (res.sucesso) {
            alert("✅ Validade Lançada com Sucesso!");
            // Limpa o formulário
            document.getElementById('val-produto').value = '';
            document.getElementById('val-caixas').value = '0';
            document.getElementById('val-unidades').value = '0';
            document.getElementById('val-data-validade').value = '';
            document.getElementById('val-dias').value = '';
            document.getElementById('val-status').value = '';
            document.getElementById('val-status').style.backgroundColor = "transparent";
            gerarCabecalhoAutomatico();
        } else {
            alert("❌ Erro: " + res.erro);
        }
    } catch(e) { alert("❌ Erro de conexão."); }
    
    btn.innerText = "💾 Salvar Lançamento"; btn.disabled = false;
}

async function gerarExcel() {
    let btn = document.getElementById('btn-gerar-excel');
    btn.innerText = "Gerando Planilha... ⏳"; btn.disabled = true;

    try {
        let req = await fetch(API_URL, { 
            method: 'POST', 
            redirect: 'follow',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({acao: "gerar_excel"}) 
        });
        let res = await req.json();
        if (res.sucesso) {
            alert("✅ Relatório Excel gerado na pasta do Drive!");
        } else {
            alert("❌ Erro: " + res.erro);
        }
    } catch(e) { alert("❌ Erro de conexão."); }
    
    btn.innerText = "📊 Gerar Arquivo Excel na Nuvem"; btn.disabled = false;
}
