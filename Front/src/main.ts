// Imports
import gamePage from './pages/gamePage.ts';
import { GameType } from './pong-game/game.ts';
import HomePage, { initializeHomePage } from './pages/home.ts';
import LoginPage, { initializeLoginPage } from './pages/login.ts';
import ProfilePage from './pages/profile.ts';
import RankingPage from './pages/ranking.ts';
import SettingsPage from './pages/settings.ts';
import UsersPage, { initializeUsersPage } from './pages/users.ts';
import MatchHistoryPage from './pages/matchHistory.ts';
import { authService } from './services/auth.service.ts';
import { userService } from './services/user.service.ts';
import { logOutButton } from "./pages/button.ts";
import HowToPlay from './pages/howToPlay.ts';
import Tournament from './pages/tournament.ts';
import API_BASE_URL from './services/base-api.ts';

document.addEventListener("DOMContentLoaded", () => {
  logOutButton();
});
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
  '/game/local',
  '/game/cpu',
  '/game/online',
  '/howToPlay',
  '/tournament',
//  '/Game/vsCPU',
  '/match-history'
];

// Função que renderiza a página correta e controla a sidebar
async function renderRoute(path: string) {

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
      await ProfilePage(parseInt(userId));
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
		const howToPlayBtn = document.getElementById('how-to-play');
			if (howToPlayBtn) {
			howToPlayBtn.addEventListener('click', () => {
				window.history.pushState(null, '', '/howToPlay');
				window.dispatchEvent(new Event('popstate'));
			});
			}
		const tournamentBtn = document.getElementById('tournament-btn');
			if (tournamentBtn) {
			tournamentBtn.addEventListener('click', () => {
				window.history.pushState(null, '', '/tournament');
				window.dispatchEvent(new Event('popstate'));
			});
			}
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
        app.innerHTML = UsersPage();
		initializeUsersPage();
        break;
	  case '/match-history':
		await MatchHistoryPage();
		break;
	  case '/howToPlay':
        HowToPlay();
        break;
	  case '/tournament':
		Tournament();
		break;
      case '/game/local':
        gamePage(GameType.LOCAL_TWO_PLAYERS);
        break;
      case '/game/cpu':
        gamePage(GameType.LOCAL_VS_AI);
        break;
      case '/game/online':
        gamePage(GameType.REMOTE);
        break;
      default:
        window.history.replaceState(null, '', '/home');
        await renderRoute('/home');
    }
  } else {
    window.history.replaceState(null, '', '/home');
    await renderRoute('/home');
  }
}

// Controla a navegação sem reload
async function onRouteChange() {
  const path = window.location.pathname;

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

// Handle page visibility changes for online status
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // User switched tabs or minimized browser - set offline
    updateOnlineStatus(false);
  } else if (document.visibilityState === 'visible') {
    // User returned to tab - set online
    updateOnlineStatus(true);
  }
});

// Handle page unload (user closes tab/browser)
window.addEventListener('beforeunload', () => {
  updateOnlineStatus(false);
});

// Handle online status updates
async function updateOnlineStatus(isOnline: boolean): Promise<void> {
  try {
    await authService.updateOnlineStatus(isOnline);
  } catch (error) {
    console.error('Failed to update online status:', error);
  }
}

// Update last seen timestamp for user activity
async function updateLastSeen(): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Decode JWT to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.id;

    if (userId) {
      await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ last_seen_at: new Date().toISOString() })
      });
    }
  } catch (error) {
    console.error('Failed to update last seen:', error);
  }
}

// Track user activity to update last_seen_at
let activityTimeout: ReturnType<typeof setTimeout>;

function resetActivityTimer(): void {
  clearTimeout(activityTimeout);
  activityTimeout = setTimeout(() => {
    updateLastSeen();
  }, 30000); // Update every 30 seconds of activity
}

// Listen for user activity
document.addEventListener('mousemove', resetActivityTimer);
document.addEventListener('keydown', resetActivityTimer);
document.addEventListener('click', resetActivityTimer);
document.addEventListener('scroll', resetActivityTimer);

// Start activity tracking when page loads
resetActivityTimer();

// Inicializa a aplicação com a rota atual
onRouteChange();
