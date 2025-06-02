


const input = document.getElementById('inputSearchClient')


const suggestionList = document.getElementById('viewListSuggestion')


let idClient = document.getElementById('inputIdClient')
let nameClient = document.getElementById('inputNameClient')
let foneClient = document.getElementById('inputIPhoneClient')
let cpfClient = document.getElementById('inputCPFClient')

let arrayClients = []


input.addEventListener('input', () => {
    
    const search = input.value.toLowerCase()
    
    
    api.searchClients()
    
    api.listClients((event, clients) => {
        
        
        const dataClients = JSON.parse(clients)
        
        arrayClients = dataClients
        
        const results = arrayClients
            .filter(c => c.nomeCliente && c.nomeCliente.toLowerCase().includes(search))
            .slice(0, 5) 
        
        
        suggestionList.innerHTML = ""
        
        results.forEach(c => {
            
            const item = document.createElement('li')
            
            item.classList.add('list-group-item', 'list-group-item-action')
            
            item.textContent = c.nomeCliente
            
            suggestionList.appendChild(item)
            
            item.addEventListener('click', () => {
                idClient.value = c._id
                nameClient.value = c.nomeCliente
                cpfClient.value = c.cpfCliente
                foneClient.value = c.foneCliente
                
                input.value = ""
                suggestionList.innerHTML = ""
            })

        })

    })
})


document.addEventListener('click', (event) => {
    if (!input.contains(event.target) && !suggestionList.contains(event.target)) {
        suggestionList.innerHTML = ""
    }
})






const foco = document.getElementById('inputSearchClient');


document.addEventListener('DOMContentLoaded', () => {
    
    
    
    
    foco.focus();
});



const selectMarca = document.getElementById("inputMarcaVeiculoOS");



let arrayOS = []


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

let os = document.getElementById('inputSearchClient')

let dateOS = document.getElementById('inputData')









frmOS.addEventListener('submit', async (event) => {
    
    event.preventDefault()
    
    if (idClient.value === "") {
        api.validateClient()
    } else {
        
        console.log(os.value, idClient.value, nome.value, cpf.value, telefone.value, motor.value, combustivel.value, ploblemas.value, prazo.value, funcionario.value, stats.value, servico.value, observacoes.value, valor.value)
        if (os.value === "") {
            
            
            const os = {
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
            
            
            api.newOs(os)
        } else {
            
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
            
            
            api.updateOS(os)

            

        }
    }
})







function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {
    console.log(dataOS)
    const os = JSON.parse(dataOS)
    
    os.value = os._id

    
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








function resetForm() {
    
    location.reload()
}


api.resetForm((args) => {
    resetForm()
})



function removeOS() {
    console.log(idos.value) 
    api.deleteOS(idos.value) 
}




function searchOS() {
    console.log("Função searchOS executada.");
    
}


function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchOS(); 
    }
}


function restaurarEnter() {
    frmOS.removeEventListener('keydown', teclaEnter);
}



frmOS.addEventListener('keydown', teclaEnter)







function generateOS(){
    api.PrintOS()
}







