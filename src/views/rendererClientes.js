
function buscarCEP() {

  let cep = document.getElementById('inputCEPClient').value
  let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
  fetch(urlAPI)
    .then(response => response.json())
    .then(dados => {
      document.getElementById('inputAddressClient').value = dados.logradouro
      document.getElementById('inputBairroClient').value = dados.bairro
      document.getElementById('inputCidadeClient').value = dados.localidade
      document.getElementById('inputUFClient').value = dados.uf

    })
    .catch(error => console.log(error)
    )
}

// vetor global que será usado na manipulação dos dados
let arrayClient = []

// capturar o foco na busca pelo nome
// a constant foco obtem o elemento html (input) identificado como 'searchCliente'
const foco = document.getElementById('searchClient')

// iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
  // desativar os botões
  btnUpdate.disabled = true
  btnDelete.disabled = true
  // Foco na busca do cliente
  foco.focus()
})



//captura dos dados dos inputs do formulario (passo 1: fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let bairroClient = document.getElementById('inputBairroClient')
let cityClient = document.getElementById('inputCidadeClient')
let ufClient = document.getElementById('inputUFClient')

// captura do Id do Cliente (usado no delete/update)
let id = document.getElementById('idClient')

// ===============================
// = CRUD Create/Update ===============

// =======================
// Manipulação da tecla Enter

// função para manipular o evento da tecla ENTER
function teclaEnter(event) {
  // se a tecla Enter for pressionada
  if (event.key === "Enter") {
    event.preventDefault() // ignorar o comportamento padrão e associar o Enter a busca pelo cliente
    buscarCliente()
  }
}

// Função para restaurar o padrão da tecla Enter (submit)
function restaurarEnter() {
  frmClient.removeEventListener('keydown', teclaEnter)
}

// "escuta do evento Tecla Enter"
frmClient.addEventListener('keydown', teclaEnter)

// Fim manipulação Tecla Enter
// =========================

// Evento associado ao botão submmit (uso das validações do html)
frmClient.addEventListener('submit', async (event) => {
  //evitar o comportamento padrão do submit que é enviar os dados do formulário e reiniciar o documento html
  event.preventDefault()
  //teste importante (recebimento dos dados do formulário - passo 1 do fluxo)
  //console.log(nameClient.value, cpfClient.value, emailClient.value, phoneClient.value, cepClient.value, addressClient.value, numberClient.value, complementClient.value, bairroClient.value, cityClient.value, ufClient.value)

  // estratégia usada para reutilizar o submit para criar um novo usuário ou alterar os dados de um cliente
  // se existir id significa que existe um cliente se não, significa que é para adicionar um novo cliente

  if (id.value === "") {
    // executar o método para cadastrar um cliente
    //criar um objeto para armazenar os dados cliente antes de enviar ao main

    const client = {
      nameCli: nameClient.value,
      cpfCli: cpfClient.value,
      emailCli: emailClient.value,
      phoneCli: phoneClient.value,
      cepCli: cepClient.value,
      addressCli: addressClient.value,
      numberCli: numberClient.value,
      complementCli: complementClient.value,
      bairroCli: bairroClient.value,
      cityCli: cityClient.value,
      ufCli: ufClient.value
    }
    // enviar ao main o objeto client - (Passo 2 - fluxo)
    // uso do preload.js
    api.newClient(client)

  } else {
    // executar o método para alterar os dados do cliente
    // testando // console.log(id.value)

    //criar um objeto para armazenar os dados cliente antes de enviar ao main (o dev não sabe os dados que serão alterados, portanto enviar todos os dados)

    const client = {
      idCli: id.value,
      nameCli: nameClient.value,
      cpfCli: cpfClient.value,
      emailCli: emailClient.value,
      phoneCli: phoneClient.value,
      cepCli: cepClient.value,
      addressCli: addressClient.value,
      numberCli: numberClient.value,
      complementCli: complementClient.value,
      bairroCli: bairroClient.value,
      cityCli: cityClient.value,
      ufCli: ufClient.value

    }
    // enviar ao main o objeto client - (Passo 2 - fluxo)
    // uso do preload.js
    api.updateClient(client)
  }

})

// = Fim CRUD Create/Update

// ========= CRUD Read ================

function buscarCliente() {
  //console.log("teste do botão buscar")

  // Passo 1: Capturar o nome do cliente
  let name = document.getElementById('searchClient').value
  console.log(name) // teste do passo 1

  // validação do campo obrigatorio
  // se o campo de busca não for preenchido
  if (name === "") {
    // enviar ao main um pedido para alertar o usúario
    api.validateSearch()
    foco.focus()
  } else {
    api.searchName(name) // passo 2: envio do nome ao main
    // Recebimento dos dados do cliente 
    api.renderClient((event, dataClient) => {
      console.log(dataClient) // teste do passo 5

      // Passo 6: renderizar os dados do cliente no formulario
      // - Criar um vetor global para manipulação dos dados 
      // - Criar uma constante para converter os dados recebidos que estão no formato string para o formato JSON (JSON.parse)
      // usar o laço forEach para percorrer o vetor e setar o campo (caixas de texto) do formulario
      const dadosCliente = JSON.parse(dataClient)
      // atribuir ao vetor os dados do cliente
      arrayClient = dadosCliente
      // extrair os dados do cliente
      arrayClient.forEach((c) => {
        id.value = c._id,
          nameClient.value = c.nomeCliente,
          cpfClient.value = c.cpfCliente,
          emailClient.value = c.emailCliente,
          phoneClient.value = c.foneCliente,
          cepClient.value = c.cepCliente,
          addressClient.value = c.logradouroCliente,
          numberClient.value = c.numeroCliente,
          complementClient.value = c.complementoCliente,
          bairroClient.value = c.bairroCliente,
          cityClient.value = c.cidadeCliente,
          ufClient.value = c.ufCliente

        // bloqueio do botão adicionar
        btnCreate.disabled = true
        // desbloqueio dos botões editar e excluir
        btnUpdate.disabled = false
        btnDelete.disabled = false

      })
    })
  }
}

// setar o cliente não cadastrado (recortar do campo de buscar e colar no campo nome
api.setClient((args) => {
  // criar uma variavel para armazenar o valor digitado no campo de buscar (nome ou cpf)
  let campoBusca = document.getElementById('searchClient').value
  // foco no campo de nome do cliente
  nameClient.focus()
  cpfClient.focus()
  // remover o valor digitado no campo de busca
  foco.value = ""
  // Verifica se o campoBusca é só número (CPF)
  if (/^\d+$/.test(campoBusca)) {
    cpfClient.value = campoBusca;
  } else {
    nameClient.value = campoBusca;
  }

})

// ========= Fim CRUD Read ============

// ========= CRUD Delete ===============

function excluirCliente() {
  console.log(id.value) // Passo 1 * (receber do form o id do cliente)
  api.deleteClient(id.value) // Passo 2 * (enviar o id ao main)
}

// ========= Fim CRUD Delete ============

// =================== Reset Form ============ //

function resetForm() {
  //Limpar os campos e resetar o formulario com as configurações pré definidas
  location.reload()
}

// Recebimento do pedido do main para resetar o formulario
api.resetForm((args) => {
  resetForm()
})

// =================== Fim Reset Form ======== //

// === Função para aplicar máscara no CPF ===
function aplicarMascaraCPF(campo) {
  let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
  if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

  campo.value = cpf;
}

// === Função para validar CPF ===
function validarCPF() {
  let campo = document.getElementById('inputCPFClient');
  let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  let soma = 0, resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  campo.style.borderColor = "green";
  campo.style.color = "green";
  return true;
}

// Adicionar eventos para CPF
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient)); // Máscara ao digitar
cpfClient.addEventListener("blur", validarCPF); // Validação ao perder o foco