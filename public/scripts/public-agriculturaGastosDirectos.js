var gastosDirectos = document.querySelectorAll("table tbody tr");
var vista;

var agregar = document.querySelector("#agregar");
if (agregar) {
    agregar.addEventListener('click', function () {
        vista = document.querySelector("#agregarModal");
        setMeses()
    })
}

gastosDirectos.forEach(function (row) {
    /* var ver = row.querySelector("#ver");
    ver.addEventListener("click", function () {
        var gastoDirecto = getElement(row);
        vista = document.querySelector("#verModal");
        setMeses()

   }) */

    var editar = row.querySelector("#editar");
    editar.addEventListener("click", function () {
        var gastoDirecto = getElement(row);
        vista = document.querySelector("#editarModal");
        vista.querySelector("form").setAttribute("action", "/agriculturaGastosDirectos/edit/" + gastoDirecto.gastoDirectoId);
        setMeses()

        vista.querySelector("#rubroAgriculturaGastoDirecto").value = gastoDirecto.rubroId;
        vista.querySelector("#conceptoAgriculturaGastoDirecto").value = gastoDirecto.conceptoId;
        vista.querySelector("#cantRequeridaAgriculturaGastoDirecto").value = gastoDirecto.cantRequerida;
        vista.querySelector("#valorUnitarioAgriculturaGastoDirecto").value = gastoDirecto.Concepto.precio;
        vista.querySelector("#cantAplicacionesAgriculturaGastoDirecto").value = gastoDirecto.cantAplicaciones;
        vista.querySelector("#mes1AgriculturaGastoDirecto").checked = gastoDirecto.mes1;
        vista.querySelector("#mes2AgriculturaGastoDirecto").checked = gastoDirecto.mes2;
        vista.querySelector("#mes3AgriculturaGastoDirecto").checked = gastoDirecto.mes3;
        vista.querySelector("#mes4AgriculturaGastoDirecto").checked = gastoDirecto.mes4;
        vista.querySelector("#mes5AgriculturaGastoDirecto").checked = gastoDirecto.mes5;
        vista.querySelector("#mes6AgriculturaGastoDirecto").checked = gastoDirecto.mes6;
        vista.querySelector("#mes7AgriculturaGastoDirecto").checked = gastoDirecto.mes7;
        vista.querySelector("#mes8AgriculturaGastoDirecto").checked = gastoDirecto.mes8;
        vista.querySelector("#mes9AgriculturaGastoDirecto").checked = gastoDirecto.mes9;
        vista.querySelector("#mes10AgriculturaGastoDirecto").checked = gastoDirecto.mes10;
        vista.querySelector("#mes11AgriculturaGastoDirecto").checked = gastoDirecto.mes11;
        vista.querySelector("#mes12AgriculturaGastoDirecto").checked = gastoDirecto.mes12;

        updateValorHa()
    })

    var view = row.querySelector("#view");
    view.addEventListener("click", function () {
        var gastoDirecto = getElement(row);
        vista = document.querySelector("#viewModal");
        vista.querySelector("form").setAttribute("action", "/agriculturaGastosDirectos/view/" + gastoDirecto.gastoDirectoId);
        setMeses()

        vista.querySelector("#rubroAgriculturaGastoDirecto").value = gastoDirecto.rubroId;
        vista.querySelector("#conceptoAgriculturaGastoDirecto").value = gastoDirecto.conceptoId;
        vista.querySelector("#cantRequeridaAgriculturaGastoDirecto").value = gastoDirecto.cantRequerida;
        vista.querySelector("#valorUnitarioAgriculturaGastoDirecto").value = gastoDirecto.Concepto.precio;
        vista.querySelector("#cantAplicacionesAgriculturaGastoDirecto").value = gastoDirecto.cantAplicaciones;
        vista.querySelector("#mes1AgriculturaGastoDirecto").checked = gastoDirecto.mes1;
        vista.querySelector("#mes2AgriculturaGastoDirecto").checked = gastoDirecto.mes2;
        vista.querySelector("#mes3AgriculturaGastoDirecto").checked = gastoDirecto.mes3;
        vista.querySelector("#mes4AgriculturaGastoDirecto").checked = gastoDirecto.mes4;
        vista.querySelector("#mes5AgriculturaGastoDirecto").checked = gastoDirecto.mes5;
        vista.querySelector("#mes6AgriculturaGastoDirecto").checked = gastoDirecto.mes6;
        vista.querySelector("#mes7AgriculturaGastoDirecto").checked = gastoDirecto.mes7;
        vista.querySelector("#mes8AgriculturaGastoDirecto").checked = gastoDirecto.mes8;
        vista.querySelector("#mes9AgriculturaGastoDirecto").checked = gastoDirecto.mes9;
        vista.querySelector("#mes10AgriculturaGastoDirecto").checked = gastoDirecto.mes10;
        vista.querySelector("#mes11AgriculturaGastoDirecto").checked = gastoDirecto.mes11;
        vista.querySelector("#mes12AgriculturaGastoDirecto").checked = gastoDirecto.mes12;

        updateValorHa()
    })

    var eliminar = row.querySelector("#eliminar");
    if (eliminar) {
        eliminar.addEventListener("click", function () {
            var gastoDirecto = getElement(row);
            vista = document.querySelector("#eliminarModal");
            vista.querySelector("form").setAttribute("action", "/agriculturaGastosDirectos/delete/" + gastoDirecto.gastoDirectoId);
        });
    }
});


function updateValorUnitario(conceptos){
    let conceptoId = conceptos.value
    let precio;
    let options = conceptos.querySelectorAll("option")
    let valorUnitario = vista.querySelector("#valorUnitarioAgriculturaGastoDirecto")
    
    options.forEach(option => {
        if (conceptoId == option.value){
            valorUnitario.value = parseFloat(option.attributes["data-precio"].value)
            updateValorHa()
            return
        } 
    })
}

function updateValorHa(){
    let cantRequerida = vista.querySelector("#cantRequeridaAgriculturaGastoDirecto").value
    let valorUnitario = vista.querySelector("#valorUnitarioAgriculturaGastoDirecto").value
    let valorHa = vista.querySelector("#valorHectareaAgriculturaGastoDirecto")

    valorHa.value = (isNaN(cantRequerida * valorUnitario) ? 0 : cantRequerida * valorUnitario)
}

function getElement(row) {
    var element = JSON.parse(row.attributes["data"].value);
    return element;
}

function setMeses() {
    let mes = empresaInicioEjercicio.getMonth()
    let anio = empresaInicioEjercicio.getFullYear()
    let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    for (let i = 1; i < 13; i++) {
        if (!(mes < 12)) {
            mes = 0
            anio += 1
        }
        let label = meses[mes] + ' ' + anio
        jQuery(vista.querySelector("#mes" + i + "Label")).append(label)
        mes += 1
    }
}

function validateForm() {
    let cant = vista.querySelector("#cantAplicacionesAgriculturaGastoDirecto")
    let checkboxes = vista.querySelectorAll('input[type=checkbox]')
    let cantCB = 0
    checkboxes.forEach(cb => {
        if (cb.checked) {
            cantCB += 1
        }
    });

    if(cantCB != 0){
        cant.value = cantCB
        return true
    } else {
        alert('Debe seleccionar al menos un mes de aplicación')
        return false
    }
}