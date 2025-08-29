import { navigate } from "./router/router.js";
document.addEventListener("DOMContentLoaded", function() { navigate("/"); });

// Función global para el botón de subir
window.handleUpload = function() {
  navigate('/uploadVideos');
};