// Espera o DOM ser carregado
document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.getElementById('searchUsers') as HTMLInputElement;
	const searchButton = document.getElementById('searchUsersButton') as HTMLButtonElement;
  
	if (searchInput && searchButton) {
	  searchButton.addEventListener('click', () => {
		console.log(searchInput.value);
		searchInput.value = ''; // Limpa o conteúdo do input
	  });
	} else {
	  console.error('Não foi possível encontrar os elementos necessários!');
	}
  });
  