export function setupTournamentEvents() {
	const addPlayerBtn = document.getElementById("add-player-btn");
	const modal = document.getElementById("add-player-modal");
	const cancelBtn = document.getElementById("cancel-add-player");
	const confirmBtn = document.getElementById("confirm-add-player");
	const input = document.getElementById("player-name") as HTMLInputElement;
	const playerList = document.getElementById("player-list") as HTMLUListElement;
	const generateMatchesBtn = document.getElementById("generate-matches-btn");
	const noPlayersMessage = document.getElementById("no-players-message");

	if (!addPlayerBtn || !modal || !cancelBtn || !confirmBtn || !input || !playerList) {
		console.error("Algum elemento não foi encontrado.");
		return;
	}

	if (playerList.children.length === 0) {
	  if (noPlayersMessage) {
		noPlayersMessage.style.display = "block";
	  }
	}

	addPlayerBtn.addEventListener("click", () => {
		modal.classList.remove("hidden");
	});

	cancelBtn.addEventListener("click", () => {
		modal.classList.add("hidden");
		input.value = "";
	});

	confirmBtn.addEventListener("click", () => {
		const name = input.value.trim();
		if (name !== "") {
		  addPlayer(name, playerList);
		  input.value = "";
		  modal.classList.add("hidden");
		}
	});

	if (generateMatchesBtn) {
		generateMatchesBtn.addEventListener("click", () => {
			if (playerList.children.length <= 3) {
				showErrorModal("You cannot create a tournament with less than 3 players.");
				return;
			} else if (playerList.children.length > 8) {
				showErrorModal("You cannot create a tournament with more than 8 players.");
				return;
			} else {
				showGenerateMatchesModal();
			}
		});

		//GERAR PARTIDAS AQUI 
		setTimeout(() => { //remover esse modal quando tiver a lógica 
			modal.classList.add("hidden");
		}, 5000);
		modal.classList.add("hidden");
	}
}


function addPlayer(name: string, playerList: HTMLUListElement): void {
	if (!playerList) return;

	const alreadyExists = Array.from(playerList.children).some((li) => {
		const span = li.querySelector("span");
		return span?.textContent?.trim().toLowerCase() === name.trim().toLowerCase();
		});

	if (alreadyExists) {
		showErrorModal("Player with this username already exists.");
		return;
	}
  
	const li: HTMLLIElement = document.createElement("li");
	li.className =
	  "bg-[#383568] text-xl border border-purple-300 rounded-lg px-4 py-2 flex items-center justify-between max-w-md mx-auto";
  
	li.innerHTML = `
	  <span class="text-white font-medium">${name}</span>
	  <button class="text-xl text-red-500 hover:text-red-700">Remover</button>
	`;
	
	const noPlayersMessage = document.getElementById("no-players-message");
	if (noPlayersMessage && playerList.children.length > 0) {
		noPlayersMessage.style.display = "none";
	}

	const removeButton = li.querySelector("button");
	if (removeButton) {
		removeButton.addEventListener("click", () =>  li.remove());
	}
	
	playerList.appendChild(li);

	addMatches("player1", "player2", document.getElementById("matches-list") as HTMLUListElement);
	
}

export function showGenerateMatchesModal() {
	const modal = document.getElementById("generate-matches-modal");
	if (!modal) return;


	modal.classList.remove("hidden");

	// ADICIONAR O CODIGO PARA GERAR AS PARTIDAS AQUI, CHAMAR A ADDMATCHES()
	setTimeout(() => {
		modal.classList.add("hidden");
	}, 2000); 
}

//AQUI É ONDE AS PARTIDAS SÃO ADICIONADAS
function addMatches(player1: string, player2: string, matchesList: HTMLUListElement): void {
	if (!matchesList) return;
  
	const li: HTMLLIElement = document.createElement("li");
	li.className =
	  "bg-[#383568] text-xl border border-purple-300 rounded-lg px-4 py-2 flex items-center justify-between max-w-md mx-auto mb-2";

	li.innerHTML = `
		<span class="text-white font-medium">${player1}</span>
		<span class="text-white font-bold">VS</span>
		<span class="text-white font-medium">${player2}</span>
		<button class="text-xl text-white bg-green-500 rounded-lg hover:text-green-700 border-2 border-green-700 p-1">START</button>
	`;
  
	const noMatchesMessage = document.getElementById("no-matches-message");
	if (noMatchesMessage && matchesList.children.length > 0) {
		noMatchesMessage.style.display = "none";
	}

	const startMatch = li.querySelector("button");
	if (startMatch) {
		startMatch.addEventListener("click", () => {
			startCountdown(5, '/home'); // add a rota da partida aqui
		});
	}
	
	matchesList.appendChild(li);	
}

function showErrorModal(message: string, duration: number = 5000): void {
	const modal = document.getElementById("errors-modal");
	const messageEl = document.getElementById("errors-message");
  
	if (!modal || !messageEl) return;
  
	messageEl.textContent = message;
	modal.classList.remove("hidden");
  
}
  
window.addEventListener("DOMContentLoaded", () => {
	const modal = document.getElementById("errors-modal");
	const box = document.getElementById("errors-box");
  
	if (!modal || !box) return;
  
	modal.addEventListener("click", (event) => {
		if (event.target === modal) {
			modal.classList.add("hidden");
		}
	});
});


function startCountdown(seconds: number, redirectUrl: string) {
	const modal = document.getElementById("counter-modal");
	const messageEl = document.getElementById("counter-message");

	if (!modal || !messageEl) return;

	modal.classList.remove("hidden");

	let current = seconds;
	messageEl.textContent = 'Starting match in ' + current.toString() + ' seconds...';

	const interval = setInterval(() => {
		current--;
		if (current <= 0) {
			clearInterval(interval);
			window.location.href = redirectUrl;
		} else {
			messageEl.textContent = 'Starting match in ' + current.toString() + ' seconds...';
		}
	}, 1000);
}