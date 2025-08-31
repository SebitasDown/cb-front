import { get, post, update, deletes } from "../../service/api";
import { navigate } from "../../router/router.js";
const urlSearch = "https://cb-back-prueba.vercel.app/search";
const urlVideos = "https://cb-back-prueba.vercel.app/videos";

function getThumbnailUrl(item) {
  if (item && (item.thumbnail || item.poster)) return item.thumbnail || item.poster;
  return "assets/images/LogocuadradoCoderBoost.png";
}

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

    // Gradientes para los videos (igual que en workshops)
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

    const cards = recentVideos
      .map((item, index) => {
        if (!item?.url) return "";
        const gradient = gradients[index % gradients.length];
        
        return `
          <div class="col-12 col-sm-6 col-md-4">
            <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: 12px;">
              <div class="position-relative">
                <div class="ratio ratio-16x9" style="background: ${gradient}; cursor: pointer; position: relative;"
                  onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ id_video: ${item.id_video || 1}, title: '${item.title?.replace(/'/g, "\\'")}', url: '${item.url?.replace(/'/g, "\\'")}' }));">
                  <div class="play-button-container">
                    <i class="bi bi-play-circle-fill"></i>
                  </div>
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
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("searchResults");
  const viewContainer = document.querySelector('.view-container');

  loadRecentWorkshops();
  updateWelcomeMessage();

  // Función para actualizar el mensaje de bienvenida con el nickname del usuario
  async function updateWelcomeMessage() {
    try {
      // Obtener el usuario del localStorage (usando la clave "user" como en login.js)
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        const welcomeTitle = document.querySelector('.welcome-section h2');
        
        if (welcomeTitle) {
          if (user.nickname) {
            welcomeTitle.innerHTML = `Welcome back, ${user.nickname}! 👋`;
          } else if (user.name) {
            // Fallback al nombre si no hay nickname
            welcomeTitle.innerHTML = `Welcome back, ${user.full_name}! 👋`;
          } else if (user.email) {
            // Fallback al email si no hay nombre ni nickname
            const emailName = user.email.split('@')[0]; // Tomar la parte antes del @
            welcomeTitle.innerHTML = `Welcome back, ${emailName}! 👋`;
          }
        }
      } else {
        // Si no hay usuario logueado, mostrar mensaje genérico
        const welcomeTitle = document.querySelector('.welcome-section h2');
        if (welcomeTitle) {
          welcomeTitle.innerHTML = 'Welcome back, Coder! 👋';
        }
      }
    } catch (error) {
      console.error('Error updating welcome message:', error);
      // En caso de error, mostrar mensaje genérico
      const welcomeTitle = document.querySelector('.welcome-section h2');
      if (welcomeTitle) {
        welcomeTitle.innerHTML = 'Welcome back, Coder! 👋';
      }
    }
  }

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

      // Gradientes para los videos de búsqueda (igual que en workshops y home)
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

      const cards = Array.isArray(result)
        ? result
            .map((item, index) => {
              if (!item?.url) return "";
              const gradient = gradients[index % gradients.length];
              
              return `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div class="card h-100 shadow-sm border-0 overflow-hidden" style="border-radius: 12px;">
                    <div class="position-relative">
                      <div class="ratio ratio-16x9" style="background: ${gradient}; cursor: pointer; position: relative;"
                        onclick="navigateTo('/videos'); localStorage.setItem('currentVideo', JSON.stringify({ id_video: ${item.id_video || 1}, title: '${item.title?.replace(/'/g, "\\'")}', url: '${item.url?.replace(/'/g, "\\'")}' }));">
                        <div class="play-button-container">
                          <i class="bi bi-play-circle-fill"></i>
                        </div>
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
  }

  // Event listener para el botón de búsqueda (click)
  searchBtn.addEventListener("click", executeSearch);

  // Event listener para la tecla Enter en el input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
      executeSearch(e);
    }
  });
}

