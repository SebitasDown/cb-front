// Configuración centralizada de la aplicación
export const API_CONFIG = {
  BASE_URL: "https://cb-back-prueba-c2e1a4ci8-sebitasdowns-projects.vercel.app",
  ENDPOINTS: {
    AUTH: "/auth",
    VIDEOS: "/videos",
    CATEGORIES: "/categories",
    SPEAKERS: "/speakers",
    SEARCH: "/search",
    CHAT: "/chat",
    COMMENTS: "/comment"
  }
};

// Función helper para construir URLs completas
export function buildApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}
