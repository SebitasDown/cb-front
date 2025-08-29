import { navigate } from "../../router/router.js";
import { get } from "../../service/api.js";

const API_BASE = "https://cb-back-prueba.vercel.app";

export function initVideoUpload() {
  const uploadPanel = document.getElementById('uploadPanel');
  const form = document.getElementById('uploadVideoForm');
  const selectCategory = document.getElementById('category');
  const selectUser = document.getElementById('user');
  const closeBtn = document.getElementById('closeUploadPanel');

  if (!uploadPanel || !form) return;

  // Asegurar que el panel esté oculto por defecto
  uploadPanel.classList.remove('show');

  console.log('🔄 Inicializando panel de upload...');
  
  // Cargar selects: categorías y speakers
  loadCategories();
  loadSpeakers();

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
  });

  // Cerrar panel haciendo clic fuera
  document.addEventListener('click', (e) => {
    if (uploadPanel.classList.contains('show') && 
        !uploadPanel.contains(e.target) && 
        !e.target.closest('#buttonupload')) {
      uploadPanel.classList.remove('show');
      form.reset();
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
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    try {
      submitBtn && (submitBtn.textContent = '⏳ Uploading...');
      submitBtn && (submitBtn.disabled = true);

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

      // Usar fetch directamente para FormData
      const response = await fetch(`${API_BASE}/videos/create`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();

      // Mostrar animación de éxito
      uploadPanel.classList.add('success');
      setTimeout(() => {
        uploadPanel.classList.remove('success');
      }, 1000);

      alert('¡Video subido exitosamente! 🎉');
      form.reset();
      uploadPanel.classList.remove('show');
      
      // Navegar a la página del reproductor si backend devuelve URL
      if (res && (res.url || res.video?.url)) {
        const url = res.url || res.video.url;
        const title = res.title || res.video?.title || titleInput.value;
        localStorage.setItem('currentVideo', JSON.stringify({ title, url }));
        navigate('/videos');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error subiendo el video');
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText || 'Upload Video';
        submitBtn.disabled = false;
      }
    }
  });
}

// Inicializar automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, inicializando upload...');
  initVideoUpload();
});

async function loadCategories() {
  try {
    console.log('📂 Cargando categorías desde:', `${API_BASE}/categories`);
    const categories = await get(`${API_BASE}/categories`);
    console.log('✅ Categorías cargadas:', categories);
    
    const select = document.getElementById('category');
    if (!Array.isArray(categories) || !select) {
      console.warn('⚠️ No se pudieron cargar las categorías o el select no existe');
      return;
    }
    
    select.innerHTML = '<option value="">Select a category...</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id_category;
      option.textContent = cat.category_name;
      select.appendChild(option);
    });
    console.log('✅ Select de categorías poblado con', categories.length, 'opciones');
  } catch (e) {
    console.error('❌ Error cargando categorías:', e);
  }
}

async function loadSpeakers() {
  try {
    console.log('👥 Cargando speakers desde:', `${API_BASE}/speakers`);
    const speakers = await get(`${API_BASE}/speakers`);
    console.log('✅ Speakers cargados:', speakers);
    
    const select = document.getElementById('user');
    if (!Array.isArray(speakers) || !select) {
      console.warn('⚠️ No se pudieron cargar los speakers o el select no existe');
      return;
    }
    
    select.innerHTML = '<option value="">Select a speaker...</option>';
    speakers.forEach(sp => {
      const option = document.createElement('option');
      option.value = sp.id_user;
      option.textContent = sp.full_name;
      select.appendChild(option);
    });
    console.log('✅ Select de speakers poblado con', speakers.length, 'opciones');
  } catch (e) {
    console.error('❌ Error cargando speakers:', e);
  }
}
