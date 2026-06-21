import { navigate } from "./router/router.js";
import { initMobileMenu } from './features/mobile-menu.js';
import { initVideoUpload } from './features/upload/uploadVideos.js';

document.addEventListener("DOMContentLoaded", function() { 
    navigate("/"); 
    
    // Inicializar menú móvil
    initMobileMenu();

    // Inicializar el panel de upload global (carga categorías y speakers)
    initVideoUpload();
});