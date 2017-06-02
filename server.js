var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();
var UsuarioController = require('./Routes/Usuario');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/Usuario/Login', UsuarioController.RealizarLogin)
app.post('/Usuario/Cadastrar', UsuarioController.CadastrarUsuario)

app.post('/Usuario/RealizarDoacao', UsuarioController.RealizarDoacao)
app.get('/Usuario/ListarDoacoes', UsuarioController.ListarDoacoes)

app.get('/Usuario/ListarUsuarios', UsuarioController.ListarUsuarios)

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("API escutando em: http://%s:%s", host, port)
});