import { navigate } from "./router/router.js";
import { initMobileMenu } from './features/mobile-menu.js';

document.addEventListener("DOMContentLoaded", function() { 
    navigate("/"); 
    
    // Inicializar menú móvil
    initMobileMenu();
});

// Función global para el botón de subir
window.handleUpload = function() {
  navigate('/uploadVideos');
};