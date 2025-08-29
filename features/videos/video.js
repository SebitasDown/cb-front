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
    videoEl.style.borderRadius = '0';
    videoEl.style.display = 'block';
    
    // Cuando el video se cargue, ajustar suavemente al tamaño real
    videoEl.addEventListener('loadedmetadata', function() {
        const videoWidth = videoEl.videoWidth;
        const videoHeight = videoEl.videoHeight;
        
        // Calcular el ancho óptimo manteniendo aspect ratio y sin exceder 800px
        const maxWidth = 800;
        const aspectRatio = videoWidth / videoHeight;
        
        let optimalWidth = videoWidth;
        if (optimalWidth > maxWidth) {
            optimalWidth = maxWidth;
        }
        
        // Solo ajustar si la diferencia es significativa (más de 50px)
        const currentWidth = 720;
        if (Math.abs(optimalWidth - currentWidth) > 50) {
            // Ajustar suavemente todos los elementos
            const videoContainer = document.querySelector('.video-container');
            const videoInfoContainer = document.querySelector('.video-info-container');
            const commentsSection = document.querySelector('.comments-section');
            
            if (videoContainer) videoContainer.style.width = optimalWidth + 'px';
            if (videoInfoContainer) videoInfoContainer.style.width = optimalWidth + 'px';
            if (commentsSection) commentsSection.style.width = optimalWidth + 'px';
        }
    });

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


