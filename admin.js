import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
  // Limpieza inicial (esto no afecta estilos)
  sessionStorage.removeItem('firebase:authUser');
  localStorage.removeItem('firebase:authUser');

  // Configuración de Firebase (original)
  const firebaseConfig = {
    apiKey: "AIzaSyD-P5-GOlwT-Ax51u3giJm1G-oXmfOf9-g",
    authDomain: "tabymakeup-of.firebaseapp.com",
    projectId: "tabymakeup-of",
    storageBucket: "tabymakeup-of.appspot.com",
    messagingSenderId: "548834143470",
    appId: "1:548834143470:web:54812e64324b3629f617ff"
  };

  // Inicializar Firebase (original)
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Control de inactividad (nueva funcionalidad)
  let inactivityTimer;
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      signOut(auth).then(() => {
        window.location.href = `login.html?timeout=1&t=${Date.now()}`;
      });
    },  600000); 
  }

  // Eventos para resetear timer (sin afectar estilos)
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });

  // Verificación de autenticación (mejorada pero manteniendo tu flujo)
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.removeItem('firebase:authUser');
      sessionStorage.removeItem('firebase:authUser');
      window.location.href = `login.html?session_expired=1&t=${Date.now()}`;
    }
  });

  // Referencias DOM (ORIGINALES - manteniendo tus clases CSS)
  const formProducto = document.getElementById('form-producto');
  const cuerpoProductos = document.getElementById('cuerpo-productos');
  const formTitle = document.getElementById('form-title');
  const cancelarEdicion = document.getElementById('cancelar-edicion');
  const tonosContainer = document.getElementById('tonos-container');
  const agregarTonoBtn = document.getElementById('agregar-tono');
  const imagenInput = document.getElementById('imagen');
  const imagenPreview = document.getElementById('imagen-preview');
  const modalProducto = document.getElementById('modal-producto');
  const agregarProductoBtn = document.getElementById('agregar-producto-btn');
  const modalClose = document.querySelector('.modal-close');
  const tableSearch = document.getElementById('table-search');
  const logoutBtn = document.getElementById('logout-btn');
  const modalImagenAmpliada = document.getElementById('modal-imagen-ampliada');
  const imagenAmpliada = document.getElementById('imagen-ampliada');
  const modalImagenClose = document.querySelector('.modal-imagen-close');
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  const confirmModal = document.getElementById('logoutConfirmModal');
  const confirmBtn = document.getElementById('confirmLogout');
  const cancelBtn = document.getElementById('cancelLogout');

  // Variables de estado (originales)
  let editando = false;
  let productoId = null;
  let productos = [];
  let lastScrollTop = 0;

  // Inicialización de modales (original)
  modalImagenAmpliada.style.display = 'none';

  // Función de confirmación (ORIGINAL manteniendo tus estilos)
  function showConfirmModal(title, message, confirmText, onConfirm) {
    confirmModal.querySelector('h3').textContent = title;
    confirmModal.querySelector('p').textContent = message;
    confirmBtn.textContent = confirmText;
    
    confirmBtn.onclick = async () => {
      try {
        await onConfirm();
      } finally {
        confirmModal.style.display = 'none';
      }
    };
    
    cancelBtn.onclick = () => {
      confirmModal.style.display = 'none';
    };
    
    confirmModal.style.display = 'flex';
  }

  // Cerrar sesión (ORIGINAL con clases CSS correctas)
  logoutBtn.addEventListener('click', () => {
    showConfirmModal(
      '¿Estás seguro?',
      '¿Realmente deseas cerrar tu sesión?',
      'Sí, cerrar sesión',
      async () => {
        try {
          await signOut(auth);
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = `login.html?logout=1&t=${Date.now()}`;
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    );
  });

  // Modal de producto (ORIGINAL manteniendo estructura HTML)
  agregarProductoBtn.addEventListener('click', () => {
    resetInactivityTimer();
    formProducto.reset();
    tonosContainer.innerHTML = '';
    imagenPreview.src = '';
    imagenPreview.style.display = 'none';
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Producto';
    cancelarEdicion.style.display = 'none';
    editando = false;
    productoId = null;
    modalProducto.style.display = 'block';
  });

  // Cerrar modales (ORIGINAL)
  modalClose.addEventListener('click', () => {
    modalProducto.style.display = 'none';
  });

  modalImagenClose.addEventListener('click', () => {
    modalImagenAmpliada.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modalProducto || e.target === modalImagenAmpliada) {
      e.target.style.display = 'none';
    }
  });

  // Previsualización de imagen (ORIGINAL)
  imagenInput.addEventListener('input', () => {
    const url = imagenInput.value;
    if (url) {
      imagenPreview.src = url;
      imagenPreview.style.display = 'block';
      imagenPreview.onerror = () => {
        imagenPreview.src = '';
        imagenPreview.style.display = 'none';
      };
    } else {
      imagenPreview.src = '';
      imagenPreview.style.display = 'none';
    }
  });

  // Ampliar imagen (ORIGINAL)
  imagenPreview.addEventListener('click', (e) => {
    e.stopPropagation();
    if (imagenPreview.src && imagenPreview.style.display !== 'none') {
      imagenAmpliada.src = imagenPreview.src;
      modalImagenAmpliada.style.display = 'block';
    }
  });

  // Cargar productos (ORIGINAL manteniendo estructura de tarjetas)
  async function cargarProductos(filtro = '') {
    try {
      const snapshot = await getDocs(collection(db, "productos"));
      productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderizarProductos(filtro);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // Renderizar productos (ORIGINAL con clases CSS correctas)
  function renderizarProductos(filtro = '') {
    cuerpoProductos.innerHTML = '';
    const productosFiltrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(filtro.toLowerCase())
    );

    if (productosFiltrados.length === 0) {
      cuerpoProductos.innerHTML = '<div style="text-align: center; padding: 20px;">No se encontraron productos</div>';
      return;
    }

    productosFiltrados.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'product-card'; // Clase original
      card.innerHTML = `
        <div class="product-card-header">
          <h3>${producto.nombre}</h3>
          <span class="category">${producto.categoria}</span>
        </div>
        <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-tabla" data-src="${producto.imagen}">
        <div class="product-card-details">
          <p class="price">$${parseFloat(producto.precio).toFixed(2)}</p>
          <p class="${producto.disponible ? 'available' : 'unavailable'}">
            ${producto.disponible ? 'Disponible' : 'No disponible'}
          </p>
        </div>
        <div class="product-card-tones">
          ${producto.tonos && producto.tonos.length > 0
            ? producto.tonos.map(tono => `
                <img src="${tono.imagen}" alt="${tono.nombre}" class="tono-preview" data-src="${tono.imagen}">
              `).join('')
            : '<p>Sin tonos</p>'}
        </div>
        <div class="product-card-actions">
          <button class="editar" data-id="${producto.id}">Editar</button>
          <button class="eliminar" data-id="${producto.id}">Eliminar</button>
        </div>
      `;
      cuerpoProductos.appendChild(card);
    });

    // Eventos para imágenes (ORIGINAL)
    document.querySelectorAll('.imagen-tabla, .tono-preview').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        imagenAmpliada.src = img.getAttribute('data-src');
        modalImagenAmpliada.style.display = 'block';
      });
    });

    // Eventos para botones (ORIGINAL con clases correctas)
    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const producto = productos.find(p => p.id === id);

        document.getElementById('producto-id').value = id;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('imagen').value = producto.imagen;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('disponible').checked = producto.disponible;

        imagenPreview.src = producto.imagen;
        imagenPreview.style.display = 'block';

        tonosContainer.innerHTML = '';
        if (producto.tonos && producto.tonos.length > 0) {
          producto.tonos.forEach(tono => {
            agregarTonoInput(tono.nombre, tono.imagen);
          });
        }

        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
        cancelarEdicion.style.display = 'inline-block';
        editando = true;
        productoId = id;
        modalProducto.style.display = 'block';
      });
    });

    document.querySelectorAll('.eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        showConfirmModal(
          '¿Estás seguro?',
          '¿Realmente deseas eliminar este producto?',
          'Sí, eliminar',
          async () => {
            try {
              await deleteDoc(doc(db, "productos", id));
              cargarProductos(tableSearch.value);
            } catch (error) {
              console.error("Error al eliminar producto:", error);
            }
          }
        );
      });
    });
  }

  // Búsqueda (ORIGINAL)
  tableSearch.addEventListener('input', () => {
    renderizarProductos(tableSearch.value);
  });

  // Gestión de tonos (ORIGINAL manteniendo estructura)
  function agregarTonoInput(nombre = '', imagen = '') {
    const tonoDiv = document.createElement('div');
    tonoDiv.className = 'tono-input'; // Clase original
    tonoDiv.innerHTML = `
      <input type="text" class="tono-nombre" placeholder="Nombre del tono" value="${nombre}">
      <input type="text" class="tono-imagen" placeholder="URL de la imagen del tono" value="${imagen}">
      <img class="tono-preview" src="${imagen}" alt="Previsualización del tono" style="display: ${imagen ? 'block' : 'none'};">
      <button type="button" class="eliminar-tono">Eliminar</button>
    `;
    tonosContainer.appendChild(tonoDiv);

    const tonoImagenInput = tonoDiv.querySelector('.tono-imagen');
    const tonoPreview = tonoDiv.querySelector('.tono-preview');

    tonoImagenInput.addEventListener('input', () => {
      const url = tonoImagenInput.value;
      if (url) {
        tonoPreview.src = url;
        tonoPreview.style.display = 'block';
        tonoPreview.onerror = () => {
          tonoPreview.src = '';
          tonoPreview.style.display = 'none';
        };
      } else {
        tonoPreview.src = '';
        tonoPreview.style.display = 'none';
      }
    });

    tonoPreview.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tonoPreview.src && tonoPreview.style.display !== 'none') {
        imagenAmpliada.src = tonoPreview.src;
        modalImagenAmpliada.style.display = 'block';
      }
    });

    tonoDiv.querySelector('.eliminar-tono').addEventListener('click', () => {
      tonoDiv.remove();
    });
  }

  agregarTonoBtn.addEventListener('click', () => {
    agregarTonoInput();
  });

  // Formulario (ORIGINAL)
  formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const categoria = document.getElementById('categoria').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const imagen = document.getElementById('imagen').value;
    const descripcion = document.getElementById('descripcion').value;
    const disponible = document.getElementById('disponible').checked;

    const tonosInputs = document.querySelectorAll('.tono-input');
    const tonos = Array.from(tonosInputs).map(input => ({
      nombre: input.querySelector('.tono-nombre').value,
      imagen: input.querySelector('.tono-imagen').value
    })).filter(tono => tono.nombre.trim() !== '');

    const producto = {
      nombre,
      categoria,
      precio,
      imagen,
      descripcion,
      disponible,
      tonos
    };

    try {
      if (editando) {
        await updateDoc(doc(db, "productos", productoId), producto);
      } else {
        await addDoc(collection(db, "productos"), producto);
      }

      formProducto.reset();
      tonosContainer.innerHTML = '';
      imagenPreview.src = '';
      imagenPreview.style.display = 'none';
      formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Producto';
      cancelarEdicion.style.display = 'none';
      editando = false;
      productoId = null;
      modalProducto.style.display = 'none';
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  });

  // Cancelar edición (ORIGINAL)
  cancelarEdicion.addEventListener('click', () => {
    formProducto.reset();
    tonosContainer.innerHTML = '';
    imagenPreview.src = '';
    imagenPreview.style.display = 'none';
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Producto';
    cancelarEdicion.style.display = 'none';
    editando = false;
    productoId = null;
    modalProducto.style.display = 'none';
  });

  // Scroll (ORIGINAL)
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.admin-header');

    if (scrollTop > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  // Cerrar con Escape (ORIGINAL)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalImagenAmpliada.style.display === 'block') {
      modalImagenAmpliada.style.display = 'none';
    }
  });

  // Carga inicial (ORIGINAL)
  cargarProductos();
});
