var MC_fechaDeCompra = null
var MC_disponibilidades = null
var MC_lineaCompraId = 1
var MC_TotalCompra = 0
var MC_TotalAbonado = 0

function MC_updateFechaDeCompra(fechaDeCompra) {
    MC_fechaDeCompra = fechaDeCompra

    axios.get('/apiCompra/getDisponibilidades/' + datosEmpresa.empresaId + '/' + fechaDeCompra).then(res => {
        MC_disponibilidades = res.data
        console.log(MC_disponibilidades)
        MC_updateCuentas()
    })
}

function MC_updateCuentas() {
    var divMovimientos = vista.querySelectorAll('div.MC_lineaCompra');
    if (MC_disponibilidades) {
        divMovimientos.forEach(lineaMC => {
            var cuenta = lineaMC.querySelector(".MC_cuenta").value
            var saldo = lineaMC.querySelector(".MC_saldo")
            var cuentaId = lineaMC.querySelector(".MC_cuentaId")
            var monto = lineaMC.querySelector(".MC_monto")
            var proveedor = lineaMC.querySelector(".MC_proveedor")

            if (cuenta == 'Banco') {
                saldo.value = MC_disponibilidades.banco.saldo
                cuentaId.value = MC_disponibilidades.banco.bancoId
                proveedor.classList.add('d-none')
                monto.max = MC_disponibilidades.banco.saldo
            }

            if (cuenta == 'Caja') {
                saldo.value = MC_disponibilidades.caja.saldo
                cuentaId.value = MC_disponibilidades.caja.cajaId
                proveedor.classList.add('d-none')
                monto.max = MC_disponibilidades.caja.saldo
            }

            if (cuenta == 'DeudaComercial') {
                saldo.value = 0
                proveedor.classList.remove('d-none')
                monto.removeAttribute('max')

                if (MC_disponibilidades.proveedores.length > 0) {
                    proveedor.innerHTML = ''
                    MC_disponibilidades.proveedores.forEach(prov => {
                        proveedor.innerHTML +=
                            `<option value="${prov.deudaComercialId}">${prov.proveedor}</option> `
                    })
                    if (cuentaId.value == 0) {
                        saldo.value = MC_disponibilidades.proveedores[0].monto
                        cuentaId.value = MC_disponibilidades.proveedores[0].deudaComercialId
                    } else {
                        MC_disponibilidades.proveedores.forEach(disp => {
                            if (disp.deudaComercialId == cuentaId.value) {
                                saldo.value = disp.monto
                            }
                        });
                        proveedor.value = cuentaId.value
                    }
                }
            }

        })
    }
}

function MC_updateSaldoProveedor(lineaId) {
    var lineaMC = vista.querySelector("#lineaCompra-" + lineaId)
    var saldo = lineaMC.querySelector(".MC_saldo")
    var cuentaId = lineaMC.querySelector(".MC_cuentaId")
    var proveedor = lineaMC.querySelector(".MC_proveedor")

    MC_disponibilidades.proveedores.forEach(prov => {
        if (prov.deudaComercialId == proveedor.value) {
            saldo.value = prov.monto
            cuentaId.value = prov.deudaComercialId
        }
    })
}

function MC_addLineaCompra() {
    var line = `
        <div id="lineaCompra-${MC_lineaCompraId}" class="form-row MC_lineaCompra">
            <input type="hidden" name="movimientoCompra[${MC_lineaCompraId}][cuentaId]" class="MC_cuentaId" id="MC_CuentaId-${MC_lineaCompraId}">
                
            <div class="form-group col-md-2">
                <select name="movimientoCompra[${MC_lineaCompraId}][cuenta]" class="form-control MC_cuenta" id="MC_MedioDePago-${MC_lineaCompraId}"
                    onchange="MC_updateCuentas()">
                    <option value="Banco" selected>Banco</option>
                    <option value="Caja">Caja</option>
                    <option value="DeudaComercial">Crédito</option>
                </select>
            </div>

            <div class="form-group col-md-3">
                <select class="form-control d-none MC_proveedor" id="MC_proveedores-${MC_lineaCompraId}"
                    onchange="MC_updateSaldoProveedor(${MC_lineaCompraId})">
                    <option value="null" disabled selected>No se encontraron proveedores</option>
                </select>
            </div>

            <div class="form-group col-md-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                    </div>
                    <input type="number" class="form-control MC_saldo" id="MC_Saldo-${MC_lineaCompraId}" value="0" readonly>
                </div>
            </div>


            <div class="form-group ml-2 col-md-3">
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                    </div>
                    <input name="movimientoCompra[${MC_lineaCompraId}][monto]" type="number" min="0" step="0.01"
                        class="form-control MC_monto" id="MC_Monto-${MC_lineaCompraId}" placeholder="Monto" value="0" onkeyup="MC_updateSumaPagos()">
                </div>
            </div>

            <div class="form-group ml-2 mt-2">
                <a class="text-danger" onclick="MC_removeLineaCompra(${MC_lineaCompraId})"><i class="fa fa-trash"></i></a>
            </div>
        </div>
    `
    var divMovimientos = vista.querySelector('#divMovimientos');
    jQuery(divMovimientos).append(line)
    MC_lineaCompraId += 1
    MC_updateCuentas()
}

function MC_removeLineaCompra(id) {
    jQuery("#lineaCompra-" + id).remove()
    MC_updateSumaPagos()
}

function MC_updateSumaPagos() {
    var total = 0
    var MC_SumaPagos = vista.querySelector("#MC_SumaPagos")
    var divMovimientos = vista.querySelectorAll('div.MC_lineaCompra');
    divMovimientos.forEach(lineaMC => {
        var monto = lineaMC.querySelector(".MC_monto")
        if (monto.value) {
            total += parseFloat(monto.value)
        }
    })
    MC_SumaPagos.innerHTML = '<b>Suma de los Pagos:</b> $ ' + total
    MC_TotalAbonado = total
}

function updateTotalAPagar(importe) {
    var MC_TotalAPagar = vista.querySelector("#MC_TotalAPagar")
    MC_TotalAPagar.innerHTML = '<b>Suma de los Pagos:</b> $ ' + importe
    MC_TotalCompra = importe
}

function validarPagos() {
    if (MC_TotalCompra == MC_TotalAbonado) {
        return true
    } else {
        alert('La suma de los pagos no coincide con el importe de la compra')
        return false
    }
}

function ocultarMediosPago() {
    vista.querySelector("#divCompra").classList.add('d-none')
}

function mostrarMediosPago() {
    vista.querySelector("#divCompra").classList.remove('d-none')
}