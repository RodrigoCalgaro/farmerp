const models = require("./../models");
const User = models.User;
const Empresa = models.Empresa;
const UserEmpresa = models.UserEmpresa;
const Mailing = require("../utils/Mailing");
var randtoken = require('rand-token');

const grupoController = {};

grupoController.list = function (req, res) {
    Empresa.findAll().then(empresas => {
        if (empresas.length > 0) {
            for (let i = 0; i < empresas.length; i++) {
                const empresa = empresas[i];
                UserEmpresa.findAll({
                    where: {
                        empresaId: empresa.empresaId
                    },
                    include: [{
                        model: User
                    }]
                }).then(users => {
                    empresa.users = users
                    if (i == empresas.length - 1) {
                        res.render('admin/grupo/grupo-list', {
                            empresas
                        })
                    }
                })
            }
        } else {
            res.render('admin/grupo/grupo-list', {
                empresas
            })
        }
    })

}

grupoController.altaGrupo = function (req, res) {
    var nombreEmpresa = req.body.empresa.nombre;
    var anioCursado = req.body.cursado.anio;
    var users = req.body.users

    var inicioEjercicio = new Date(parseInt(anioCursado), 6, 1)
    var finEjercicio = new Date(parseInt(anioCursado) + 1, 5, 30)

    var empresa = {
        nombre: nombreEmpresa,
        inicioEjercicio,
        finEjercicio
    }

    Empresa.create(empresa).then(empresa => {
        var caja = {
            montoInicial: 0.0,
            empresaId: empresa.empresaId
        }

        var banco = {
            montoInicial: 0.0,
            empresaId: empresa.empresaId
        }

        var inversion = {
            montoInicial: 0.0,
            empresaId: empresa.empresaId
        }

        models.Caja.create(caja)
        models.Banco.create(banco)
        models.Inversion.create(inversion)

        users.forEach(user => {
            var token = randtoken.generate(8);
            user.password = token;
            user.role = 'user';

            User.create(user).then(user => {
                var userEmpresa = {
                    userId: user.userId,
                    empresaId: empresa.empresaId,
                    anioCursado
                }

                UserEmpresa.create(userEmpresa).then(userEmpresa => {
                    var para = user.email;
                    var asunto = "Bienvenido!";
                    var mensaje = 'Has sido dado de alta en nuestro sistema, ya puedes acceder a tu cuenta con las credenciales que se muestran a continuación. Puedes cambiar tu contraseña desde el menú "Mi Perfil".\n\n' +
                        'Usuario: ' + user.email + '\n' +
                        'Contraseña: ' + token + '\n\n\n\n' +
                        'http://' + req.headers.host + '\n\n' +
                        'Equipo FarmERP.\n'
                    return Mailing.enviarMail(para, asunto, mensaje);
                })
            })
        })

        req.flash('success_msg', 'Se dio de alta un nuevo grupo de alumnos correctamente');
        res.redirect('/grupos')
    })
}


module.exports = grupoController;