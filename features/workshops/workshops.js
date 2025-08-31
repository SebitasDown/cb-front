// frontend/features/workshops/workshops.js
import { get } from "../../service/api";
import { navigate } from "../../router/router.js";

const URL_VIDEOS = "https://cb-back-prueba.vercel.app/videos";
const URL_CATEGORIES = "https://cb-back-prueba.vercel.app/categories";

let cachedCategories = [];
let cachedVideos = [];
let activeCategoryId = null; // null = sin filtro

function renderVideosGrid(videos) {
  const grid = document.getElementById('workshopVideosGrid');
  if (!grid) return;

  const gradients = [
    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    'linear-gradient(135deg, var(--color-accent) 0%, var(--color-pink) 100%)',
    'linear-gradient(135deg, var(--color-pink) 0%, var(--color-green) 100%)',
    'linear-gradient(135deg, var(--color-green) 0%, var(--color-yellow) 100%)',
    'linear-gradient(135deg, var(--color-yellow) 0%, var(--color-orange) 100%)',
    'linear-gradient(135deg, var(--color-orange) 0%, var(--color-primary) 100%)',
    'linear-gradient(135deg, var(--color-accent) 0%, var(--color-green) 100%)',
    'linear-gradient(135deg, var(--color-pink) 0%, var(--color-yellow) 100%)'
  ];

  const cards = (videos || [])
    .map((v, index) => {
      const safeTitle = (v.title || "Video").replace(/'/g, "\\'");
      const safeUrl = (v.url || "").replace(/'/g, "\\'");
      const gradient = gradients[index % gradients.length];
      
      return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
          <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: 12px;">
            <div class="position-relative">
              <div class="ratio ratio-16x9" style="background: ${gradient}; cursor: pointer; position: relative;"
                onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ id_video: ${v.id_video}, title: '${safeTitle}', url: '${safeUrl}' }));">
                <div class="play-button-container">
                  <i class="bi bi-play-circle-fill"></i>
                </div>
              </div>
              <!-- Botón de eliminar -->
              <button class="btn btn-delete-video" onclick="deleteVideo(${v.id_video}, this)" title="Eliminar video">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
            <div class="card-body p-3">
              <h6 class="card-title fw-bold mb-0 text-truncate" title="${v.title}">🎬 ${v.title}</h6>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  grid.innerHTML = cards || '<div class="text-muted">No hay videos para mostrar.</div>';
}

function applyFilterByCategoryName(categoryName) {
  const target = cachedCategories.find(c => (c.category_name || '').toLowerCase() === (categoryName || '').toLowerCase());
  activeCategoryId = target ? target.id_category : null;
  const filtered = activeCategoryId ? cachedVideos.filter(v => v.id_category === activeCategoryId) : cachedVideos;
  renderVideosGrid(filtered);
}

async function openFirstVideoOfCategory(categoryName) {
  try {
    const [categories, videos] = await Promise.all([
      get(URL_CATEGORIES),
      get(URL_VIDEOS),
    ]);

    if (!Array.isArray(categories) || !Array.isArray(videos)) return;

    // Buscar la categoría por nombre (case-insensitive)
    const target = categories.find(c => (c.category_name || "").toLowerCase() === categoryName.toLowerCase());
    if (!target) return;

    const related = videos.filter(v => v.id_category === target.id_category);
    if (!related.length) return;

    const first = related[0];
    localStorage.setItem('currentVideo', JSON.stringify({
      id_video: first.id_video,
      title: first.title || 'Video',
      url: first.url || ''
    }));
    navigate('/videos');
  } catch (err) {
    console.error('No se pudo abrir video por categoría:', err);
  }
}

// Función para eliminar video (global para onclick)
window.deleteVideo = async function(videoId, buttonElement) {
  if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
    return;
  }

  try {
    const response = await fetch(`https://cb-back-prueba.vercel.app/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Eliminar el video del array local
      cachedVideos = cachedVideos.filter(v => v.id_video !== videoId);
      
      // Eliminar el elemento del DOM
      const videoCard = buttonElement.closest('.col-12');
      if (videoCard) {
        videoCard.remove();
      }
      
      // Mostrar mensaje de éxito
      showNotification('Video eliminado correctamente', 'success');
    } else {
      throw new Error('Error al eliminar el video');
    }
  } catch (error) {
    console.error('Error eliminando video:', error);
    showNotification('Error al eliminar el video', 'error');
  }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = message;
  
  document.body.appendChild(notification);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

export async function initWorkshop() {
  console.log("🏋️ Workshop.js cargado correctamente.");

  try {
    const [categories, videos] = await Promise.all([
      get(URL_CATEGORIES),
      get(URL_VIDEOS),
    ]);
    if (Array.isArray(categories)) cachedCategories = categories; else cachedCategories = [];
    if (Array.isArray(videos)) cachedVideos = videos; else cachedVideos = [];

    // Render inicial sin filtro
    renderVideosGrid(cachedVideos);
  } catch (err) {
    console.error('Error cargando categorías/videos:', err);
  }

  // Delegación de evento: click en chips de categoría (aplica filtro)
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;
    const categoryName = chip.getAttribute('data-category') || chip.textContent?.trim();
    if (!categoryName) return;
    // marcar activo
    document.querySelectorAll('.category-chip.active').forEach(el => el.classList.remove('active'));
    chip.classList.add('active');
    applyFilterByCategoryName(categoryName);
  }, { passive: true });
}