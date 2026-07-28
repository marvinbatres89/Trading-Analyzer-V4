/*
  Trading Analyzer V4
  Archivo: app.js

  Funciones de esta etapa:
  - Inicializar la interfaz.
  - Controlar botones y selectores.
  - Mostrar diagnósticos.
  - Preparar la aplicación para integrar Deriv en el siguiente módulo.
*/

const elementos = {
  estadoConexion: document.getElementById("estadoConexion"),
  textoEstado: document.getElementById("textoEstado"),

  botonConectar: document.getElementById("botonConectar"),
  botonDesconectar: document.getElementById("botonDesconectar"),
  botonIniciar: document.getElementById("botonIniciar"),

  selectorMercado: document.getElementById("selectorMercado"),
  selectorTemporalidad: document.getElementById("selectorTemporalidad"),
  selectorEstrategia: document.getElementById("selectorEstrategia"),

  estadoDatos: document.getElementById("estadoDatos"),
  precioActual: document.getElementById("precioActual"),
  nombreMercado: document.getElementById("nombreMercado"),
  ultimoMovimiento: document.getElementById("ultimoMovimiento"),
  contadorTicks: document.getElementById("contadorTicks"),
  horaUltimoTick: document.getElementById("horaUltimoTick"),

  valorRSI: document.getElementById("valorRSI"),
  estadoRSI: document.getElementById("estadoRSI"),
  valorEMARapida: document.getElementById("valorEMARapida"),
  valorEMALenta: document.getElementById("valorEMALenta"),
  valorMACD: document.getElementById("valorMACD"),
  estadoMACD: document.getElementById("estadoMACD"),
  valorVolatilidad: document.getElementById("valorVolatilidad"),
  estadoVolatilidad: document.getElementById("estadoVolatilidad"),
  valorTendencia: document.getElementById("valorTendencia"),
  estadoTendencia: document.getElementById("estadoTendencia"),

  contenedorSenal: document.getElementById("contenedorSenal"),
  tipoSenal: document.getElementById("tipoSenal"),
  porcentajeConfianza: document.getElementById("porcentajeConfianza"),
  rellenoConfianza: document.getElementById("rellenoConfianza"),
  listaRazones: document.getElementById("listaRazones"),

  historialSenales: document.getElementById("historialSenales"),
  botonLimpiarHistorial: document.getElementById("botonLimpiarHistorial"),

  diagnostico: document.getElementById("diagnostico"),
  botonLimpiarDiagnostico: document.getElementById("botonLimpiarDiagnostico")
};

const estadoAplicacion = {
  conectado: false,
  analizando: false,
  mercado: "",
  temporalidad: "60",
  estrategia: "tendencia",
  ticks: [],
  historial: []
};

function obtenerHoraActual() {
  return new Date().toLocaleTimeString("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function registrarDiagnostico(mensaje, tipo = "normal") {
  if (!elementos.diagnostico) {
    return;
  }

  const linea = document.createElement("p");

  if (tipo === "error") {
    linea.classList.add("error");
  }

  if (tipo === "advertencia") {
    linea.classList.add("advertencia");
  }

  linea.textContent = `[${obtenerHoraActual()}] ${mensaje}`;

  elementos.diagnostico.appendChild(linea);
  elementos.diagnostico.scrollTop = elementos.diagnostico.scrollHeight;
}

function cambiarEstadoConexion(estado, texto) {
  elementos.estadoConexion.classList.remove(
    "desconectado",
    "conectando",
    "conectado",
    "error"
  );

  elementos.estadoConexion.classList.add(estado);
  elementos.textoEstado.textContent = texto;
}

function activarControlesMercado(activar) {
  elementos.selectorMercado.disabled = !activar;
  elementos.selectorTemporalidad.disabled = !activar;
  elementos.selectorEstrategia.disabled = !activar;

  actualizarBotonIniciar();
}

function actualizarBotonIniciar() {
  const mercadoSeleccionado = Boolean(elementos.selectorMercado.value);

  elementos.botonIniciar.disabled =
    !estadoAplicacion.conectado || !mercadoSeleccionado;
}

function actualizarNombreMercado() {
  const opcionSeleccionada =
    elementos.selectorMercado.options[
      elementos.selectorMercado.selectedIndex
    ];

  if (!opcionSeleccionada || !opcionSeleccionada.value) {
    elementos.nombreMercado.textContent =
      "Ningún mercado seleccionado";

    estadoAplicacion.mercado = "";
    actualizarBotonIniciar();
    return;
  }

  estadoAplicacion.mercado = opcionSeleccionada.value;
  elementos.nombreMercado.textContent =
    opcionSeleccionada.textContent.trim();

  registrarDiagnostico(
    `Mercado seleccionado: ${opcionSeleccionada.textContent.trim()}`
  );

  actualizarBotonIniciar();
}

function limpiarDatosMercado() {
  estadoAplicacion.ticks = [];

  elementos.estadoDatos.textContent = "Sin datos";
  elementos.estadoDatos.classList.remove("activo");

  elementos.precioActual.textContent = "--.--";
  elementos.precioActual.classList.remove("subiendo", "bajando");

  elementos.ultimoMovimiento.textContent = "--";
  elementos.ultimoMovimiento.classList.remove("subiendo", "bajando");

  elementos.contadorTicks.textContent = "0";
  elementos.horaUltimoTick.textContent = "--";

  elementos.valorRSI.textContent = "--";
  elementos.estadoRSI.textContent = "Esperando datos";

  elementos.valorEMARapida.textContent = "--";
  elementos.valorEMALenta.textContent = "--";

  elementos.valorMACD.textContent = "--";
  elementos.estadoMACD.textContent = "Esperando datos";

  elementos.valorVolatilidad.textContent = "--";
  elementos.estadoVolatilidad.textContent = "Esperando datos";

  elementos.valorTendencia.textContent = "--";
  elementos.estadoTendencia.textContent = "Esperando datos";
}

function reiniciarSenal() {
  elementos.contenedorSenal.classList.remove(
    "compra",
    "venta",
    "senal-espera"
  );

  elementos.contenedorSenal.classList.add("neutral");

  elementos.tipoSenal.textContent = "ESPERANDO ANÁLISIS";
  elementos.porcentajeConfianza.textContent = "0%";
  elementos.rellenoConfianza.style.width = "0%";

  elementos.listaRazones.innerHTML = `
    <li>Conecta la aplicación y selecciona un mercado.</li>
  `;
}

function simularConexionTemporal() {
  if (estadoAplicacion.conectado) {
    registrarDiagnostico(
      "La aplicación ya aparece como conectada.",
      "advertencia"
    );
    return;
  }

  cambiarEstadoConexion("conectando", "Conectando...");
  elementos.botonConectar.disabled = true;

  registrarDiagnostico("Solicitando conexión con Deriv...");
  registrarDiagnostico(
    "Módulo de conexión todavía pendiente de integrar.",
    "advertencia"
  );

  setTimeout(() => {
    estadoAplicacion.conectado = true;

    cambiarEstadoConexion("conectado", "Interfaz preparada");

    elementos.botonConectar.disabled = true;
    elementos.botonDesconectar.disabled = false;

    activarControlesMercado(true);

    registrarDiagnostico(
      "Interfaz conectada en modo de preparación."
    );

    registrarDiagnostico(
      "El siguiente archivo añadirá la conexión real con Deriv."
    );
  }, 700);
}

function desconectarAplicacion() {
  estadoAplicacion.conectado = false;
  estadoAplicacion.analizando = false;

  cambiarEstadoConexion("desconectado", "Desconectado");

  elementos.botonConectar.disabled = false;
  elementos.botonDesconectar.disabled = true;
  elementos.botonIniciar.textContent = "Iniciar análisis";

  activarControlesMercado(false);
  limpiarDatosMercado();
  reiniciarSenal();

  registrarDiagnostico("Aplicación desconectada.");
}

function alternarAnalisis() {
  if (!estadoAplicacion.conectado) {
    registrarDiagnostico(
      "No puedes iniciar el análisis sin conexión.",
      "error"
    );
    return;
  }

  if (!estadoAplicacion.mercado) {
    registrarDiagnostico(
      "Selecciona un mercado antes de iniciar.",
      "advertencia"
    );
    return;
  }

  estadoAplicacion.analizando = !estadoAplicacion.analizando;

  if (estadoAplicacion.analizando) {
    elementos.botonIniciar.textContent = "Detener análisis";
    elementos.estadoDatos.textContent = "Preparando datos";
    elementos.estadoDatos.classList.add("activo");

    registrarDiagnostico(
      `Análisis preparado para ${elementos.nombreMercado.textContent}.`
    );

    registrarDiagnostico(
      `Temporalidad: ${estadoAplicacion.temporalidad} segundos.`
    );

    registrarDiagnostico(
      `Estrategia: ${estadoAplicacion.estrategia}.`
    );

    registrarDiagnostico(
      "Aún no se reciben precios reales. Falta integrar deriv-api.js.",
      "advertencia"
    );
  } else {
    elementos.botonIniciar.textContent = "Iniciar análisis";
    elementos.estadoDatos.textContent = "Análisis detenido";
    elementos.estadoDatos.classList.remove("activo");

    registrarDiagnostico("Análisis detenido por el usuario.");
  }
}

function limpiarHistorial() {
  estadoAplicacion.historial = [];

  elementos.historialSenales.className = "historial-vacio";
  elementos.historialSenales.textContent =
    "Todavía no se han generado señales.";

  registrarDiagnostico("Historial de señales limpiado.");
}

function limpiarDiagnostico() {
  elementos.diagnostico.innerHTML = "";

  registrarDiagnostico("Diagnóstico limpiado.");
}

function registrarEventos() {
  elementos.botonConectar.addEventListener(
    "click",
    simularConexionTemporal
  );

  elementos.botonDesconectar.addEventListener(
    "click",
    desconectarAplicacion
  );

  elementos.selectorMercado.addEventListener(
    "change",
    actualizarNombreMercado
  );

  elementos.selectorTemporalidad.addEventListener("change", (evento) => {
    estadoAplicacion.temporalidad = evento.target.value;

    registrarDiagnostico(
      `Temporalidad cambiada a ${evento.target.value} segundos.`
    );
  });

  elementos.selectorEstrategia.addEventListener("change", (evento) => {
    estadoAplicacion.estrategia = evento.target.value;

    registrarDiagnostico(
      `Estrategia seleccionada: ${evento.target.value}.`
    );
  });

  elementos.botonIniciar.addEventListener(
    "click",
    alternarAnalisis
  );

  elementos.botonLimpiarHistorial.addEventListener(
    "click",
    limpiarHistorial
  );

  elementos.botonLimpiarDiagnostico.addEventListener(
    "click",
    limpiarDiagnostico
  );
}

function comprobarElementos() {
  const elementosFaltantes = Object.entries(elementos)
    .filter(([, elemento]) => !elemento)
    .map(([nombre]) => nombre);

  if (elementosFaltantes.length > 0) {
    console.error(
      "Faltan elementos HTML:",
      elementosFaltantes
    );

    return false;
  }

  return true;
}

function iniciarAplicacion() {
  if (!comprobarElementos()) {
    return;
  }

  registrarEventos();

  cambiarEstadoConexion(
    "desconectado",
    "Desconectado"
  );

  activarControlesMercado(false);
  limpiarDatosMercado();
  reiniciarSenal();

  registrarDiagnostico("Trading Analyzer V4 iniciado.");
  registrarDiagnostico("Módulos visuales cargados correctamente.");
  registrarDiagnostico(
    "Pulsa “Conectar con Deriv” para probar la interfaz."
  );
}

document.addEventListener(
  "DOMContentLoaded",
  iniciarAplicacion
);
