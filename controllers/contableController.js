const Saldos = require("./../utils/saldos")
const models = require("./../models");
const Op = models.Sequelize.Op
const sequelize = models.sequelize
const Credito = models.Credito
const RetiroSocio = models.RetiroSocio
const Insumo = models.Insumo
const Pradera = models.Pradera
const Stock = models.Stock
const Lote = models.Lote
const Infraestructura = models.Infraestructura
const Administracion = models.Administracion
const Equipo = models.Equipo
const Rodado = models.Rodado
const Tractor = models.Tractor
const Implemento = models.Implemento
const Autopropulsado = models.Autopropulsado
const DeudaComercial = models.DeudaComercial
const DeudaFinanciera = models.DeudaFinanciera
const DeudaFiscal = models.DeudaFiscal
const DeudaSocial = models.DeudaSocial
const DeudaOtra = models.DeudaOtra
const MovimientoCompra = models.MovimientoCompra;
const MovimientoVenta = models.MovimientoVenta;


var contableController = {};

/* API Caja */
contableController.getCaja = async (req, res) => {
    var caja = await Saldos.saldoCaja(req.params.empresaId, req.params.fecha)
    res.send(caja)
}

/* API Banco */
contableController.getBanco = async (req, res) => {
    var banco = await Saldos.saldoBanco(req.params.empresaId, req.params.fecha)
    res.send(banco)
}

/* API Inversiones Transitorias */
contableController.getInversiones = async (req, res) => {
    var inversiones = await Saldos.saldoInversion(req.params.empresaId, req.params.fecha)
    res.send(inversiones)
}

/* API Créditos */
contableController.getCreditos = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    Credito.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(creditos => {
        if (creditos.length > 0) {
            for (let i = 0; i < creditos.length; i++) {
                const credito = creditos[i];

                credito.dataValues.saldo = parseFloat(credito.monto)
                MovimientoVenta.findAll({
                    where: {
                        concepto: 'Credito',
                        conceptoId: credito.creditoId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            credito.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(credito)
                }).then(() => {
                    if (i == (creditos.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Retiro Socios */
contableController.getRetiroSocios = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    RetiroSocio.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(retiros => {
        if (retiros.length > 0) {
            for (let i = 0; i < retiros.length; i++) {
                const retiro = retiros[i];

                retiro.dataValues.saldo = parseFloat(retiro.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'RetiroSocio',
                        conceptoId: retiro.retiroSocioId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            retiro.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(retiro)
                }).then(() => {
                    if (i == (retiros.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Insumos Agrícola - Ganaderos */
contableController.getInsumos = (req, res) => {
    Insumo.findAll({
        where: {
            empresaId: res.locals.empresa.empresaId
        }
    }).then(insumos => {
        insumos.map(insumo => {
            var valorMercado = insumo.cantidad * insumo.valorUnitario;
            insumo.dataValues.valorMercado = valorMercado;
        });

        res.send(insumos);
    })
}

/* API Stock Productos */
contableController.getStocks = (req, res) => {
    Stock.findAll({
        where: {
            empresaId: res.locals.empresa.empresaId
        }
    }).then(stocks => {
        stocks.map(stock => {
            var valorMercado = stock.cantidad * stock.valorUnitario;
            stock.dataValues.valorMercado = valorMercado;
        });

        res.send(stocks);
    })
}

/* API Mejoras-Infraestructura */
contableController.getInfraestructuras = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Infraestructura.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(infraestructuras => {
        var valorTotal = 0

        infraestructuras.map(infraestructura => {
            if ((!infraestructura.fechaVenta || new Date(infraestructura.fechaVenta) > fecha) && new Date(infraestructura.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(infraestructura.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = infraestructura.cantidad * infraestructura.valorUnitario;
                var valorResidualMonto = infraestructura.cantidad * infraestructura.valorUnitario * infraestructura.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / infraestructura.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Administracion */
contableController.getAdministracions = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Administracion.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(administracions => {
        var valorTotal = 0

        administracions.map(administracion => {
            if ((!administracion.fechaVenta || new Date(administracion.fechaVenta) > fecha) && new Date(administracion.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(administracion.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = administracion.cantidad * administracion.valorUnitario;
                var valorResidualMonto = administracion.cantidad * administracion.valorUnitario * administracion.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / administracion.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Equipos */
contableController.getEquipos = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Equipo.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(equipos => {
        var valorTotal = 0

        equipos.map(equipo => {
            if ((!equipo.fechaVenta || new Date(equipo.fechaVenta) > fecha) && new Date(equipo.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(equipo.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = equipo.valorUnitario;
                var valorResidualMonto = equipo.valorUnitario * equipo.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / equipo.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Rodados */
contableController.getRodados = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Rodado.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(rodados => {
        var valorTotal = 0

        rodados.map(rodado => {
            if ((!rodado.fechaVenta || new Date(rodado.fechaVenta) > fecha) && new Date(rodado.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(rodado.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = rodado.cantidad * rodado.valorUnitario;
                var valorResidualMonto = rodado.cantidad * rodado.valorUnitario * rodado.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / rodado.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Tractores */
contableController.getTractores = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Tractor.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(tractores => {
        var valorTotal = 0

        tractores.map(tractor => {
            if ((!tractor.fechaVenta || new Date(tractor.fechaVenta) > fecha) && new Date(tractor.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(tractor.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = tractor.valorUnitario;
                var valorResidualMonto = tractor.valorUnitario * tractor.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / tractor.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Implementos */
contableController.getImplementos = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Implemento.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(implementos => {
        var valorTotal = 0

        implementos.map(implemento => {
            if ((!implemento.fechaVenta || new Date(implemento.fechaVenta) > fecha) && new Date(implemento.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(implemento.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = implemento.valorUnitario;
                var valorResidualMonto = implemento.valorUnitario * implemento.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / implemento.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Autopropulsados */
contableController.getAutopropulsados = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Autopropulsado.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(autopropulsados => {
        var valorTotal = 0

        autopropulsados.map(autopropulsado => {
            if ((!autopropulsado.fechaVenta || new Date(autopropulsado.fechaVenta) > fecha) && new Date(autopropulsado.fechaCompra) <= fecha) {

                var antiguedad = new Date(res.locals.empresa.finEjercicio) - new Date(autopropulsado.fechaCompra);
                antiguedad = Math.trunc(antiguedad / (1000 * 60 * 60 * 24 * 365))
                var valorMercado = autopropulsado.valorUnitario;
                var valorResidualMonto = autopropulsado.valorUnitario * autopropulsado.valorResidual / 100;
                var amortizacion = (valorMercado - valorResidualMonto) / autopropulsado.vidaUtil
                var amortizacionAcumulada;
                var valorANuevo;

                if (amortizacion * antiguedad >= valorMercado) {
                    amortizacionAcumulada = valorMercado
                } else {
                    amortizacionAcumulada = amortizacion * antiguedad
                }

                if (valorMercado - amortizacionAcumulada <= 0) {
                    valorANuevo = valorMercado
                } else {
                    valorANuevo = valorMercado - amortizacionAcumulada
                }

                valorTotal += parseFloat(valorANuevo)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Lotes*/
contableController.getLotes = (req, res) => {
    var fecha = new Date(req.params.fecha)

    Lote.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(lotes => {
        var valorTotal = 0

        lotes.map(lote => {
            if ((!lote.fechaVenta || new Date(lote.fechaVenta) > fecha) && (!lote.fechaCompra || new Date(lote.fechaCompra) <= fecha)) {
                var valorLote =  lote.superficie * lote.valorHectarea;
                valorTotal += parseFloat(valorLote)
            }
        });

        res.send({
            valorTotal
        });
    });
}

/* API Deudas Comerciales */
contableController.getDeudasComerciales = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    DeudaComercial.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(deudas => {
        if (deudas.length > 0) {
            for (let i = 0; i < deudas.length; i++) {
                const deuda = deudas[i];

                deuda.dataValues.saldo = parseFloat(deuda.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'DeudaComercial',
                        conceptoId: deuda.deudaComercialId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            deuda.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(deuda)
                }).then(() => {
                    if (i == (deudas.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Deudas Financieras */
contableController.getDeudasFinancieras = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    DeudaFinanciera.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(deudas => {
        if (deudas.length > 0) {
            for (let i = 0; i < deudas.length; i++) {
                const deuda = deudas[i];

                deuda.dataValues.saldo = parseFloat(deuda.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'DeudaFinanciera',
                        conceptoId: deuda.deudaFinancieraId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            deuda.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(deuda)
                }).then(() => {
                    if (i == (deudas.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Deudas Fiscales */
contableController.getDeudasFiscales = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    DeudaFiscal.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(deudas => {
        if (deudas.length > 0) {
            for (let i = 0; i < deudas.length; i++) {
                const deuda = deudas[i];

                deuda.dataValues.saldo = parseFloat(deuda.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'DeudaFiscal',
                        conceptoId: deuda.deudaFiscalId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            deuda.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(deuda)
                }).then(() => {
                    if (i == (deudas.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Deudas Sociales */
contableController.getDeudasSociales = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    DeudaSocial.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(deudas => {
        if (deudas.length > 0) {
            for (let i = 0; i < deudas.length; i++) {
                const deuda = deudas[i];

                deuda.dataValues.saldo = parseFloat(deuda.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'DeudaSocial',
                        conceptoId: deuda.deudaSocialId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            deuda.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(deuda)
                }).then(() => {
                    if (i == (deudas.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}

/* API Otras Deudas */
contableController.getDeudasOtras = (req, res) => {
    var fecha = new Date(req.params.fecha)
    var saldos = []

    DeudaOtra.findAll({
        where: {
            empresaId: req.params.empresaId
        }
    }).then(deudas => {
        if (deudas.length > 0) {
            for (let i = 0; i < deudas.length; i++) {
                const deuda = deudas[i];

                deuda.dataValues.saldo = parseFloat(deuda.monto)
                MovimientoCompra.findAll({
                    where: {
                        concepto: 'DeudaOtra',
                        conceptoId: deuda.deudaOtraId
                    }
                }).then(movimientos => {
                    movimientos.forEach(mov => {
                        if (new Date(mov.fecha) <= fecha) {
                            deuda.dataValues.saldo -= parseFloat(mov.monto)
                        }
                    });
                    saldos.push(deuda)
                }).then(() => {
                    if (i == (deudas.length - 1)) {
                        res.send(saldos)
                    }
                })
            }
        } else {
            res.send(saldos)
        }
    })
}


module.exports = contableController;