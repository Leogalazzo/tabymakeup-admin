import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', function() {
  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyD-P5-GOlwT-Ax51u3giJm1G-oXmfOf9-g",
    authDomain: "tabymakeup-of.firebaseapp.com",
    projectId: "tabymakeup-of",
    storageBucket: "tabymakeup-of.firebasestorage.app",
    messagingSenderId: "548834143470",
    appId: "1:548834143470:web:54812e64324b3629f617ff"
  };

  // Inicializar Firebase, Firestore y Auth
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Verificar si el usuario está autenticado
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'login.html';
    }
  });

  // Referencias al formulario, contenedor de tarjetas, modal y botón de cerrar sesión
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

  let editando = false;
  let productoId = null;
  let productos = [];
  let lastScrollTop = 0;

  // Asegurarse de que el modal esté oculto al cargar la página
  console.log('Estado inicial del modal de imagen ampliada:', modalImagenAmpliada.style.display);
  modalImagenAmpliada.style.display = 'none';

  // Función para mostrar el modal de confirmación con texto dinámico
  function showConfirmModal(title, message, confirmText, onConfirm) {
    confirmModal.querySelector('h3').textContent = title;
    confirmModal.querySelector('p').textContent = message;
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = async () => {
      await onConfirm();
      confirmModal.style.display = 'none';
    };
    cancelBtn.onclick = () => {
      confirmModal.style.display = 'none';
    };
    confirmModal.style.display = 'flex';
  }

  // Evento para cerrar sesión
  logoutBtn.addEventListener('click', () => {
    showConfirmModal(
      '¿Estás seguro?',
      '¿Realmente deseas cerrar tu sesión?',
      'Sí, cerrar sesión',
      async () => {
        try {
          await signOut(auth);
          window.location.href = 'login.html';
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      }
    );
  });

  // Abrir modal al hacer clic en "Agregar Producto"
  agregarProductoBtn.addEventListener('click', () => {
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

  // Cerrar modal de producto
  modalClose.addEventListener('click', () => {
    modalProducto.style.display = 'none';
  });

  // Cerrar modal de producto al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target === modalProducto) {
      modalProducto.style.display = 'none';
    }
    if (e.target === modalImagenAmpliada) {
      modalImagenAmpliada.style.display = 'none';
    }
  });

  // Cerrar modal de imagen ampliada
  modalImagenClose.addEventListener('click', () => {
    console.log('Cerrando modal de imagen ampliada');
    modalImagenAmpliada.style.display = 'none';
  });

  // Previsualización de la imagen principal y hacerla clicable
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

  // Hacer la imagen del formulario clicable para ampliar
  imagenPreview.addEventListener('click', (e) => {
    e.stopPropagation();
    if (imagenPreview.src && imagenPreview.style.display !== 'none') {
      console.log('Abriendo modal con imagen:', imagenPreview.src);
      imagenAmpliada.src = imagenPreview.src;
      modalImagenAmpliada.style.display = 'block';
    }
  });

  // Función para cargar productos desde Firestore
  async function cargarProductos(filtro = '') {
    try {
      const snapshot = await getDocs(collection(db, "productos"));
      productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderizarProductos(filtro);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  // Función para renderizar productos como tarjetas con filtro
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

    // Agregar eventos a las imágenes de las tarjetas
    document.querySelectorAll('.imagen-tabla').forEach(imagen => {
      imagen.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Abriendo modal con imagen de tarjeta:', imagen.getAttribute('data-src'));
        imagenAmpliada.src = imagen.getAttribute('data-src');
        modalImagenAmpliada.style.display = 'block';
      });
    });

    // Agregar eventos a las imágenes de tonos
    document.querySelectorAll('.tono-preview').forEach(imagen => {
      imagen.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Abriendo modal con imagen de tono:', imagen.getAttribute('data-src'));
        imagenAmpliada.src = imagen.getAttribute('data-src');
        modalImagenAmpliada.style.display = 'block';
      });
    });

    // Agregar eventos a los botones de editar y eliminar
    document.querySelectorAll('.editar').forEach(boton => {
      boton.addEventListener('click', async (e) => {
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

    document.querySelectorAll('.eliminar').forEach(boton => {
      boton.addEventListener('click', (e) => {
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

  // Buscador en las tarjetas
  tableSearch.addEventListener('input', () => {
    const filtro = tableSearch.value.toLowerCase().trim();
    renderizarProductos(filtro);
  });

  // Función para agregar un input de tono dinámicamente
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

    // Hacer la previsualización del tono clicable para ampliar
    tonoPreview.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tonoPreview.src && tonoPreview.style.display !== 'none') {
        console.log('Abriendo modal con imagen de tono:', tonoPreview.src);
        imagenAmpliada.src = tonoPreview.src;
        modalImagenAmpliada.style.display = 'block';
      }
    });

    tonoDiv.querySelector('.eliminar-tono').addEventListener('click', () => {
      tonoDiv.remove();
    });
  }

  // Evento para agregar un nuevo tono
  agregarTonoBtn.addEventListener('click', () => {
    agregarTonoInput();
  });

  // Manejar el envío del formulario
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
        console.log('Actualizando producto:', productoId, producto);
        const docRef = doc(db, "productos", productoId);
        await updateDoc(docRef, producto);
      } else {
        console.log('Agregando nuevo producto:', producto);
        const docRef = await addDoc(collection(db, "productos"), producto);
        console.log('Producto agregado con ID:', docRef.id);
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

  // Cancelar edición
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

  // Scroll to Top functionality
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Show/hide scroll-to-top button and header based on scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.admin-header');

    // Show/hide scroll-to-top button
    if (scrollTop > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    // Hide header on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });

  // Cargar productos al iniciar
  cargarProductos();

  // Cerrar modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalImagenAmpliada.style.display === 'block') {
      console.log('Cerrando modal con Escape');
      modalImagenAmpliada.style.display = 'none';
    }
  });
});