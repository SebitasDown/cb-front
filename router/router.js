import { routes } from './routes.js';
import { LoginUser } from '../features/auth/login.js';
import { initResetPassword } from '../features/auth/reset-password.js';
import { homeUsers } from '../features/home/home.js';
import { initWorkshop } from '../features/workshops/workshops.js';
import { initVideoPlayer } from '../features/videos/video.js';
import { initVideoUpload } from '../features/upload/uploadVideos.js';

const protectedRoutes = ['/home', '/videos', '/workshop'];
const authRoutes = ['/', '/login', '/reset-password'];

export async function navigate(path) {
  console.log('Router: navigate() called with path:', path);
  const content = document.getElementById('app-content');
  const route = routes[path] || routes["/"];

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (protectedRoutes.includes(path) && !user) {
      console.warn("Access denied. Redirecting to /login...");
      return navigate("/login");
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    const response = await fetch(route);
    if (!response.ok) throw new Error(`Could not load page: ${route}`);

    const html = await response.text();
    content.innerHTML = html;

    handleSidebarVisibility(path);
    runPageScript(path);

    console.log(`Navigation completed: ${path}`);
  } catch (error) {
    console.error('Navigation error:', error);
    content.innerHTML = `<h1>Error</h1><p>${error.message}</p>`;
  }
}

function handleSidebarVisibility(path) {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const appContent = document.getElementById('app-content');

  if (authRoutes.includes(path)) {
    sidebar?.classList.add('hidden');
    mainContent?.classList.add('full-width');
    appContent?.classList.add('login-fullscreen');
  } else {
    sidebar?.classList.remove('hidden');
    mainContent?.classList.remove('full-width');
    appContent?.classList.remove('login-fullscreen');
  }
}

function runPageScript(path) {
  switch (path) {
    case '/':
    case '/login':
      console.log('Initializing LoginUser...');
      LoginUser();
      break;

    case '/reset-password':
      console.log('Initializing ResetPassword...');
      initResetPassword();
      break;

    case '/home':
      console.log('Initializing Home...');
      homeUsers();
      break;

    case '/uploadVideos':
      // El panel de upload es global, ya fue inicializado en main.js
      break;

    case '/videos':
      console.log('Initializing Videos...');
      setTimeout(() => {
        initVideoPlayer();
        import('../features/comments/main.js').then(module => {
          module.initComments();
        });
        import('../features/chat/chat.js').then(module => {
          module.initChat();
        });
      }, 100);
      break;

    case '/workshop':
      console.log('Initializing Workshop...');
      setTimeout(() => initWorkshop(), 0);
      break;

    default:
      console.log('No script defined for this route.');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const currentPath = window.location.pathname;

  if (authRoutes.includes(currentPath) && user && currentPath !== '/reset-password') {
    console.log("User detected, redirecting to /home");
    return navigate("/home");
  }

  navigate(currentPath);
});

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});

window.navigateTo = navigate;
