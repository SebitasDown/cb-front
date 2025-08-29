import { get, post, update, deletes } from "../../service/api";
import { navigate } from "../../router/router.js";
const urlSearch = "https://cb-back-prueba.vercel.app/search";
const urlVideos = "https://cb-back-prueba.vercel.app/videos";


export function homeUsers() {
  const searchBtn = document.getElementById("searchbtn");
  const resultsContainer = document.getElementById("searchResults");
  const viewContainer = document.querySelector('.view-container');

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
                  <div class="card h-100 shadow-sm">
                    <div class="ratio ratio-16x9">
                      <video src="${item.url}" controls style="border-top-left-radius: .5rem; border-top-right-radius: .5rem;"></video>
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
  });
}
