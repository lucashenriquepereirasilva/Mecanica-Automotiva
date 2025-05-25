/**
 * Modelo de dados para construção das coleções("tabelas")
 * clientes 
 */

//Importação dos recursos do framework mongoose
const { model, Schema } = require('mongoose')

//Criação da estrutura da coleção Clientes
const osSchema = new Schema({
    
    dataEntrada: {
        type: Date,
        default: Date.now
    },

    idCliente: {
        type: String
    },

    nome: {
        type: String
    },

    cpf: {
        type: String
    },

    telefone: {
        type: String
    },
    
    motor: {
        type: String
    },
    combustivel: {
        type: String
    },
    ploblemas: {
        type: String
    },
    prazo: {
        type: String
    },
    funcionario: {
        type: String
    },
    stats: {
        type: String
    },
    servico: {
        type: String
    },
    observacoes: {
        type: String
    },
    valor: {
        type: String
    }

}, {versionKey: false
}) //Não versionar os dados armazenadas

//Exportar para o main o modelo de dados
//Clientes será o nome da coleção

module.exports = model('OS', osSchema)