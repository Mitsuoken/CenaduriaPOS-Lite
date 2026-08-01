/* ============================================================
   CenaduriaPOS Lite - app.js
   Lógica completa: cuentas, carrito, cobro e historial
   Todo se guarda en localStorage (sin base de datos)
   ============================================================ */

/* ---------------- MENÚ DE PRODUCTOS ---------------- */
const productos = [
  // Antojitos
  { id: 1, categoria: "Antojitos", nombre: "Pozole Grande", precio: 90 },
  { id: 2, categoria: "Antojitos", nombre: "Pozole Chico", precio: 70 },
  { id: 3, categoria: "Antojitos", nombre: "Gordita Sencilla", precio: 30 },
  { id: 4, categoria: "Antojitos", nombre: "Gordita Doble", precio: 35 },
  { id: 5, categoria: "Antojitos", nombre: "Quesadilla Sencilla", precio: 30 },
  { id: 6, categoria: "Antojitos", nombre: "Quesadilla Doble", precio: 35 },
  { id: 7, categoria: "Antojitos", nombre: "Pambazo Sencillo", precio: 35 },
  { id: 8, categoria: "Antojitos", nombre: "Pambazo Doble", precio: 40 },
  { id: 9, categoria: "Antojitos", nombre: "Tostada Sencilla", precio: 35 },
  { id: 10, categoria: "Antojitos", nombre: "Tostada Doble", precio: 40 },
  { id: 11, categoria: "Antojitos", nombre: "Tacos Dorados", precio: 35 },
  // Bebidas
  { id: 12, categoria: "Bebidas", nombre: "Agua Jamaica 1/2 litro", precio: 20 },
  { id: 13, categoria: "Bebidas", nombre: "Agua Jamaica 1 litro", precio: 35 },
  { id: 14, categoria: "Bebidas", nombre: "Peñafiel", precio: 30 },
  { id: 15, categoria: "Bebidas", nombre: "Coca Cola", precio: 35 },
  { id: 16, categoria: "Bebidas", nombre: "Aditas", precio: 20 },
  { id: 17, categoria: "Bebidas", nombre: "Coca Chaparrita", precio: 25 },
   { id: 18, categoria: "Bebidas", nombre: "Jugo Boing", precio: 25 },
  { id: 19, categoria: "Bebidas", nombre: "Jarritos 2 litros", precio: 40 },
  { id: 20, categoria: "Bebidas", nombre: "Adotas 2 litros", precio: 50 },
  { id: 21, categoria: "Bebidas", nombre: "Coca Cola 2 litros", precio: 60 },
  { id: 22, categoria: "Bebidas", nombre: "Coca Cola 3 litros", precio: 70 },
];

/* Lista fija de cuentas disponibles */
const CUENTAS = [
  { clave: "mesa1", nombre: "Mesa 1" },
  { clave: "mesa2", nombre: "Mesa 2" },
  { clave: "mesa3", nombre: "Mesa 3" },
  { clave: "mesa4", nombre: "Mesa 4" },
  { clave: "mesa5", nombre: "Mesa 5" },
  { clave: "llevar1", nombre: "Para llevar 1" },
  { clave: "llevar2", nombre: "Para llevar 2" },
  { clave: "llevar3", nombre: "Para llevar 3" },
];

/* ---------------- UTILIDADES DE ALMACENAMIENTO ---------------- */

// Devuelve el carrito guardado de una cuenta (o arreglo vacío)
function obtenerCarrito(cuenta) {
  const datos = localStorage.getItem("carrito_" + cuenta);
  return datos ? JSON.parse(datos) : [];
}

// Guarda el carrito de una cuenta
function guardarCarrito(cuenta, carrito) {
  localStorage.setItem("carrito_" + cuenta, JSON.stringify(carrito));
}

// Vacía el carrito de una cuenta
function vaciarCarrito(cuenta) {
  localStorage.removeItem("carrito_" + cuenta);
}

// Historial completo de ventas
function obtenerHistorial() {
  const datos = localStorage.getItem("historialVentas");
  return datos ? JSON.parse(datos) : [];
}

function guardarHistorial(historial) {
  localStorage.setItem("historialVentas", JSON.stringify(historial));
}

/* ================================================================
   PANTALLA PRINCIPAL (index.html)
   ================================================================ */

function abrirCuenta(cuenta) {
  localStorage.setItem("cuentaActual", cuenta);
  window.location.href = "mesa.html";
}

// Pinta los botones de cuentas mostrando si tienen pedido pendiente
function pintarCuentas() {
  const contMesas = document.getElementById("listaMesas");
  const contLlevar = document.getElementById("listaLlevar");
  if (!contMesas || !contLlevar) return; // no estamos en index.html

  contMesas.innerHTML = "";
  contLlevar.innerHTML = "";

  CUENTAS.forEach((c) => {
    const carrito = obtenerCarrito(c.clave);
    const ocupada = carrito.length > 0;
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    const esMesa = c.clave.startsWith("mesa");

    const btn = document.createElement("button");
    btn.className = "btn-cuenta" + (ocupada ? " ocupada" : "");
    btn.onclick = () => abrirCuenta(c.clave);

    btn.innerHTML = `
      ${esMesa ? "🍽" : "🛍"} ${c.nombre}
      ${ocupada ? `<span class="estado">$${total}</span>` : `<span class="estado">Libre</span>`}
    `;

    (esMesa ? contMesas : contLlevar).appendChild(btn);
  });
}

/* ================================================================
   PANTALLA DE MESA / PEDIDO (mesa.html)
   ================================================================ */

let cuentaActual = null;
let carrito = [];

// Se llama al cargar mesa.html
function iniciarMesa() {
  cuentaActual = localStorage.getItem("cuentaActual");

  if (!cuentaActual) {
    window.location.href = "index.html";
    return;
  }

  carrito = obtenerCarrito(cuentaActual);

  const nombreCuenta = CUENTAS.find((c) => c.clave === cuentaActual);
  const titulo = document.getElementById("nombreCuenta");
  if (titulo) titulo.textContent = nombreCuenta ? nombreCuenta.nombre : cuentaActual;

  mostrarProductos();
  actualizarCarrito();
}

// Genera los botones del menú agrupados por categoría
function mostrarProductos() {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  let categoriaActual = "";

  productos.forEach((producto) => {
    if (producto.categoria !== categoriaActual) {
      categoriaActual = producto.categoria;
      const titulo = document.createElement("div");
      titulo.className = "categoria";
      titulo.style.gridColumn = "1 / -1";
      titulo.textContent = categoriaActual;
      contenedor.appendChild(titulo);
    }

    const btn = document.createElement("button");
    btn.onclick = () => agregarProducto(producto.id);
    btn.innerHTML = `${producto.nombre}<span class="precio">$${producto.precio}</span>`;
    contenedor.appendChild(btn);
  });
}

// Agrega un producto al carrito (o aumenta su cantidad si ya existe)
function agregarProducto(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  const item = carrito.find((p) => p.id === id);

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
  }

  guardarCarrito(cuentaActual, carrito);
  actualizarCarrito();
  mostrarToast(`${producto.nombre} agregado`);
}

// Aumenta/disminuye cantidad de un item ya en el carrito
function cambiarCantidad(id, delta) {
  const item = carrito.find((p) => p.id === id);
  if (!item) return;

  item.cantidad += delta;

  if (item.cantidad <= 0) {
    carrito = carrito.filter((p) => p.id !== id);
  }

  guardarCarrito(cuentaActual, carrito);
  actualizarCarrito();
}

// Elimina un item completamente
function eliminarProducto(id) {
  carrito = carrito.filter((p) => p.id !== id);
  guardarCarrito(cuentaActual, carrito);
  actualizarCarrito();
}

// Dibuja el carrito y el total
function actualizarCarrito() {
  const cont = document.getElementById("carrito");
  const totalEl = document.getElementById("total");
  if (!cont || !totalEl) return;

  cont.innerHTML = "";

  if (carrito.length === 0) {
    cont.innerHTML = `<div class="carrito-vacio">Aún no hay productos en esta cuenta</div>`;
    totalEl.textContent = "$0";
    return;
  }

  let total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("div");
    fila.className = "fila-carrito";
    fila.innerHTML = `
      <div class="info-item">
        <div class="nombre">${item.nombre}</div>
        <div class="subtotal">$${item.precio} x ${item.cantidad} = $${subtotal}</div>
      </div>
      <div class="controles-cantidad">
        <button class="quitar" onclick="cambiarCantidad(${item.id}, -1)">−</button>
        <span>${item.cantidad}</span>
        <button class="sumar" onclick="cambiarCantidad(${item.id}, 1)">+</button>
      </div>
    `;
    cont.appendChild(fila);
  });

  totalEl.textContent = "$" + total;
}

// Cobra la cuenta: guarda venta en historial y vacía la mesa
function cobrarCuenta() {
  if (carrito.length === 0) {
    mostrarToast("No hay productos que cobrar");
    return;
  }

  const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const nombreCuenta = CUENTAS.find((c) => c.clave === cuentaActual);
  const ahora = new Date();

  const venta = {
    cuenta: nombreCuenta ? nombreCuenta.nombre : cuentaActual,
    claveCuenta: cuentaActual,
    productos: carrito.map((p) => ({ ...p })),
    total: total,
    fecha: ahora.toLocaleDateString("es-MX"),
    hora: ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    timestamp: ahora.getTime(),
  };

  const historial = obtenerHistorial();
  historial.push(venta);
  guardarHistorial(historial);

  carrito = [];
  vaciarCarrito(cuentaActual);
  actualizarCarrito();

  mostrarToast("Cuenta cobrada: $" + total);

  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

// Cancela el pedido actual sin cobrar (vacía la mesa)
function cancelarCuenta() {
  if (carrito.length === 0) {
    window.location.href = "index.html";
    return;
  }

  const confirmar = confirm("¿Seguro que quieres cancelar y vaciar esta cuenta?");
  if (!confirmar) return;

  carrito = [];
  vaciarCarrito(cuentaActual);
  actualizarCarrito();
  window.location.href = "index.html";
}

/* ================================================================
   HISTORIAL (historial.html)
   ================================================================ */

function pintarHistorial() {
  const cont = document.getElementById("listaHistorial");
  if (!cont) return;

  const historial = obtenerHistorial().slice().reverse(); // más reciente primero

  if (historial.length === 0) {
    cont.innerHTML = `<div class="vacio">Aún no hay ventas registradas</div>`;
    return;
  }

  // Agrupar por fecha
  const grupos = {};
  historial.forEach((venta) => {
    if (!grupos[venta.fecha]) grupos[venta.fecha] = [];
    grupos[venta.fecha].push(venta);
  });

  cont.innerHTML = "";

  Object.keys(grupos).forEach((fecha) => {
    const ventasDia = grupos[fecha];
    const totalDia = ventasDia.reduce((s, v) => s + v.total, 0);

    const tituloDia = document.createElement("div");
    tituloDia.className = "dia-historial";
    tituloDia.textContent = fecha;
    cont.appendChild(tituloDia);

    ventasDia.forEach((venta) => {
      const detalle = venta.productos
        .map((p) => `${p.nombre} x${p.cantidad}`)
        .join(", ");

      const item = document.createElement("div");
      item.className = "venta-item";
      item.innerHTML = `
        <div class="cabecera">
          <span>${venta.cuenta}</span>
          <span>$${venta.total} <span class="hora">${venta.hora}</span></span>
        </div>
        <div class="detalle">${detalle}</div>
      `;
      cont.appendChild(item);
    });

    const resumen = document.createElement("div");
    resumen.className = "resumen-dia";
    resumen.innerHTML = `<span>Total del día</span><span>$${totalDia}</span>`;
    cont.appendChild(resumen);
  });
}

// Borra todo el historial (con confirmación)
function limpiarHistorial() {
  const confirmar = confirm("Esto borrará todas las ventas guardadas. ¿Continuar?");
  if (!confirmar) return;

  localStorage.removeItem("historialVentas");
  pintarHistorial();
  mostrarToast("Historial borrado");
}

/* ================================================================
   UTILIDAD: TOAST (aviso flotante)
   ================================================================ */

function mostrarToast(mensaje) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = mensaje;
  toast.classList.add("mostrar");

  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 1800);
}

/* ================================================================
   REGISTRO DEL SERVICE WORKER (PWA)
   ================================================================ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.log("No se pudo registrar el service worker:", err);
    });
  });
}
