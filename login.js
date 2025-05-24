// Importar Firebase como módulo
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

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

  // Inicializar Firebase y Auth
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Referencias al formulario y elementos
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');
  const loginButton = loginForm.querySelector('.btn-login');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('toggle-password');

  // Función para mostrar mensajes
  function showMessage(text, type) {
    loginMessage.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${text}`;
    loginMessage.className = `login-message ${type} show`;
    loginMessage.style.display = 'block';
  }

  // Función para ocultar mensaje
  function hideMessage() {
    loginMessage.classList.remove('show');
    setTimeout(() => {
      loginMessage.style.display = 'none';
    }, 300); // Espera a que termine la animación de salida
  }

  // Toggle mostrar/ocultar contraseña
  togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.classList.toggle('fa-eye', isPassword);
    togglePassword.classList.toggle('fa-eye-slash', !isPassword);
  });

  // Manejar el envío del formulario
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = passwordInput.value;

    // Deshabilitar formulario y mostrar spinner
    loginButton.disabled = true;
    loginButton.classList.add('loading');
    hideMessage();

    try {
      // Autenticar al usuario
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Ingreso exitoso', 'success');
      // Redirigir tras 1.5 segundos
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 1500);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      let errorMessage = 'Hubo un problema al iniciar sesión. Verifica tus credenciales.';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta. Intenta de nuevo.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Verifica tu correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido.';
      }
      showMessage(errorMessage, 'error');
      // Rehabilitar formulario
      loginButton.disabled = false;
      loginButton.classList.remove('loading');
    }
  });

  // Limpiar mensaje al cambiar inputs
  loginForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', hideMessage);
  });
});