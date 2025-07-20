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
			console.log("Gerando partidas...");
			showGenerateMatchesModal();
	
	
			setTimeout(() => { //remover esse modal quando tiver a lógica 
				modal.classList.add("hidden");
			}, 5000);
			modal.classList.add("hidden");
		});
	}
}


function addPlayer(name: string, playerList: HTMLUListElement): void {
	if (!playerList) return;
  
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
	
}

export function showGenerateMatchesModal() {
	const modal = document.getElementById("generate-matches-modal");
	if (!modal) return;

	modal.classList.remove("hidden");

	// ADD CODIGO AQUI PARA GERAR AS PARTIDAS
	setTimeout(() => {
		modal.classList.add("hidden");
	}, 2000); 
}