import { navigate } from "../../router/router.js";
import { get } from "../../service/api.js";

const API_BASE = "https://cb-back-prueba.vercel.app";

export function initVideoUpload() {
  const uploadPanel = document.getElementById('uploadPanel');
  const form = document.getElementById('uploadVideoForm');
  const selectCategory = document.getElementById('category');
  const selectUser = document.getElementById('user');
  const closeBtn = document.getElementById('closeUploadPanel');
  //thumbnail
  const videoInput = document.getElementById('videoFile');
  const thumbnailPreviewSection = document.getElementById('thumbnailPreviewSection');
  const thumbnailPreview = document.getElementById('thumbnailPreview');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  if (!uploadPanel || !form) return;

  // Asegurar que el panel esté oculto por defecto
  uploadPanel.classList.remove('show');

  console.log('🔄 Inicializando panel de upload con preview de miniatura...');
  
  // Cargar selects: categorías y speakers
  loadCategories();
  loadSpeakers();

  // Función para mostrar preview de la miniatura
  function showThumbnailPreview(file) {
    if (!file || !file.type.startsWith('video/')) {
      thumbnailPreviewSection.style.display = 'none';
      return;
    }

    // Crear URL temporal para el video
    const videoURL = URL.createObjectURL(file);
    
    // Crear elemento video temporal para extraer frame
    const tempVideo = document.createElement('video');
    tempVideo.muted = true;
    tempVideo.crossOrigin = 'anonymous';
    
    tempVideo.addEventListener('loadedmetadata', function() {
      // Extraer frame al 25% de la duración
      const seekTime = this.duration * 0.25;
      this.currentTime = seekTime;
    });
    
    tempVideo.addEventListener('seeked', function() {
      // Crear canvas para capturar el frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      
      // Dibujar el frame en el canvas
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      
      // Convertir a imagen
      const thumbnailURL = canvas.toDataURL('image/jpeg', 0.8);
      
      // Mostrar la miniatura
      thumbnailPreview.innerHTML = `
        <img src="${thumbnailURL}" alt="Video Thumbnail Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
        <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem;">
          ${Math.round(this.duration)}s
        </div>
      `;
      
      // Mostrar la sección de preview
      thumbnailPreviewSection.style.display = 'block';
      
      // Limpiar URL temporal
      URL.revokeObjectURL(videoURL);
    });
    
    tempVideo.addEventListener('error', function() {
      console.error('Error al cargar video para preview');
      thumbnailPreviewSection.style.display = 'none';
    });
    
    tempVideo.src = videoURL;
  }

  // Event listener para cambio de archivo de video
  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('🎬 Archivo de video seleccionado:', file.name);
      showThumbnailPreview(file);
    } else {
      thumbnailPreviewSection.style.display = 'none';
    }
  });

  // Función para abrir/cerrar el panel
  function togglePanel() {
    if (uploadPanel.classList.contains('show')) {
      uploadPanel.classList.remove('show');
    } else {
      uploadPanel.classList.add('show');
    }
  }

  // Cerrar panel con el botón X
  closeBtn?.addEventListener('click', () => {
    uploadPanel.classList.remove('show');
    form.reset();
    thumbnailPreviewSection.style.display = 'none';
    thumbnailPreview.innerHTML = `
      <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
      <span class="text-muted">Preview will appear here</span>
    `;
  });

  // Cerrar panel haciendo clic fuera
  document.addEventListener('click', (e) => {
    if (uploadPanel.classList.contains('show') && 
        !uploadPanel.contains(e.target) && 
        !e.target.closest('#buttonupload')) {
      uploadPanel.classList.remove('show');
      form.reset();
      thumbnailPreviewSection.style.display = 'none';
      thumbnailPreview.innerHTML = `
        <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
        <span class="text-muted">Preview will appear here</span>
      `;
    }
  });

  // Abrir panel cuando se hace clic en el botón de upload
  const uploadButton = document.getElementById('buttonupload');
  if (uploadButton) {
    uploadButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🔘 Botón de upload clickeado');
      togglePanel();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      // Cambiar estado del botón
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtnText.textContent = '⏳ Processing...';

      const fileInput = document.getElementById('videoFile');
      const titleInput = document.getElementById('title');

      const userId = selectUser?.value;
      const categoryId = selectCategory?.value;
      
      console.log('📝 Valores del formulario:', { userId, categoryId, title: titleInput.value });
      
      if (!userId || !categoryId) {
        alert('Please select both a category and a speaker');
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('title', titleInput.value);
      formData.append('id_user', userId);
      formData.append('id_category', categoryId);

      console.log('🚀 Enviando video al backend...');

      // Usar fetch directamente para FormData
      const response = await fetch(`${API_BASE}/videos/create`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      console.log('✅ Respuesta del backend:', res);

      // Mostrar animación de éxito
      uploadPanel.classList.add('success');
      submitBtnText.textContent = '✅ Upload Complete!';
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        form.reset();
        uploadPanel.classList.remove('show', 'success');
        thumbnailPreviewSection.style.display = 'none';
        thumbnailPreview.innerHTML = `
          <i class="bi bi-image text-muted" style="font-size: 2rem;"></i>
          <span class="text-muted">Preview will appear here</span>
        `;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtnText.textContent = 'Upload Video';
      }, 2000);

    } catch (error) {
      console.error('❌ Error durante el upload:', error);
      
      // Restaurar estado del botón
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtnText.textContent = 'Upload Video';
      
      alert('Error uploading video. Please try again.');
    }
  });

  // Función para cargar categorías
  async function loadCategories() {
    try {
      console.log('🔄 Cargando categorías desde:', `${API_BASE}/categories`);
      const categories = await get(`${API_BASE}/categories`);
      console.log('📊 Categorías recibidas:', categories);
      
      if (!selectCategory) {
        console.error('❌ Elemento selectCategory no encontrado');
        return;
      }
      
      selectCategory.innerHTML = '<option value="">Select a category...</option>';
      
      if (Array.isArray(categories)) {
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id_category;
          option.textContent = cat.category_name;
          selectCategory.appendChild(option);
        });
        console.log('✅ Select de categorías poblado con', categories.length, 'opciones');
      } else {
        console.error('❌ Las categorías no son un array:', categories);
      }
    } catch (e) {
      console.error('❌ Error cargando categorías:', e);
    }
  }

  // Función para cargar speakers
  async function loadSpeakers() {
    try {
      const speakers = await get(`${API_BASE}/speakers`);
      selectUser.innerHTML = '<option value="">Choose a speaker...</option>';
      
      speakers.forEach(speaker => {
        const option = document.createElement('option');
        option.value = speaker.id_user;
        option.textContent = speaker.nickname;
        selectUser.appendChild(option);
      });
      
      console.log('✅ Speakers cargados:', speakers.length);
    } catch (error) {
      console.error('❌ Error cargando speakers:', error);
      selectUser.innerHTML = '<option value="">Error loading speakers</option>';
    }
  }

  console.log('✅ Sistema de upload con preview de miniatura inicializado completamente');
}

// Inicializar automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, inicializando upload...');
  initVideoUpload();
});
