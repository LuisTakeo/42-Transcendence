// Imports 
import HomePage from './pages/home.ts';
import ProfilePage from './pages/profile.ts';
import SettingsPage from './pages/settings.ts';
import RankingPage from './pages/ranking.ts';
import UsersPage from './pages/users.ts';
import ClassicGamePage from './pages/classicGame.ts';
import FastGamePage from './pages/fastGame.ts';
import JoquempoPage from './pages/joquempo.ts';
import LoginPage from './pages/login.ts';

const sidebar = document.getElementById('sidebar')!;
const app = document.getElementById('app')!;

// Routes that shows sidebar
const routesWithSidebar = [
  '/home',
  '/profile',
  '/settings',
  '/ranking',
  '/users',
];

// Função que renderiza a página correta e controla a sidebar
function renderRoute(path: string) {
  if (path === '/login') {
    sidebar.style.display = 'none';
    app.style.marginLeft = '0';
    app.innerHTML = LoginPage;
  } else if (routesWithSidebar.includes(path)) {
    sidebar.style.display = 'flex';
    app.style.marginLeft = '80px'; // largura da sidebar

    switch (path) {
      case '/home':
        app.innerHTML = HomePage;
        break;
      case '/profile':
        app.innerHTML = ProfilePage;
        break;
      case '/settings':
        app.innerHTML = SettingsPage;
        break;
      case '/ranking':
        app.innerHTML = RankingPage;
        break;
      case '/users':
        app.innerHTML = UsersPage;
        break;
      default:
        app.innerHTML = '<h1>Page Not Found</h1>';
    }
  } else {
    sidebar.style.display = 'none';
    app.style.marginLeft = '0';
    app.innerHTML = '<h1>Page Not Found</h1>';
  }
}

// Controla a navegação sem reload
function onRouteChange() {
  const path = window.location.pathname;
  renderRoute(path);
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

// Inicializa a aplicação com a rota atual
onRouteChange();
