/**
 * Modelo de dados para construção das coleções ("Tabelas")
 * Clientes
 */

// importação dos recurso do framework mongoose
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção clientes
const clienteSchema = new Schema({
    nomeCliente: {
        type: String
    },

    cpfCliente: {
        type: String,
        unique: true,
        index: true,
    },

    emailCliente: {
        type: String,
    },

    foneCliente: {
        type: String,
    },

    cepCliente: {
        type: String,
    },

    logradouroCliente: {
        type: String,
    },

    numeroCliente: {
        type: String,
    },

    complementoCliente: {
        type: String,
    },

    bairroCliente: {
        type: String,
    },

    cidadeCliente: {
        type: String,
    },

    ufCliente: {
        type: String,
    }

}, { versionkey: false }) // não versionar os dados armazenados

// exportar para o main o modelo de dados
// OBS: Clientes será o nome da coleçãoF

module.exports = model('Clientes', clienteSchema)