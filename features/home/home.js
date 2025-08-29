import { get, post, update, deletes } from "../../service/api";
import { navigate } from "../../router/router.js";
const urlSearch = "https://cb-back-prueba.vercel.app/search";
const urlVideos = "https://cb-back-prueba.vercel.app/videos";

async function loadRecentWorkshops() {
  try {
    const videos = await get(urlVideos);

    if (!Array.isArray(videos)) return;

    // Ordenar por fecha descendente
    const sortedVideos = videos.sort((a, b) => new Date(b.video_date) - new Date(a.video_date));

    // Tomar los tres más recientes
    const recentVideos = sortedVideos.slice(0, 3);

    const recentGrid = document.getElementById("recentWorkshopsGrid");
    if (!recentGrid) return;

    const cards = recentVideos
      .map((item) => {
        if (!item?.url) return "";
        return `
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: 12px;">
              <div class="position-relative">
                <div class="ratio ratio-16x9">
                  <video src="${item.url}" style="border-top-left-radius: 12px; border-top-right-radius: 12px; cursor: pointer;" 
                    onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ title: '${item.title?.replace(/'/g, "\\'")}', url: '${item.url?.replace(/'/g, "\\'")}' }));"></video>
                </div>
                <span class="position-absolute top-0 start-0 m-2 badge bg-success">🆕</span>
              </div>
              <div class="card-body p-3">
                <h6 class="card-title fw-bold mb-1 text-truncate" title="${item.title}">🎬 ${item.title}</h6>
                <p class="card-text small text-muted mb-0 text-truncate" title="${item.summary || ''}">${item.summary || ''}</p>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    recentGrid.innerHTML = cards;
  } catch (error) {
    console.error("Error loading recent workshops:", error);
  }
}


export function homeUsers() {
  const searchBtn = document.getElementById("searchbtn");
  const resultsContainer = document.getElementById("searchResults");
  const viewContainer = document.querySelector('.view-container');

  loadRecentWorkshops();

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

  searchBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const searchInput = document.getElementById("searchInput");
    const q = searchInput.value.trim();

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
                  <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: 12px;">
                    <div class="position-relative">
                      <div class="ratio ratio-16x9">
                        <video src="${item.url}" style="border-top-left-radius: 12px; border-top-right-radius: 12px; cursor: pointer;" 
                          onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ title: '${item.title?.replace(/'/g, "\\'")}', url: '${item.url?.replace(/'/g, "\\'")}' }));"></video>
                      </div>
                      <span class="position-absolute top-0 start-0 m-2 badge bg-primary">▶️</span>
                    </div>
                    <div class="card-body p-3">
                      <h6 class="card-title fw-bold mb-1 text-truncate" title="${item.title}">🎬 ${item.title}</h6>
                      <p class="card-text small text-muted mb-0 text-truncate" title="${item.summary || ''}">${item.summary || ''}</p>
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
  });
}

