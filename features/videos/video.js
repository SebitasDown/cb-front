export function initVideoPlayer() {
  try {
    const videoDataRaw = localStorage.getItem('currentVideo');
    const videoData = videoDataRaw ? JSON.parse(videoDataRaw) : null;
    const placeholder = document.querySelector('.video-placeholder');
    const titleEl = document.getElementById('videoTitle');

    if (!placeholder || !titleEl) {
      console.warn('Elementos del reproductor no encontrados.');
      return;
    }

    if (!videoData?.url) {
      // Si no hay video seleccionado, dejar el placeholder por defecto
      return;
    }

    // Crear el elemento video y reemplazar el placeholder completo para quitar fondo/bordes
    const videoEl = document.createElement('video');
    videoEl.src = videoData.url;
    videoEl.controls = true;
    videoEl.className = 'w-100';
    videoEl.style.maxHeight = '420px';
    videoEl.style.borderRadius = '12px';

    const parent = placeholder.parentNode;
    if (parent) {
      parent.replaceChild(videoEl, placeholder);
    } else {
      // Fallback: si no hay padre, al menos limpia clases/styles del placeholder y embebe video
      placeholder.className = '';
      placeholder.style.cssText = '';
      placeholder.innerHTML = '';
      placeholder.appendChild(videoEl);
    }
    titleEl.textContent = videoData.title || 'Video seleccionado';
  } catch (err) {
    console.error('Error inicializando el reproductor:', err);
  }
}


