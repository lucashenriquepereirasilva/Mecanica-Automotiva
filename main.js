console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

// Esta linha está relacionada ao preload.js
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// importação do Schema Clientes da camada model
const clientModel = require('./src/models/clientes.js')
const cpfModel = require('./src/models/clientes.js')

//Importação do modelo de dados do os
const osModel = require("./src/models/os.js")

// importação do pacote jspdf (npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

// importação do mongoose
const mongoose = require('mongoose')

// importação da biblioteca fs (nativa do javascript) para manipulação de arquivos
const fs = require('fs')

// Importação do recurso 'electron-prompt' (dialog de input)
// 1º instalar o recurso: npm i electron-prompt
const prompt = require('electron-prompt')

// Janela principal
let win
const createWindow = () => {
  // a linha abaixo define o tema (claro ou escuro)
  nativeTheme.themeSource = 'light' //(dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    //autoHideMenuBar: true,
    //minimizable: false,
    resizable: false,
    //ativação do preload
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')

  // recebimento dos pedidos para abertura de janelas (botões) autorizado no preload.js
  ipcMain.on('client-window', () => {
    clientWindow()
  })
  ipcMain.on('os-window', () => {
    osWindow()
  })
}

// Janela Sobre
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // ↓ obtém a janela principal ↓
  const main = BrowserWindow.getFocusedWindow()
  let about // ← estabelecer uma relação hierárquica entre janelas
  if (main) {
    about = new BrowserWindow({
      width: 360,
      height: 200,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true,

    })
  }
  about.loadFile('./src/views/sobre.html')
}

// JANELA CLIENTES

let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1020,
      height: 720,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      //ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  client.loadFile('./src/views/clientes.html')
  client.center() //inicar no centro da tela
}

// JANELA OS

let os
function osWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os = new BrowserWindow({
      width: 1020,
      heigth: 1920,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      //ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  os.loadFile('./src/views/os.html')
  os.center() //inicar no centro da tela
}

// Iniciar a aplicação
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
  let conectado = await conectar()
  // se conectado for igual a true
  if (conectado) {
    // enviar uma mensagem para o renderizador trocar o ícone
    setTimeout(() => {
      event.reply('db-status', "conectado")
    }, 500)
  }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for encerrada
app.on('before-quit', () => {
  desconectar()
})


// template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Clientes',
        click: () => clientWindow()
      },
      {
        label: 'Ordem de Serviço',
        click: () => osWindow()
      },
      {
        label: 'Sair',
        click: () => app.quit(),
        accelerator: 'Alt+F4'
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      },
      {
        label: 'Ordem de Serviços',
        submenu: [
          {
            label: 'Abertas',
            click: () => relatorioOSAbertas()
          },
          {
            label: 'Andamento',
            click: () => relatorioOSAndamento()
          },
          {
            label: 'Finalizadas',
            click: () => relatorioOSFinalizadas()
          },
          {
            label: 'Canceladas',
            click: () => relatorioOSCanceladas()
          }
        ]
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'Ferramentas do Desenvolvedor',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

// ==========================
// == Clientes - CRUD Create

// recebimento do objeto que contem os dados do cliente
ipcMain.on('new-client', async (event, client) => {
  // importante! teste de recebimento dos dados do cliente
  console.log(client)
  // cadastrar a estrutura de dados no banco de dados MongoDB
  try {
    // criar uma nova de estrtutra de dados usando a classe modelo
    // Atenção os atributos precisam ser identicos ao modelo de dados Clientes.js e os valores são defifidos pelo conteúdo do objeto cliente
    const newClient = new clientModel({
      nomeCliente: client.nameCli,
      cpfCliente: client.cpfCli,
      emailCliente: client.emailCli,
      foneCliente: client.phoneCli,
      cepCliente: client.cepCli,
      logradouroCliente: client.addressCli,
      numeroCliente: client.numberCli,
      complementoCliente: client.complementCli,
      bairroCliente: client.bairroCli,
      cidadeCliente: client.cityClient,
      ufCliente: client.ufCli,
    })
    // salvar os dados do cliente no banco de dados
    await newClient.save()
    // mensagem de confirmção
    dialog.showMessageBox({
      // customização
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      // ação ao pressionar o botão
      if (result.response === 0) {
        // enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo) preload.js
        event.reply('reset-form')
      }
    })
  } catch (error) {
    // se o código de erro for 11000 (cpf duplicado) enviar uma mensagem ao usuário
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção",
        message: "CPF já está cadastrado\n Verifique se digitou corretamente",
        buttons: ['OK']
      }).then((result) => {

      })
    }
    console.log(error)
  }
})
// == Fim - Cliente - CRUD Create
// =========== Relatório de Cliente ============

async function relatorioClientes() {
  try {
    // passo 1: consultar o banco de dados e obter a listagem de clientes cadastrados por ordem alfabetica
    const clientes = await clientModel.find().sort({ nomeCliente: 1 })

    // teste de recebimento da listagem de clientes
    // console.log(clientes)
    // Passo 2: Formatação do documento pdf
    // p - portrait | l - landscape | mm e a4 (folha A4(210x297mm))
    const doc = new jsPDF('p', 'mm', 'a4')

    // inserir imagem no documento pdf
    // imagePath (caminho da imagem que será inserida no pdf)
    // imageBase 64 (usa da biblioteca fs para ler o arquivo no formato png)
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'lucas.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 13, 8) //(5mm, 8mm x,y)

    // definir o tamanho da fonte
    doc.setFontSize(18)

    // escrever um texto (título)
    doc.text("Relatório de Clientes", 14, 45)//x,y (mm) 

    // inserir a data atual no relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    // variavel de apio na formatação
    let y = 60
    doc.text("Nome", 14, y)
    doc.text("Telefone", 80, y)
    doc.text("E-mail", 130, y)
    y += 5

    // desenhar linha
    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    //renderizar os clientes cadastrados no banco
    y += 10 // espaçãmento da linha
    // percorrer o vetor clientes (obtido do banco) usando o laço forEach (equivale ao laço for)
    clientes.forEach((c) => {
      // adicionar outra página se a folha inteira for preenchida (estratégia é saber o tamanho da folha)
      if (y > 280) {
        doc.addPage()
        y = 20 // resetar a variável y
        // redesenhar o cabeçalho
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("E-mail", 130, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
      doc.text(c.nomeCliente, 14, y)
      doc.text(c.foneCliente, 80, y)
      doc.text(c.emailCliente || "N/A", 130, y)
      y += 10 // quebra de linha
    })

    // Adicionar numeração automatica de páginas
    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    // Definir o caminho do arquivo temporário e nome do arquivo
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')

    // salvar  temporariamente o arquivo
    doc.save(filePath)

    // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}


// =========== FIM Relatório de Cliente =============

// =========== CRUD READ ============================

// validação de busca (preenchimento obrigatório)
ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
    type: 'warning',
    title: "Atenção",
    message: "Preencha o campo de busca",
    buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, name) => {
  //console.log("teste IPC search-name")
  //console.log(name) // teste do passo 2 (importante)
  // passo 3 e 4 busca dos dados do cliente do banco
  // find ({nomeCliente: name}) - buscar pelo nome
  // RegExp(name, i) - i (insensitive / ignorar maiusculo ou minusculo)
  try {
    const dataClient = await clientModel.find({
      $or: [
        { nomeCliente: new RegExp(name, 'i') },
        { cpfCliente: new RegExp(name, 'i') }
      ]
    })
    console.log(dataClient) // teste passos 3 e 4 (importante)
    // melhoria da expriência do usuário (se o cliente não estiver cadastrado, alertar o usuário e questionar se ele quer cadastrar este novo cliente.Se não quiser cadastrar, limpar os campos, se quiser cadastrar recortar o nome do cliente do campo de busca e colar no campo nome)

    // se o vetor estiver vazio [] (cliente não cadastrado)
    if (dataClient.length === 0) {
      dialog.showMessageBox({
        type: 'question',
        title: 'Aviso',
        message: "Cliente não cadastrado. \nDeseja cadastrar esse cliente?",
        defaultId: 0, //botão 0
        buttons: ['Sim', 'Não'] //[0,1]

      }).then((result) => {
        if (result.response === 0) {
          // enviar ao renderizador um pedido para setar os campos(recortar do campo de busca e colar no campo nome
          event.reply('set-client')
        } else {
          // limpar formulario
          event.reply('reset-form')
        }

      })
    }


    // passo 5
    // enviando os dados cliente ao rendererCliente
    // OBS: IPC só trabalha com string, então é necessário converter o JSON para o string
    event.reply('render-client', JSON.stringify(dataClient))
  } catch (error) {
    console.log(error)
  }
})

// =========== FIM CRUD READ ========================

// =========== CRUD DELETE ==========================

ipcMain.on('delete-client', async (event, id) => {
  console.log(id) // teste do passo 2 (recebimento do id)
  try {
    // importante- confirmar a exclusão
    // client é o nome da variavel que representa a janela
    const { response } = await dialog.showMessageBox(client, {
      type: 'warning',
      title: "Atenção!",
      message: "Deseja excluir este cliente? \nEsta ação não poderá ser desfeita",
      buttons: ['Cancelar', 'Excluir'] //[0,1]
    })
    if (response === 1) {

      // Passo 3 - Excluir o registro do cliente
      const delClient = await clientModel.findByIdAndDelete(id)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})

// =========== FIM DO CRUD DELETE ===================

// =========== CRUD UPDATE ===================

ipcMain.on('update-client', async (event, client) => {
  console.log(client) // teste importante dos recebimentos dos dados do cliente
  try {

    // criar uma nova de estrtutra de dados usando a classe modelo
    // Atenção os atributos precisam ser identicos ao modelo de dados Clientes.js e os valores são defifidos pelo conteúdo do objeto cliente
    const updateClient = await clientModel.findByIdAndUpdate(
      client.idCli,
      {
        nomeCliente: client.nameCli,
        cpfCliente: client.cpfCli,
        emailCliente: client.emailCli,
        foneCliente: client.phoneCli,
        cepCliente: client.cepCli,
        logradouroCliente: client.addressCli,
        numeroCliente: client.numberCli,
        complementoCliente: client.complementCli,
        bairroCliente: client.bairroCli,
        cidadeCliente: client.cityClient,
        ufCliente: client.ufCli,
      },
      {
        new: true
      }
    )
    // confirmação
    // mensagem de confirmção
    dialog.showMessageBox({
      // customização
      type: 'info',
      title: "Aviso",
      message: "Dados atualizados com sucesso",
      buttons: ['OK']
    }).then((result) => {
      // ação ao pressionar o botão
      if (result.response === 0) {
        // enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo) preload.js
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.log(error)
  }
})

// =========== FIM DO CRUD UPDATE ===================


//************************************************************/
//*******************  Ordem de Serviço  *********************/
//************************************************************/


//==================== RELATORIO OS ==============================/


async function relatorioOSAbertas() {
  try {
    
    const clientes = await osModel.find({ stats: 'Aberta' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'auto.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 13, 3) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Tipo do motor", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {
      
      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("tipo de motor", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
    
      doc.text(c.motor|| "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSAndamento() {
  try {
    
    const clientes = await osModel.find({ stats: 'Em andamento' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'auto.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 13, 3) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Tipo de motor", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {
      
      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("tipo de motor", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
    
      doc.text(c.motor || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSFinalizadas() {
  try {
    
    const clientes = await osModel.find({ stats: 'Finalizada' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'auto.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 13, 4) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Tipo de motor", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {
      
      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("tipo de motor", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
    
      doc.text(c.motor || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSCanceladas() {
  try {
    
    const clientes = await osModel.find({ stats: 'Cancelada' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'auto.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 14, 3) //(5mm, 8mm x,y)

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)//x,y (mm) 

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Tipo de motor", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    y += 10 // espaçãmento da linha

    clientes.forEach((c) => {
      
      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("tipo de motor", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
    
      doc.text(c.motor || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}


// =============================== FIM RELATORIO OS =======================================



// ================ Buscar Cliente para vincular na OS estilo GOOGLE =================

ipcMain.on('search-clients', async (event) => {
  try {
    // Buscar clientes no banco em ordem alfabética pelo nome
    const clientes = await clientModel.find().sort({ nomeCliente: 1 })
    //console.log(clientes) // teste do passo 2

    // passo 3: Envio dos clientes para o renderizador
    // obs: não esquecer de converter para String
    event.reply('list-clients', JSON.stringify(clientes))

  } catch (error) {
    console.log(error)
  }
})


// ================ FIM BUSCAR CLIENTE PELA OS =======================

// ============================================================
// == CRUD Create - Gerar OS ==================================

// Validação de busca (preenchimento obrigatório Id Cliente-OS)
ipcMain.on('validate-client', (event) => {
  dialog.showMessageBox({
    type: 'warning',
    title: "Aviso!",
    message: "É obrigatório vincular o cliente na Ordem de Serviço",
    buttons: ['OK']
  }).then((result) => {
    //ação ao pressionar o botão (result = 0)
    if (result.response === 0) {
      event.reply('set-search')
    }
  })
})

ipcMain.on('new-os', async (event, os) => {
  //importante! teste de recebimento dos dados da os (passo 2)
  console.log(os)
  // Cadastrar a estrutura de dados no banco de dados MongoDB
  try {
    // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OS.js e os valores são definidos pelo conteúdo do objeto os
    const newOS = new osModel({
      idCliente: os.idClientOS,
      nome: os.nome_OS,
      cpf: os.cpf_OS,
      telefone: os.telefone_OS,
      marca: os.marca_OS,
      modelo: os.modelo_OS,
      placa: os.placa_OS,
      prazo: os.prazo_OS,
      funcionario: os.funcionario_OS,
      stats: os.stats_OS,
      servico: os.servico_OS,
      observacoes: os.observacoes_OS,
      valor: os.valor_OS
    })
    // salvar os dados da OS no banco de dados
    await newOS.save()
    // Mensagem de confirmação
    dialog.showMessageBox({
      //customização
      type: 'info',
      title: "Aviso",
      message: "OS gerada com sucesso",
      buttons: ['OK']
    }).then((result) => {
      //ação ao pressionar o botão (result = 0)
      if (result.response === 0) {
        //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.log(error)
  }
})

// == Fim - CRUD Create - Gerar OS ===========================
// ============================================================


// ============================================================
// == Buscar OS ===============================================

ipcMain.on('search-os', (event) => {
  //console.log("teste: busca OS")
  prompt({
    title: 'Buscar OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
      type: 'text'
    },
    type: 'input',
    width: 400,
    height: 200
  }).then(async (result) => {
    if (result !== null) {

      //buscar a os no banco pesquisando pelo valor do result (número da OS)
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          const dataOS = await osModel.findById(result)
          if (dataOS) {
            console.log(dataOS) // teste importante
            // enviando os dados da OS ao rendererOS
            // OBS: IPC só trabalha com string, então é necessário converter o JSON para string JSON.stringify(dataOS)
            event.reply('render-os', JSON.stringify(dataOS))
          } else {
            dialog.showMessageBox({
              type: 'warning',
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ['OK']
            })
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        dialog.showMessageBox({
          type: 'error',
          title: "Atenção!",
          message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
          buttons: ['OK']
        })
      }
    }
  })
})






// == Fim - Buscar OS =========================================
// ============================================================


// ======================= IMPRIMIR OS ========================

ipcMain.on('print-os', (event) => {
  //console.log("teste: busca OS")
  prompt({
    title: 'Imprimir OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
      type: 'text'
    },
    type: 'input',
    width: 400,
    height: 200
  }).then(async (result) => {
    if (result !== null) {

      //buscar a os no banco pesquisando pelo valor do result (número da OS)
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          // teste para ver se está funcionando
          //console.log ("Lucas Doente")
          const dataOS = await osModel.findById(result)
          if (dataOS) {
            console.log(dataOS) // teste importante

            // extrair os dados do cliente
            const dataClient = await clientModel.find({
              _id: dataOS.idCliente                
            })
            console.log(dataClient) 
            
            // impressão (documento PDF) com os dados da Os, do cliente e termos do serviço (uso do jspdf)
          } else {
            dialog.showMessageBox({
              type: 'warning',
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ['OK']
            })
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        dialog.showMessageBox({
          type: 'error',
          title: "Atenção!",
          message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
          buttons: ['OK']
        })
      }
    }
  })
})


// ======================= Fim - IMPRIMIR OS ====================
// ==============================================================