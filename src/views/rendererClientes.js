
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


let arrayClient = []


const foco = document.getElementById('searchClient')


document.addEventListener('DOMContentLoaded', () => {

  btnUpdate.disabled = true
  btnDelete.disabled = true

  foco.focus()
})




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


let id = document.getElementById('idClient')






function teclaEnter(event) {

  if (event.key === "Enter") {
    event.preventDefault() 
    buscarCliente()
  }
}


function restaurarEnter() {
  frmClient.removeEventListener('keydown', teclaEnter)
}


frmClient.addEventListener('keydown', teclaEnter)





frmClient.addEventListener('submit', async (event) => {

  event.preventDefault()


  if (id.value === "") {


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

    api.newClient(client)

  } else {

    

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

    api.updateClient(client)
  }

})





function buscarCliente() {


  let name = document.getElementById('searchClient').value
  console.log(name) // teste do passo 1

 
  if (name === "") {

    api.validateSearch()
    foco.focus()
  } else {
    api.searchName(name) 

    api.renderClient((event, dataClient) => {
      console.log(dataClient) // teste do passo 5


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

      
        btnCreate.disabled = true
        
        btnUpdate.disabled = false
        btnDelete.disabled = false

      })
    })
  }
}


api.setClient((args) => {

  let campoBusca = document.getElementById('searchClient').value

  nameClient.focus()
  cpfClient.focus()

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