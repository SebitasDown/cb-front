import { get, post, update, deletes } from "../../service/api";
import { navigate } from "../../router/router.js";
const urlSearch = "https://cb-back-prueba.vercel.app/search";
const urlVideos = "https://cb-back-prueba.vercel.app/videos";

function getThumbnailUrl(item) {
  if (item && (item.thumbnail || item.poster)) return item.thumbnail || item.poster;
  return "assets/images/LogocuadradoCoderBoost.png";
}

export function homeUsers() {
  const searchBtn = document.getElementById("searchbtn");
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("searchResults");
  const viewContainer = document.querySelector('.view-container');

  // Debug: verificar que los elementos existan
  console.log('🔍 Elementos del buscador encontrados:', {
    searchBtn: !!searchBtn,
    searchInput: !!searchInput,
    resultsContainer: !!resultsContainer,
    viewContainer: !!viewContainer
  });

  function setHomeSectionsVisibility(show) {
    if (!viewContainer) return;
    const children = Array.from(viewContainer.children);
    children.forEach((el) => {
      const isWelcome = el.classList?.contains('welcome-section');
      const isResults = el.id === 'searchResults';
      if (isWelcome || isResults) return;
      el.style.display = show ? '' : 'none';
    });
  }

  // Función para ejecutar la búsqueda
  async function executeSearch(e) {
    console.log('🚀 Ejecutando búsqueda...');
    e.preventDefault();
    const q = searchInput.value.trim();
    console.log('🔍 Término de búsqueda:', q);

    // Si la consulta está vacía, restaurar el home y limpiar resultados
    if (!q) {
      setHomeSectionsVisibility(true);
      if (resultsContainer) resultsContainer.innerHTML = "";
      return;
    }
    
    try {
      // Ocultar el resto del home excepto la barra de búsqueda y resultados
      setHomeSectionsVisibility(false);

      const result = await get(`${urlSearch}?q=${encodeURIComponent(q)}`);

      if (!Array.isArray(result) || result.length === 0) {
        resultsContainer.innerHTML = `<div class="p-2">No se encontraron resultados para "${q}"</div>`;
        return;
      }

      const cards = Array.isArray(result)
        ? result
            .map((item) => {
              if (!item?.url) return "";
              return `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: .5rem;">
                    <div class="position-relative">
                      <div class="ratio ratio-16x9">
                        <img src="${getThumbnailUrl(item)}" loading="lazy" decoding="async" alt="${item.title || 'Video'}"
                          style="border-top-left-radius: .5rem; border-top-right-radius: .5rem; width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
                          onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ id_video: ${item.id_video || 1}, title: '${item.title?.replace(/'/g, "\\'")}', url: '${item.url?.replace(/'/g, "\\'")}' }));" />
                      </div>
                    </div>
                    <div class="card-body p-2">
                      <h6 class="card-title mb-0 text-truncate" title="${item.title}">${item.title}</h6>
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")
        : "";

      resultsContainer.innerHTML = cards
        ? `<div class="row g-3">${cards}</div>`
        : `<div class="p-2">No se encontraron resultados para "${q}"</div>`;
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
  }

  // Event listener para el botón de búsqueda (click)
  searchBtn.addEventListener("click", (e) => {
    console.log('🔍 Click en botón de búsqueda');
    executeSearch(e);
  });

  // Event listener para la tecla Enter en el input
  searchInput.addEventListener("keypress", (e) => {
    console.log('🔍 Tecla presionada:', e.key);
    if (e.key === 'Enter') {
      console.log('🔍 Enter detectado, ejecutando búsqueda');
      executeSearch(e);
    }
  });

  console.log('✅ Event listeners del buscador registrados');
}
