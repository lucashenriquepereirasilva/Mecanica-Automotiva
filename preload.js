/**
 * Arquivo de pré carregamento e reforço de segurança na comunicação entre processos (IPC)
 */

// importação dos recursos do framework electron
// contextBrigde (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

// enviar ao main um pedido para conexão com o banco de dados e troca do icone no processo de renderização (index.html - renderer.html)
ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    newOs: (os) => ipcRenderer.send('new-os', os),
    searchName: (name) => ipcRenderer.send('search-name', name),
    renderClient: (dataClient) => ipcRenderer.on('render-client', dataClient),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setClient: (args) => ipcRenderer.on('set-client', args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client),
    searchOS: () => ipcRenderer.send('search-os'),
    searchClients: (clients) => ipcRenderer.send('search-clients', clients),
    listClients: (clients) => ipcRenderer.on('list-clients', clients),
    setSearch: (args) => ipcRenderer.on('set-search', args),
    validateClient: () => ipcRenderer.send('validate-client'),
    renderOS: (dataOS) => ipcRenderer.on('render-os', dataOS),
    PrintOS: () => ipcRenderer.send('print-os'),
    updateOS: (os) => ipcRenderer.send('update-os', os),
    deleteOS: (idOS) => ipcRenderer.send('delete-os', idOS),

})

function dbStatus(message) {
    ipcRenderer.on('db-status', message)
}