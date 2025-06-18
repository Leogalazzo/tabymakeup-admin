import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
  // Limpieza inicial
  sessionStorage.removeItem('firebase:authUser');
  localStorage.removeItem('firebase:authUser');

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyD-P5-GOlwT-Ax51u3giJm1G-oXmfOf9-g",
    authDomain: "tabymakeup-of.firebaseapp.com",
    projectId: "tabymakeup-of",
    storageBucket: "tabymakeup-of.appspot.com",
    messagingSenderId: "548834143470",
    appId: "1:548834143470:web:54812e64324b3629f617ff"
  };

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Control de inactividad
  let inactivityTimer;
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      signOut(auth).then(() => {
        window.location.href = `login.html?timeout=1&t=${Date.now()}`;
      });
    }, 600000);
  }

  ['mousedown', 'mousemove', 'keypress', 'scroll', 'click', 'touchstart'].forEach(event => {
   document.addEventListener(event, resetInactivityTimer);
  });

  // Verificación de autenticación
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.removeItem('firebase:authUser');
      sessionStorage.removeItem('firebase:authUser');
      window.location.href = `login.html?session_expired=1&t=${Date.now()}`;
    }
  });

  // Referencias DOM
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

  // Variables de estado
  let editando = false;
  let productoId = null;
  let productos = [];
  let lastScrollTop = 0;

  // Inicialización de modales
  modalImagenAmpliada.style.display = 'none';

  // Función de confirmación modificada
  function showConfirmModal(title, message, confirmText, onConfirm, showCancel = true) {
    confirmModal.querySelector('h3').textContent = title;
    confirmModal.querySelector('p').textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.style.display = showCancel ? 'inline-block' : 'none'; // Mostrar u ocultar botón de cancelar
    
    confirmBtn.onclick = async () => {
      try {
        if (onConfirm) await onConfirm();
      } finally {
        confirmModal.style.display = 'none';
      }
    };
    
    if (showCancel) {
      cancelBtn.onclick = () => {
        confirmModal.style.display = 'none';
      };
    }
    
    confirmModal.style.display = 'flex';
  }
function startQuickTour() {
  const intro = introJs();
  intro.setOptions({
    steps: [
      {
        element: document.querySelector('.admin-header'),
        intro: '<strong>Panel de Administración</strong><br><br>Centro de control para gestionar todos los productos de la web.',
        position: 'bottom'
      },
      {
        element: document.querySelector('.volver-tienda'),
        intro: '<strong>Volver a la tienda</strong><br><br>Ir a la web principal en cualquier momento.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#logout-btn'),
        intro: '<strong>Cerrar sesión</strong><br><br>Cierra la sesión del panel administrativo.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#start-tour-btn'),
        intro: '<strong>Repetir tour</strong><br><br>Vuelve a ver esta guía en cualquier momento.',
        position: 'left'
      },
      {
        element: document.querySelector('.table-header'),
        intro: '<strong>Listado de productos</strong><br><br>Visualiza y gestiona los productos.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#table-search'),
        intro: '<strong>Buscar productos</strong><br><br>Filtra por nombre o categoría fácilmente.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#agregar-producto-btn'),
        intro: '<strong>Agregar producto</strong><br><br>Crea nuevos productos para el catálogo online.',
        position: 'left'
      },
      {
        element: document.querySelector('#cuerpo-productos'),
        intro: '<strong>Tus productos</strong><br><br>En esta sección se muestran todos los productos cargados en la web.',
        position: 'top'
      },
      {
        element: document.querySelector('.product-card:first-child'),
        intro: '<strong>Gestión de productos</strong><br><br>Acciones disponibles:<br>• <strong>Editar</strong>: Modificar producto<br>• <strong>Eliminar</strong>: Retirar producto de la web.',
        position: 'top'
      },
      {
        element: document.querySelector('#scroll-top-btn'),
        intro: '⬆️ <strong>Acceso rápido</strong><br><br>Vuelve al inicio con un solo clic.',
        position: 'left'
      }
    ],
    showStepNumbers: false,
    exitOnOverlayClick: true,
    exitOnEsc: true,
    nextLabel: 'Siguiente →',
    prevLabel: '← Anterior',
    doneLabel: '¡Listo!',
    tooltipClass: 'quick-tour-tooltip',
    highlightClass: 'quick-tour-highlight',
    scrollToElement: true,
    scrollPadding: { top: 20, bottom: 20 }
  });

  // Control preciso del scroll para las tarjetas
  intro.onbeforechange(function(targetElement) {
    const currentStep = this._currentStep;
    
    // Ajuste especial para las tarjetas de producto
    if (currentStep === 8 || currentStep === 9) {
      setTimeout(() => {
        const firstCard = document.querySelector('.product-card:first-child');
        if (firstCard) {
          const cardPosition = firstCard.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // Calcular posición para que la tarjeta quede en el tercio superior
          const targetPosition = cardPosition.top - (viewportHeight * 0.2);
          
          window.scrollTo({
            top: window.scrollY + targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  });

  intro.start();
}

// Iniciar el tour mejorado
document.getElementById('start-tour-btn').addEventListener('click', function() {
  resetInactivityTimer();
  startQuickTour();
});
  // Cerrar sesión
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
      },
      true // Mostrar botón de cancelar
    );
  });

  // Modal de producto
  agregarProductoBtn.addEventListener('click', () => {
    resetInactivityTimer();
    formProducto.reset();
    tonosContainer.innerHTML = '';
    imagenPreview.src = '';
    imagenPreview.style.display = 'none';
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar producto';
    cancelarEdicion.style.display = 'none';
    editando = false;
    productoId = null;
    modalProducto.style.display = 'block';
  });

  // Cerrar modales
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

  // Previsualización de imagen
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

  // Ampliar imagen
  imagenPreview.addEventListener('click', (e) => {
    e.stopPropagation();
    if (imagenPreview.src && imagenPreview.style.display !== 'none') {
      imagenAmpliada.src = imagenPreview.src;
      modalImagenAmpliada.style.display = 'block';
    }
  });

  // Cargar productos
  async function cargarProductos(filtro = '') {
    try {
      const snapshot = await getDocs(collection(db, "productos"));
      productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
      renderizarProductos(filtro);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // Renderizar productos
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
      card.className = 'product-card';
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

    document.querySelectorAll('.imagen-tabla, .tono-preview').forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        imagenAmpliada.src = img.getAttribute('data-src');
        modalImagenAmpliada.style.display = 'block';
      });
    });

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

        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar producto';
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
          },
          true // Mostrar botón de cancelar
        );
      });
    });
  }

  // Búsqueda
  tableSearch.addEventListener('input', () => {
    renderizarProductos(tableSearch.value);
  });

  // Gestión de tonos
  function agregarTonoInput(nombre = '', imagen = '') {
    const tonoDiv = document.createElement('div');
    tonoDiv.className = 'tono-input';
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

  // Formulario
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
        showConfirmModal(
          '¡Producto actualizado!',
          `El producto "${nombre}" fue actualizado exitosamente.`,
          'Aceptar',
          async () => {
            // No se necesita acción adicional, solo cerrar el modal
          },
          false // No mostrar botón de cancelar
        );
      } else {
        await addDoc(collection(db, "productos"), producto);
        showConfirmModal(
          '¡Producto agregado!',
          `El producto "${nombre}" fue agregado exitosamente.`,
          'Aceptar',
          async () => {
            // No se necesita acción adicional, solo cerrar el modal
          },
          false // No mostrar botón de cancelar
        );
      }

      formProducto.reset();
      tonosContainer.innerHTML = '';
      imagenPreview.src = '';
      imagenPreview.style.display = 'none';
      formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar producto';
      cancelarEdicion.style.display = 'none';
      editando = false;
      productoId = null;
      modalProducto.style.display = 'none';
      await cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      showConfirmModal(
        'Error',
        'Hubo un problema al guardar el producto. Por favor, intenta de nuevo.',
        'Aceptar',
        async () => {},
        false // No mostrar botón de cancelar
      );
    }
  });

  // Cancelar edición
  cancelarEdicion.addEventListener('click', () => {
    formProducto.reset();
    tonosContainer.innerHTML = '';
    imagenPreview.src = '';
    imagenPreview.style.display = 'none';
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar producto';
    cancelarEdicion.style.display = 'none';
    editando = false;
    productoId = null;
    modalProducto.style.display = 'none';
  });

  // Scroll
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

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalImagenAmpliada.style.display === 'block') {
      modalImagenAmpliada.style.display = 'none';
    }
  });

  // Carga inicial
  cargarProductos();
});
