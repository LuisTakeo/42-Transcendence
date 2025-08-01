import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

export function initializeSearchButton() {
	const searchInput = document.getElementById('searchUsers') as HTMLInputElement;
	const searchButton = document.getElementById('searchUsersButton') as HTMLButtonElement;

	if (searchInput && searchButton) {
	  searchButton.addEventListener('click', () => {
		searchInput.value = ''; // Limpa o conteúdo do input
	  });
	} else {
	  console.error('Não foi possível encontrar os elementos necessários!');
	}
}

export function logOutButton() {
	const logoutBtn = document.getElementById("logoutBtn");
	const modal = document.getElementById("logoutModal");
	const confirmBtn = document.getElementById("confirmLogout");
	const cancelBtn = document.getElementById("cancelLogout");

	logoutBtn?.addEventListener("click", (event) => {
		event.preventDefault();
		modal?.classList.remove("hidden"); // mostra modal
	});

	confirmBtn?.addEventListener("click", () => {
		authService.removeAuthToken();
		userService.clearCache();
		modal?.classList.add("hidden"); // hide modal before redirect
		window.history.pushState({}, '', '/login');
		window.dispatchEvent(new Event('popstate'));
	});

	cancelBtn?.addEventListener("click", () => {
		modal?.classList.add("hidden"); // esconde modal
	});
}
