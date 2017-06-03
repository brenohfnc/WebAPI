var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();
var UsuarioController = require('./Routes/Usuario');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.post('/Usuario/Login', UsuarioController.RealizarLogin)
app.post('/Usuario/Cadastro', UsuarioController.CadastrarUsuario)

app.post('/Usuario/RealizarDoacao', UsuarioController.RealizarDoacao)
app.get('/Usuario/ListarDoacoes', UsuarioController.ListarDoacoes)

app.get('/Usuario/ListarUsuarios', UsuarioController.ListarUsuarios)

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("API escutando em: http://%s:%s", host, port)
});