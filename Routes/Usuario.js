var mongo = require('mongodb');

var Server = mongo.Server, Db = mongo.Db, BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, { auto_reconnect: true });
db = new Db('ONG', server);

db.open(function (error, db) {
    if (!error) {
        db.collection('Usuario', { strict: true }, function (error, collection) {
            if (error) {
                console.log(error);
            }
        });
    }
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
    console.log('Inserindo usuário: ' + JSON.stringify(usuario));
    db.collection('Usuario', function (err, collection) {
        collection.findOne({ 'CpfCnpj': usuario.CpfCnpj }, function (err, item) {
            if (item != null) {
                res.status(400).json({ ErrorMessage: 'Já existe um usuário com esse CPF/CNPJ.' });
            } else {
                collection.insert(usuario, { safe: true }, function (err, result) {
                    if (err) {
                        res.status(500).json({ ErrorMessage: 'Ocorreu um erro ao inserir usuário' });
                    } else {
                        console.log('Sucesso ao inserir usuário: ' + JSON.stringify(result[0]));
                        res.status(200).json({ Id: result._id, Nome: result.Nome, Perfil: result.Perfil });
                    }
                });
            }
        });
    });
}

exports.ListarDoacoes = function (req, res) {
    var id = req.query.id;

    db.collection('Usuario', function (err, collection) {
        collection.findOne({ '_id': id }, function (err, item) {
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
        collection.findOne({ '_id': idDoador }, function (err, item) {
            if (item != null) {
                item.DoacoesRealizadas.push(objDoacao);
                collection.update({ '_id': item._id }, item, function (err, result) {
                    collection.findOne({ 'CpfCnpj': cpfCnpjAssistido }, function (err, item2) {
                        item2.DoacoesRecebidas.push({ Data: objDoacao.Data, Valor: objDoacao.Valor });
                        collection.update({ '_id': item2._id }, item2, function (err, result) {
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
            collection.find({ 'Perfil': [{ 'Associado': true }] }, function (err, itens) {
                if (itens != null) {
                    res.status(200).json(itens);
                } else {
                    res.status(400).json({ ErrorMessage: 'Usuários não encontrados' });
                }
            });
        });
    } else {
        db.collection('Usuario', function (err, collection) {
            collection.find({ 'Perfil': [{ 'Assistido': true }] }, function (err, itens) {
                if (itens != null) {
                    res.status(200).json(itens);
                } else {
                    res.status(400).json({ ErrorMessage: 'Usuários não encontrados' });
                }
            });
        });
    }
}