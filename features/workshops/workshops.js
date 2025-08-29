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
                onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ title: '${safeTitle}', url: '${safeUrl}' }));">
                <div class="text-white text-center position-absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%;">
                  <i class="bi bi-play-circle-fill" style="font-size: 4rem; opacity: 0.9; display: block; margin: 0 auto;"></i>
                  <div class="mt-3 fw-bold" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3); font-size: 0.9rem;">Reproducir</div>
                </div>
              </div>
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
      title: first.title || 'Video',
      url: first.url || ''
    }));
    navigate('/videos');
  } catch (err) {
    console.error('No se pudo abrir video por categoría:', err);
  }
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