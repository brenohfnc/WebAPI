var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoClient = mongo.MongoClient, Db = mongo.Db, BSON = mongo.BSONPure;


var uri = 'mongodb://admin:admin@clusterti-shard-00-00-s5bx1.mongodb.net:27017,clusterti-shard-00-01-s5bx1.mongodb.net:27017,clusterti-shard-00-02-s5bx1.mongodb.net:27017/ONG?ssl=true&replicaSet=ClusterTI-shard-0&authSource=admin';
var db = {};

mongoClient.connect(uri, function(err, dataBase) {
    db = dataBase;
    db.open(function (error, db) {
        if (!error) {
            db.collection('Usuario', { strict: true }, function (error, collection) {
                if (error) {
                    console.log(error);
                }
            });
        }
    });
});

exports.RealizarLogin = function (req, res) {
    var login = req.body.login;
    var senha = req.body.senha;
    db.collection('Usuario', function (err, collection) {
        collection.findOne({ 'CpfCnpj': login }, function (err, item) {
            if (item != null && item.Senha == senha) {
                res.status(200).json({ Id: item._id, Nome: item.Nome, Perfil: item.Perfil });
            } else {
                res.status(400).json({ ErrorMessage: 'Usuário ou senha inválidos' });
            }
        });
    });
}

exports.CadastrarUsuario = function (req, res) {
    var usuario = req.body;

    db.collection('Usuario', function (err, collection) {
        collection.findOne({ 'CpfCnpj': usuario.CpfCnpj }, function (err, item) {
            if (item != null) {
                res.status(400).json({ ErrorMessage: 'Já existe um usuário com esse CPF/CNPJ.' });
            } else {
                collection.insert(usuario, { safe: true }, function (err, result) {
                    if (err) {
                        res.status(500).json({ ErrorMessage: 'Ocorreu um erro ao inserir usuário' });
                    } else {
                         collection.findOne({ 'CpfCnpj': usuario.CpfCnpj }, function (err, item2) {
                             if (err) {
                                res.status(500).json({ ErrorMessage: 'Ocorreu um erro ao inserir usuário' });
                             }
                            res.status(200).json({ Id: item2._id, Nome: item2.Nome, Perfil: item2.Perfil });
                         });
                    }
                });
            }
        });
    });
}

exports.ListarDoacoes = function (req, res) {
    var id = req.query.id;

    db.collection('Usuario', function (err, collection) {
        collection.findOne({ '_id': new ObjectId(id) }, function (err, item) {
            if (item != null) {
                if (item.Perfil[0].hasOwnProperty("Associado")) {
                    res.status(200).json({ ListaDoacoes: item.DoacoesRealizadas });
                } else {
                    res.status(200).json({ ListaDoacoes: item.DoacoesRecebidas });
                }
            } else {
                res.status(400).json({ ErrorMessage: 'Usuário não encontrado' });
            }
        });
    });
}

exports.RealizarDoacao = function (req, res) {
    var idDoador = req.query.id;
    var cpfCnpjAssistido = req.query.cpfcnpj;
    var objDoacao = req.body;

    db.collection('Usuario', function (err, collection) {
        collection.findOne({ '_id': new ObjectId(idDoador) }, function (err, item) {
            if (item != null) {
                item.DoacoesRealizadas.push(objDoacao);
                collection.update({ '_id': new ObjectId(item._id) }, item, function (err, result) {
                    collection.findOne({ 'CpfCnpj': cpfCnpjAssistido }, function (err, item2) {
                        item2.DoacoesRecebidas.push({ Data: objDoacao.Data, Valor: objDoacao.Valor });
                        collection.update({ '_id': new ObjectId(item2._id) }, item2, function (err, result) {
                            res.status(200).json({ SuccessMessage: 'Doação realizada com sucesso.' });
                        });
                    });
                });
            } else {
                res.status(400).json({ ErrorMessage: 'Erro ao realizar doação' });
            }
        });
    });
}

exports.ListarUsuarios = function (req, res) {
    var perfil = req.query.perfil;

    if (perfil == 'Associado') {
        db.collection('Usuario', function (err, collection) {
            collection.find({ 'Perfil': [{ 'Associado': true }] }).toArray(function (err, itens) {
                if (itens != null) {
                    delete itens["Senha"];
                    res.status(200).json({ ListaUsuarios: itens});
                } else {
                    res.status(400).json({ ErrorMessage: 'Usuários não encontrados' });
                }
            });
        });
    } else {
        db.collection('Usuario', function (err, collection) {
            collection.find({ 'Perfil': [{ 'Assistido': true }] }).toArray(function (err, itens) {
                if (itens != null) {
                    delete itens["Senha"];
                    res.status(200).json({ ListaUsuarios: itens});
                } else {
                    res.status(400).json({ ErrorMessage: 'Usuários não encontrados' });
                }
            });
        });
    }
}