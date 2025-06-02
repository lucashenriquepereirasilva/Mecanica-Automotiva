// Busca avançada estilo GOOGLE

//const { model } = require("mongoose")

// Capturar os ids referente aos campos do nome
const input = document.getElementById('inputSearchClient')

// capturar o id do ul da lista de sugestões de clientes
const suggestionList = document.getElementById('viewListSuggestion')

// capturar os campos que vão ser preenchidos
let idClient = document.getElementById('inputIdClient')
let nameClient = document.getElementById('inputNameClient')
let foneClient = document.getElementById('inputIPhoneClient')
let cpfClient = document.getElementById('inputCPFClient')

// vetor usado na manipulação (filtragem) dos dados
let arrayClients = []

// captura em tempo real do input (digitação de caracteres na caixa de busca)
input.addEventListener('input', () => {
    // passo 1: capturar o que for digitado na caixa de busca em tempo real
    const search = input.value.toLowerCase()
    //console.log(search) // teste de apoio a logica
    // passo 2: enviar ao main um pedido de busca de clientes pelo nome (via preload - api)
    api.searchClients()
    // passo 3: recebimento dos clientes do banco de dados
    api.listClients((event, clients) => {
        //console.log(clients) // teste do passo 3
        // converter para JSON os dados do cliente recebidos
        const dataClients = JSON.parse(clients)
        // armazenar no vetor os dados dos clientes
        arrayClients = dataClients
        // passo 4: filtrar os dados dos clientes extraindo nomes que tenham relação com os caracteres digitados na busca em tempo real
        const results = arrayClients
            .filter(c => c.nomeCliente && c.nomeCliente.toLowerCase().includes(search))
            .slice(0, 5) // limita a 5 resultados
        //console.log(results) // importante para entendimento
        // limpar a lista a ada caracteer digitado
        suggestionList.innerHTML = ""
        // para cada resultado gerar um item da lista <li>
        results.forEach(c => {
            // criar o elemento la
            const item = document.createElement('li')
            // adicionar classes bootstrap a cada li criado
            item.classList.add('list-group-item', 'list-group-item-action')
            // exibir o nome do cliente
            item.textContent = c.nomeCliente
            // adicionar os lis criados a lista ul
            suggestionList.appendChild(item)
            // adicionar um evento de clique no item da lista para preencher os cmapos do formulario
            item.addEventListener('click', () => {
                idClient.value = c._id
                nameClient.value = c.nomeCliente
                cpfClient.value = c.cpfCliente
                foneClient.value = c.foneCliente
                // limpar o input e recolher a lista
                input.value = ""
                suggestionList.innerHTML = ""
            })

        })

    })
})

// ocultar a lista ao clicar fora
document.addEventListener('click', (event) => {
    if (!input.contains(event.target) && !suggestionList.contains(event.target)) {
        suggestionList.innerHTML = ""
    }
})

// Fim busca avançada


// Capturar o foco na busca pelo nome cliente
//A constante "foco" obtem o elemento html(input) indentificado como "searchClinet"
const foco = document.getElementById('inputSearchClient');

//Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botão 
    //btnUpdate.disabled = true;
    //btnDelete.disabled = true;
    //Foco na busca do cliente
    foco.focus();
});

// capturar marcas de veiculos no campo modelo

const selectMarca = document.getElementById("inputMarcaVeiculoOS");


// criar um vetor para manipulação dos dados da OS
let arrayOS = []

//captura dos dados dos inputs do formulário (Passo 1: fluxo)
let frmOS = document.getElementById("frmOS");
let idos = document.getElementById("inputNumeroOS")
let nome = document.getElementById("inputNameClient")
let cpf = document.getElementById("inputCPFClient")
let telefone = document.getElementById("inputIPhoneClient")
let motor = document.getElementById("inputTipoMotorOS");
let combustivel = document.getElementById("inputCombustivelOS");
let ploblemas = document.getElementById("inputProblemasOS");
let prazo = document.getElementById("inputPrazoOS");
let funcionario = document.getElementById("inputFuncionarioOS")
let stats = document.getElementById("inputosStatus");
let servico = document.getElementById("inputServicoOS")
let observacoes = document.getElementById("inputObsOS")
let valor = document.getElementById("inputValorOS");
// captura da OS (CRUD Delete e Update)
let os = document.getElementById('inputSearchClient')
// captura do id do campo data
let dateOS = document.getElementById('inputData')

//==========================================================================
//CRUD CREATE E UPDATE

// ============================================================
// == CRUD Create/Update ======================================

//Evento associado ao botão submit (uso das validações do html)

frmOS.addEventListener('submit', async (event) => {
    //evitar o comportamento padrão do submit que é enviar os dados do formulário e reiniciar o documento html
    event.preventDefault()
    // validação do campo obrigatório 'idClient' (validação html não funciona via html para campos desativados)
    if (idClient.value === "") {
        api.validateClient()
    } else {
        // Teste importante (recebimento dos dados do formuláro - passo 1 do fluxo)
        console.log(os.value, idClient.value, nome.value, cpf.value, telefone.value, motor.value, combustivel.value, ploblemas.value, prazo.value, funcionario.value, stats.value, servico.value, observacoes.value, valor.value)
        if (os.value === "") {
            //Gerar OS
            //Criar um objeto para armazenar os dados da OS antes de enviar ao main
            const os = {
                idClientOS: idClient.value,
                nome_OS: nome.value,
                cpf_OS: cpf.value,
                telefone_OS: telefone.value,
                tipomotor_OS: motor.value,
                combustivel_OS: combustivel.value,
                ploblemas_OS: ploblemas.value,
                prazo_OS: prazo.value,
                funcionario_OS: funcionario.value,
                stats_OS: stats.value,
                servico_OS: servico.value,
                observacoes_OS: observacoes.value,
                valor_OS: valor.value,
            }
            // Enviar ao main o objeto os - (Passo 2: fluxo)
            // uso do preload.js
            api.newOs(os)
        } else {
            //Editar OS
            const os = {
                id_OS: idos.value,
                idClientOS: idClient.value,
                nome_OS: nome.value,
                cpf_OS: cpf.value,
                telefone_OS: telefone.value,
               motor_OS: motor.value,
                combustivel_OS: combustivel.value,
               ploblemas_OS: ploblemas.value,
                prazo_OS: prazo.value,
                funcionario_OS: funcionario.value,
                stats_OS: stats.value,
                servico_OS: servico.value,
                observacoes_OS: observacoes.value,
                valor_OS: valor.value,
            }
            // Enviar ao main o objeto os - (Passo 2: fluxo)
            // uso do preload.js
            api.updateOS(os)

            

        }
    }
})

// == Fim CRUD Create/Update ==================================
// ============================================================

// =============================================================
// == Busca OS =================================================

function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {
    console.log(dataOS)
    const os = JSON.parse(dataOS)
    // preencher os campos com os dados da OS
    os.value = os._id

    // formatar data:
    const data = new Date(os.dataEntrada)
    const formatada = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
    idos.value = os._id
    dateOS.value = formatada    
    idClient.value = os.idCliente
    nome.value = os.nome
    cpf.value = os.cpf
    telefone.value = os.telefone
    motor.value = os.motor
    combustivel.value = os.combustivel
    ploblemas.value = os.ploblemas
    prazo.value = os.prazo
    funcionario.value = os.funcionario
    stats.value = os.stats
    servico.value = os.servico
    observacoes.value = os.observacoes
    valor.value = os.valor

})

// == Fim - Buscar OS - CRUD Read =============================
// ============================================================


// ============================================================
// == Reset form ==============================================

function resetForm() {
    // Limpar os campos e resetar o formulário com as configurações pré definidas
    location.reload()
}

// Recebimento do pedido do main para resetar o form
api.resetForm((args) => {
    resetForm()
})

// == Fim - reset form ========================================
// ============================================================
function removeOS() {
    console.log(idos.value) // Passo 1 (receber do form o id da OS)
    api.deleteOS(idos.value) // Passo 2 (enviar o id da OS ao main)
}
// =======================
// Manipulação da tecla Enter

// 1. Defina a função searchOS primeiro
function searchOS() {
    console.log("Função searchOS executada.");
    // Aqui vai a lógica para buscar uma Ordem de Serviço
}

// 2. Depois defina a função que usa ela (teclaEnter)
function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchOS(); // agora funciona, porque a função já foi definida acima
    }
}

// 3. Restauração do Enter padrão
function restaurarEnter() {
    frmOS.removeEventListener('keydown', teclaEnter);
}


// "escuta do evento Tecla Enter"
frmOS.addEventListener('keydown', teclaEnter)

// Fim manipulação Tecla Enter
// =========================


// == imprimir os =================================

function generateOS(){
    api.PrintOS()
}







// ==  fim imprimir os ====================