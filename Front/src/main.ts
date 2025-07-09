// Imports
import HomePage, { initializeHomePage } from './pages/home.ts';
import LoginPage, { initializeLoginPage } from './pages/login.ts';
import ProfilePage from './pages/profile.ts';
import RankingPage from './pages/ranking.ts';
import SettingsPage from './pages/settings.ts';
import UsersPage from './pages/users.ts';
import { authService } from './services/auth.service.ts';
import { userService } from './services/user.service.ts';
// import ClassicGamePage from './pages/classicGame.ts';
// import FastGamePage from './pages/fastGame.ts';
// import JoquempoPage from './pages/joquempo.ts';

const sidebar = document.getElementById('sidebar')!;
const app = document.getElementById('app')!;

// Routes that shows sidebar
const routesWithSidebar = [
  '/home',
  '/login',
  '/profile',
  '/ranking',
  '/settings',
  '/users',
];

// Função que renderiza a página correta e controla a sidebar
async function renderRoute(path: string) {
  console.log('Rendering route:', path); // Debug

  if (path === '/login') {
    sidebar.style.display = 'none';
    app.style.marginLeft = '0';
    app.innerHTML = LoginPage();
    // Initialize login page and Google authentication
    await initializeLoginPage();
  } else if (path.startsWith('/profile/')) {
    // Handle profile routes with user ID
    sidebar.style.display = 'flex';
    app.style.marginLeft = '80px';
    setupLogoutButton(); // Setup logout functionality
    const userId = path.split('/')[2];
    if (userId) {
      ProfilePage(parseInt(userId));
    } else {
      app.innerHTML = '<h1>Invalid Profile</h1>';
    }
  } else if (routesWithSidebar.includes(path)) {
    sidebar.style.display = 'flex';
    app.style.marginLeft = '80px'; // largura da sidebar
    setupLogoutButton(); // Setup logout functionality

    switch (path) {
      case '/home':
        app.innerHTML = HomePage();
        initializeHomePage();
        break;
      case '/profile':
        ProfilePage();
        break;
      case '/settings':
        SettingsPage();
        break;
      case '/ranking':
        RankingPage();
        break;
      case '/users':
        UsersPage();
        break;
      default:
        console.log('Route not found in switch:', path); // Debug
        app.innerHTML = '<h1>Page Not Found</h1>';
    }
  } else {
    console.log('Route not in sidebar routes:', path); // Debug
    sidebar.style.display = 'none';
    app.style.marginLeft = '0';
    app.innerHTML = '<h1>Page Not Found</h1>';
  }
}

// Controla a navegação sem reload
async function onRouteChange() {
  const path = window.location.pathname;
  console.log('Current path:', path); // Debug

  // Se estiver na raiz, redireciona para /home
  if (path === '/' || path === '') {
    window.history.replaceState(null, '', '/home');
    await renderRoute('/home');
    return;
  }

  await renderRoute(path);
}

// Intercepta cliques em links para evitar reload da página
document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  // Procura o <a> mais próximo se clicar em um filho (ex: imagem dentro do <a>)
  const anchor = target.closest('a');

  if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
    event.preventDefault();
    const href = anchor.getAttribute('href')!;
    window.history.pushState(null, '', href);
    onRouteChange();
  }
});

// Captura evento do botão voltar/avançar do navegador
window.addEventListener('popstate', onRouteChange);

// Handle logout button
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      // Clear authentication and redirect to login
      authService.removeAuthToken();
      userService.clearCache();
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    });
  }
}

// Listen for custom route change events
window.addEventListener('routeChange', () => {
  onRouteChange();
});

// Inicializa a aplicação com a rota atual
onRouteChange();
