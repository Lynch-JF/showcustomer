function obtenerTop3SacadoresRapidos() {
  fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(response => response.json())
    .then(data => {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const añoActual = ahora.getFullYear();

      const tiempos = {};

      // Función para convertir "0:02:41" a minutos decimales
      function tiempoAminutos(tiempoStr) {
        const partes = tiempoStr.split(":");
        if (partes.length !== 3) return NaN;

        const [h, m, s] = partes.map(n => parseInt(n));
        if (isNaN(h) || isNaN(m) || isNaN(s)) return NaN;

        return h * 60 + m + s / 60;
      }

      data.forEach((pedido, i) => {
        const horaFin = (pedido["HoraFin"] || pedido["HoraFin "] || "").trim();
        const sacador = (pedido["Sacador"] || pedido["Sacador "] || "").trim();
        const tiempoStr = (pedido["Tiempoitms"] || "").trim();

        const fechaFin = new Date(horaFin);
        const tiempoPorProducto = tiempoAminutos(tiempoStr);

        if (
          sacador &&
          !sacador.includes("/") &&
          !isNaN(fechaFin) &&
          fechaFin.getMonth() === mesActual &&
          fechaFin.getFullYear() === añoActual &&
          !isNaN(tiempoPorProducto)
        ) {
          if (!tiempos[sacador]) {
            tiempos[sacador] = { total: 0, count: 0 };
          }
          tiempos[sacador].total += tiempoPorProducto;
          tiempos[sacador].count += 1;
        }
      });

      const promedios = Object.entries(tiempos).map(([sacador, datos]) => ({
        sacador,
        promedio: datos.total / datos.count
      }));

      const top3 = promedios
        .sort((a, b) => a.promedio - b.promedio)
        .slice(0, 3);

      console.log("✅ Top 3 más rápidos:", top3);
      mostrarRankingRapidos(top3);
    })
    .catch(err => console.error("❌ Error al obtener ranking:", err));
}



function mostrarRankingRapidos(top3) {
  const medallas = ["🥇", "🥈", "🥉"];
  const container = document.getElementById("card-ranking");

 const lista = document.getElementById("lista-top-sacadores");
lista.innerHTML = top3.map((item, i) => `
  <li><span>${["🥇", "🥈", "🥉"][i] || ""}</span> <strong>${item.sacador}</strong>: ${item.promedio.toFixed(2)} min/prod</li>
`).join("");

}




function mostrarHistorialGanadores() {
  fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(res => res.json())
    .then(data => {
      const historial = {};

      data.forEach(pedido => {
        const fecha = new Date(pedido["HoraFin "]);
        if (isNaN(fecha)) return;

        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
        const claveMes = `${año}-${mes}`;
        const sacador = pedido["Sacador "].trim();

        if (!historial[claveMes]) historial[claveMes] = {};
        historial[claveMes][sacador] = (historial[claveMes][sacador] || 0) + 1;
      });

      const ganadores = Object.entries(historial).map(([mesClave, sacadores]) => {
        const [año, mes] = mesClave.split("-");
        const mesNombre = obtenerNombreMes(parseInt(mes));
        const [nombreGanador, cantidad] = Object.entries(sacadores)
          .sort((a, b) => b[1] - a[1])[0];

        return {
          mes: `${mesNombre} ${año}`,
          ganador: nombreGanador,
          cantidad
        };
      });

      renderizarHistorial(ganadores);
    })
    .catch(err => console.error("❌ Error al obtener historial:", err));
}

function toggleHistorial() {
  const historialDiv = document.getElementById("historial-ganadores");
  const icon = document.getElementById("toggle-icon");

  if (historialDiv.style.display === "none") {
    historialDiv.style.display = "block";
    icon.textContent = "▲";
  } else {
    historialDiv.style.display = "none";
    icon.textContent = "▼";
  }
}

function mostrarHistorialGanadores() {
  fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(res => res.json())
    .then(data => {
      const historial = {};

      data.forEach(pedido => {
        const fecha = new Date(pedido["HoraFin "]);
        if (isNaN(fecha)) return;

        const mes = fecha.getMonth();
        const año = fecha.getFullYear();
        const claveMes = `${año}-${mes}`;
        const sacador = pedido["Sacador "].trim();

        if (!historial[claveMes]) historial[claveMes] = {};
        historial[claveMes][sacador] = (historial[claveMes][sacador] || 0) + 1;
      });

      const ganadores = Object.entries(historial).map(([mesClave, sacadores]) => {
        const [año, mes] = mesClave.split("-");
        const mesNombre = obtenerNombreMes(parseInt(mes));
        const [nombreGanador, cantidad] = Object.entries(sacadores)
          .sort((a, b) => b[1] - a[1])[0];

        return {
          mes: `${mesNombre} ${año}`,
          ganador: nombreGanador,
          cantidad
        };
      });

      renderizarHistorial(ganadores);
    })
    .catch(err => console.error("❌ Error al obtener historial:", err));
}

function obtenerNombreMes(mes) {
  const nombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return nombres[mes] || "Desconocido";
}

function renderizarHistorial(ganadores) {
  const container = document.getElementById("historial-ganadores");

  if (!container) {
    console.warn("⚠️ Falta el contenedor #historial-ganadores");
    return;
  }

  container.innerHTML = `
    <ul class="historial-lista">
      ${ganadores
        .sort((a, b) => new Date(b.mes) - new Date(a.mes))
        .map(g => `
          <li><strong>${g.mes}</strong>: ${g.ganador} (${g.cantidad} pedidos)</li>
        `).join("")}
    </ul>
  `;
}

function mostrarSacadoresDelMes() {
  fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(res => res.json())
    .then(data => {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const añoActual = ahora.getFullYear();

      const sacadores = {};

      // Función para convertir 0:02:41 a minutos decimales
      function tiempoAminutos(str) {
        const partes = str.split(":");
        if (partes.length !== 3) return NaN;
        const [h, m, s] = partes.map(Number);
        return h * 60 + m + s / 60;
      }

      data.forEach(pedido => {
        const fechaStr = (pedido["HoraFin"] || pedido["HoraFin "] || "").trim();
        const fecha = new Date(fechaStr);
        if (isNaN(fecha)) return;

        if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
          const sacadorRaw = (pedido["Sacador"] || pedido["Sacador "] || "Desconocido").trim();

          // Filtrar equipos (contienen "/")
          if (sacadorRaw.includes("/")) return;

          const tiempoStr = (pedido["Tiempoitms"] || "").trim();
          const tiempoPorProducto = tiempoAminutos(tiempoStr);
          if (isNaN(tiempoPorProducto)) return;

          if (!sacadores[sacadorRaw]) {
            sacadores[sacadorRaw] = {
              totalPedidos: 0,
              sumaTiempos: 0,
              cantidadTiempos: 0,
            };
          }

          sacadores[sacadorRaw].totalPedidos++;
          sacadores[sacadorRaw].sumaTiempos += tiempoPorProducto;
          sacadores[sacadorRaw].cantidadTiempos++;
        }
      });

      const sacadoresArray = Object.entries(sacadores).map(([nombre, datos]) => ({
        nombre,
        totalPedidos: datos.totalPedidos,
        promedioTiempo: datos.sumaTiempos / datos.cantidadTiempos,
      }));

      sacadoresArray.sort((a, b) => a.promedioTiempo - b.promedioTiempo);

      document.getElementById("mes-actual").textContent = `${obtenerNombreMes(mesActual)} ${añoActual}`;

      const listaHTML = sacadoresArray.map(s => `
        <li>
          <strong>${s.nombre}</strong>: ${s.totalPedidos} pedido${s.totalPedidos !== 1 ? "s" : ""}, 
          promedio <em>${s.promedioTiempo.toFixed(2)} min/producto</em>
        </li>
      `).join("");

      document.getElementById("lista-sacadores").innerHTML = listaHTML;
    })
    .catch(err => console.error("❌ Error al cargar sacadores del mes:", err));
}

// Función toggle para desplegar la lista
function toggleListaSacadores() {
  const contenedor = document.getElementById("contenedor-sacadores");
  if (!contenedor) return;
  
  // Alterna el display entre none y block para hacer acordeón
  if (contenedor.style.display === "none" || contenedor.style.display === "") {
    contenedor.style.display = "block";
  } else {
    contenedor.style.display = "none";
  }
}

// Función para obtener nombre de mes
function obtenerNombreMes(mes) {
  const nombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return nombres[mes] || "Mes desconocido";
}

// Ejecutar para cargar la lista al inicio
mostrarSacadoresDelMes();



mostrarHistorialGanadores();
obtenerTop3SacadoresRapidos();
mostrarSacadoresDelMes();


let sacadoresArrayGlobal = []; // <- fuera de la función

function mostrarSacadoresDelMes() {
  fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(res => res.json())
    .then(data => {
      const ahora = new Date();
      const mesActual = ahora.getMonth();
      const añoActual = ahora.getFullYear();

      const sacadores = {};

      function tiempoAminutos(str) {
        const partes = str.split(":");
        if (partes.length !== 3) return NaN;
        const [h, m, s] = partes.map(Number);
        return h * 60 + m + s / 60;
      }

      data.forEach(pedido => {
        const fechaStr = (pedido["HoraFin"] || pedido["HoraFin "] || "").trim();
        const fecha = new Date(fechaStr);
        if (isNaN(fecha)) return;

        if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
          const sacadorRaw = (pedido["Sacador"] || pedido["Sacador "] || "Desconocido").trim();
          if (sacadorRaw.includes("/")) return;

          const tiempoStr = (pedido["Tiempoitms"] || "").trim();
          const tiempoPorProducto = tiempoAminutos(tiempoStr);
          if (isNaN(tiempoPorProducto)) return;

          if (!sacadores[sacadorRaw]) {
            sacadores[sacadorRaw] = {
              totalPedidos: 0,
              sumaTiempos: 0,
              cantidadTiempos: 0,
            };
          }

          sacadores[sacadorRaw].totalPedidos++;
          sacadores[sacadorRaw].sumaTiempos += tiempoPorProducto;
          sacadores[sacadorRaw].cantidadTiempos++;
        }
      });

      sacadoresArrayGlobal = Object.entries(sacadores).map(([nombre, datos]) => ({
        Sacador: nombre,
        "Pedidos Realizados": datos.totalPedidos,
        "Promedio Tiempo (min)": parseFloat((datos.sumaTiempos / datos.cantidadTiempos).toFixed(2))
      }));

      sacadoresArrayGlobal.sort((a, b) => a["Promedio Tiempo (min)"] - b["Promedio Tiempo (min)"]);

      document.getElementById("mes-actual").textContent = `${obtenerNombreMes(mesActual)} ${añoActual}`;

      const listaHTML = sacadoresArrayGlobal.map(s => `
        <li>
          <strong>${s.Sacador}</strong>: ${s["Pedidos Realizados"]} pedido${s["Pedidos Realizados"] !== 1 ? "s" : ""}, 
          promedio <em>${s["Promedio Tiempo (min)"]} min/producto</em>
        </li>
      `).join("");

      document.getElementById("lista-sacadores").innerHTML = listaHTML;
    })
    .catch(err => console.error("❌ Error al cargar sacadores del mes:", err));
}

 const API_SHEET = "https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd";

  document.getElementById("filtro-fecha").addEventListener("change", function() {
    const valor = this.value;
    filtrarPedidos(valor);
  });

  function filtrarPedidos(rango) {
    if (rango === "ningun") {
      renderizarTablaResumenSacadores([]);
      document.getElementById("mensaje").textContent = "Seleccione una opción para ver los datos.";
      return;
    } else {
      document.getElementById("mensaje").textContent = "";
    }

    fetch(API_SHEET)
      .then(res => res.json())
      .then(data => {
        const ahora = new Date();

        function tiempoAminutos(tiempoStr) {
          if (!tiempoStr) return NaN;
          const partes = tiempoStr.split(":");
          if (partes.length !== 3) return NaN;
          const [h, m, s] = partes.map(Number);
          return h * 60 + m + s / 60;
        }

        function esMismaFecha(f1, f2) {
          return f1.getFullYear() === f2.getFullYear() &&
                 f1.getMonth() === f2.getMonth() &&
                 f1.getDate() === f2.getDate();
        }

        function estaMismaSemana(fecha, referencia) {
          const diaSemana = referencia.getDay();
          const inicio = new Date(referencia);
          inicio.setDate(referencia.getDate() - diaSemana);
          inicio.setHours(0,0,0,0);
          const fin = new Date(inicio);
          fin.setDate(inicio.getDate() + 6);
          fin.setHours(23,59,59,999);
          return fecha >= inicio && fecha <= fin;
        }

        const pedidosFiltrados = data.filter(pedido => {
          const fechaStr = (pedido["HoraFin "] || pedido["HoraFin"] || "").trim();
          const fecha = new Date(fechaStr);
          if (isNaN(fecha)) return false;

          switch (rango) {
            case "hoy": return esMismaFecha(fecha, ahora);
            case "ayer": {
              const ayer = new Date(ahora);
              ayer.setDate(ahora.getDate() - 1);
              return esMismaFecha(fecha, ayer);
            }
            case "semana": return estaMismaSemana(fecha, ahora);
            case "mes": return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
            case "todos": return true;
            default: return false;
          }
        });

        const sacadoresMap = {};

        pedidosFiltrados.forEach(pedido => {
          const sacador = (pedido["Sacador "] || pedido["Sacador"] || "Sin nombre").trim();
          const cantidad = parseInt(pedido["CantidadProductos "] || pedido["CantidadProductos"] || "0", 10);
          const tiempoStr = (pedido["Tiempoitms "] || pedido["Tiempoitms"] || "").trim();
          const tiempoPorProducto = tiempoAminutos(tiempoStr);

          if (!sacadoresMap[sacador]) {
            sacadoresMap[sacador] = {
              totalProductos: 0,
              totalPedidos: 0,
              sumaTiempos: 0,
              cantidadTiempos: 0
            };
          }

          sacadoresMap[sacador].totalProductos += cantidad;
          sacadoresMap[sacador].totalPedidos++;
          if (!isNaN(tiempoPorProducto)) {
            sacadoresMap[sacador].sumaTiempos += tiempoPorProducto;
            sacadoresMap[sacador].cantidadTiempos++;
          }
        });

        const resumenSacadores = Object.entries(sacadoresMap).map(([sacador, datos]) => ({
          sacador,
          totalProductos: datos.totalProductos,
          totalPedidos: datos.totalPedidos,
          promedioTiempo: datos.cantidadTiempos > 0 ? (datos.sumaTiempos / datos.cantidadTiempos) : 0
        }));

        resumenSacadores.sort((a, b) => a.promedioTiempo - b.promedioTiempo);

        renderizarTablaResumenSacadores(resumenSacadores);
      })
      .catch(err => {
        console.error("❌ Error al filtrar pedidos:", err);
        document.getElementById("mensaje").textContent = "Error al cargar los datos.";
      });
  }

  function renderizarTablaResumenSacadores(resumen) {
    const tbody = document.querySelector("#tabla-pedidos-filtrados tbody");
    if (!tbody) return;

    if (resumen.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No se encontraron datos.</td></tr>`;
      return;
    }

    tbody.innerHTML = resumen.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.sacador}</td>
        <td>${item.totalProductos}</td>
        <td>${item.totalPedidos}</td>
        <td>${item.promedioTiempo.toFixed(2)} min/producto</td>
      </tr>
    `).join("");
  }

  // Inicialmente no muestra nada ni error
  renderizarTablaResumenSacadores([]);
  document.getElementById("mensaje").textContent = "Seleccione una opción para ver los datos.";

  // Función que filtra y retorna los pedidos según rango, sin renderizar tabla
function obtenerPedidosFiltrados(rango) {
  return fetch("https://api.sheetbest.com/sheets/3e63ab90-8471-42e0-8f80-b4c67b419fcd")
    .then(res => res.json())
    .then(data => {
      const ahora = new Date();

      const pedidosFiltrados = data.filter(pedido => {
        const fechaStr = (pedido["HoraFin "] || pedido["HoraFin"] || "").trim();
        const fecha = new Date(fechaStr);
        if (isNaN(fecha)) return false;

        switch (rango) {
          case "hoy": return esMismaFecha(fecha, ahora);
          case "ayer": {
            const ayer = new Date(ahora);
            ayer.setDate(ahora.getDate() - 1);
            return esMismaFecha(fecha, ayer);
          }
          case "semana": return estaMismaSemana(fecha, ahora);
          case "mes": return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
          case "todos": return true;
          default: return false;
        }
      });

      return pedidosFiltrados;
    });
}

// Función que filtra y renderiza tabla, llamada desde fuera
function filtrarPedidos(rango) {
  obtenerPedidosFiltrados(rango)
    .then(pedidosFiltrados => {
      // Lógica para agrupar y renderizar tabla
      const sacadoresMap = {};

      function tiempoAminutos(tiempoStr) {
        if (!tiempoStr) return NaN;
        const partes = tiempoStr.split(":");
        if (partes.length !== 3) return NaN;
        const [h, m, s] = partes.map(Number);
        return h * 60 + m + s / 60;
      }

      pedidosFiltrados.forEach(pedido => {
        const sacador = (pedido["Sacador "] || pedido["Sacador"] || "").trim() || "Sin nombre";
        const cantidad = parseInt(pedido["CantidadProductos "] || pedido["CantidadProductos"] || "0", 10);
        const tiempoStr = (pedido["Tiempoitms "] || pedido["Tiempoitms"] || "").trim();
        const tiempoPorProducto = tiempoAminutos(tiempoStr);

        if (!sacadoresMap[sacador]) {
          sacadoresMap[sacador] = {
            totalProductos: 0,
            totalPedidos: 0,
            sumaTiempos: 0,
            cantidadTiempos: 0
          };
        }

        sacadoresMap[sacador].totalProductos += cantidad;
        sacadoresMap[sacador].totalPedidos++;
        if (!isNaN(tiempoPorProducto)) {
          sacadoresMap[sacador].sumaTiempos += tiempoPorProducto;
          sacadoresMap[sacador].cantidadTiempos++;
        }
      });

      const resumenSacadores = Object.entries(sacadoresMap).map(([sacador, datos]) => ({
        sacador,
        totalProductos: datos.totalProductos,
        totalPedidos: datos.totalPedidos,
        promedioTiempo: datos.cantidadTiempos > 0 ? (datos.sumaTiempos / datos.cantidadTiempos) : 0
      }));

      resumenSacadores.sort((a, b) => a.promedioTiempo - b.promedioTiempo);

      renderizarTablaResumenSacadores(resumenSacadores);

      // Llamar función para actualizar conteo de pedidos
      actualizarConteoPedidos(pedidosFiltrados.length);
    })
    .catch(err => {
      console.error("❌ Error al filtrar pedidos:", err);
      renderizarTablaResumenSacadores([]);
      actualizarConteoPedidos(0);
    });
}

// Función que solo actualiza el conteo en el div
function actualizarConteoPedidos(totalPedidos) {
  const conteoDiv = document.getElementById("conteo-pedidos");
  if (conteoDiv) {
    conteoDiv.textContent = `📦 Total de pedidos en este periodo: ${totalPedidos}`;
  }
}

// Función para renderizar tabla (igual que antes)
function renderizarTablaResumenSacadores(resumen) {
  const tbody = document.querySelector("#tabla-pedidos-filtrados tbody");
  if (!tbody) return;

  if (resumen.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No se encontraron datos.</td></tr>`;
    return;
  }

  tbody.innerHTML = resumen.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.sacador}</td>
      <td>${item.totalProductos}</td>
      <td>${item.totalPedidos}</td>
      <td>${item.promedioTiempo.toFixed(2)} min/producto</td>
    </tr>
  `).join("");
}

// Funciones auxiliares para fechas
function esMismaFecha(f1, f2) {
  return f1.getFullYear() === f2.getFullYear() &&
         f1.getMonth() === f2.getMonth() &&
         f1.getDate() === f2.getDate();
}

function estaMismaSemana(fecha, referencia) {
  const diaSemana = referencia.getDay();
  const inicio = new Date(referencia);
  inicio.setDate(referencia.getDate() - diaSemana);
  inicio.setHours(0,0,0,0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23,59,59,999);

  return fecha >= inicio && fecha <= fin;
}
