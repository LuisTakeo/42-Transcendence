import { matchesService } from "../services/matches.service";
import { tournamentsService } from "../services/tournaments.service";
import { userService } from "../services/user.service";

export function setupTournamentEvents() {
	const addPlayerBtn = document.getElementById("add-player-btn");
	const modal = document.getElementById("add-player-modal");
	const cancelBtn = document.getElementById("cancel-add-player");
	const confirmBtn = document.getElementById("confirm-add-player");
	const input = document.getElementById("player-name") as HTMLInputElement;
	const playerList = document.getElementById("player-list") as HTMLUListElement;
	const generateMatchesBtn = document.getElementById("generate-matches-btn");
	const startTournamentBtn = document.getElementById("start-tournament") as HTMLButtonElement;
	const noPlayersMessage = document.getElementById("no-players-message");
	const matchesList = document.getElementById("matches-list") as HTMLUListElement;

	if (!addPlayerBtn || !modal || !cancelBtn || !confirmBtn || !input || !playerList || !generateMatchesBtn || !noPlayersMessage || !matchesList || !startTournamentBtn) {
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
		generateMatchesBtn.addEventListener("click", async () => {
			if (playerList.children.length <= 3) {
				showErrorModal("You cannot create a tournament with less than 3 players.");
				return;
			} else if (playerList.children.length > 8) {
				showErrorModal("You cannot create a tournament with more than 8 players.");
				return;
			} else {
				matchesList.innerHTML = "";
				await showGenerateMatchesModal(playerList, matchesList);
			}
		});
	}

	startTournamentBtn.addEventListener("click", async () => {
		try {
			// Get current user
			const currentUser = await userService.getCurrentUser();
			if (!currentUser) {
				showErrorModal("You must be logged in to create a tournament");
				return;
			}

      if (playerList.children.length <= 3) {
				showErrorModal("You cannot create a tournament with less than 3 players.");
				return;
			} else if (playerList.children.length > 8) {
				showErrorModal("You cannot create a tournament with more than 8 players.");
				return;
      }

			await showGenerateMatchesModal(playerList, matchesList);

			if (matchesList.children.length === 0) {
				showErrorModal("No matches were generated. Tournament creation aborted.");
				return;
			}
			// Create tournament
			const tournamentResponse = await tournamentsService.createTournament({
				name: `Tournament ${new Date().toLocaleString()}`,
				owner_id: currentUser.id
			});

			if (!tournamentResponse.success || !tournamentResponse.data.id) {
				showErrorModal("Failed to create tournament");
				return;
			}

			// Disable button and update text to show tournament is in progress
			startTournamentBtn.disabled = true;
			startTournamentBtn.textContent = `Tournament ${tournamentResponse.data.id} in progress ...`;
			startTournamentBtn.classList.add('opacity-50', 'cursor-not-allowed');

		} catch (error) {
			console.error("Error creating tournament:", error);
			showErrorModal("Failed to create and start tournament");
		}
	});
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

	//TODO: pode ser removido, vai ser gerado ao clicar no botão
	// addMatches("player1", "player2", document.getElementById("matches-list") as HTMLUListElement);

}

export async function showGenerateMatchesModal(playerList: HTMLUListElement, matchesList: HTMLUListElement) {
	const modal = document.getElementById("generate-matches-modal");
	if (!modal || !playerList || !matchesList) return;

	// Obter aliases dos jogadores
	const aliases: string[] = Array.from(playerList.children).map((li) => {
		const span = li.querySelector("span");
		return span?.textContent?.trim() || '';
	}).filter(Boolean);

	try {
		const response = await matchesService.generateAllRoundRobinMatches(aliases);
		const { rounds } = response;

		for (const round of rounds) {
			for (const match of round.matches) {
				const { player1_alias, player2_alias } = match;
				if (player1_alias && player2_alias && player1_alias !== "BYE" && player2_alias !== "BYE") {
					addMatches(player1_alias, player2_alias, matchesList);
				}
			}
		}
	} catch (error) {
		console.error("Erro ao gerar partidas:", error);
		showErrorModal("Failed to generate matches.");
	}

	setTimeout(() => {
		modal.classList.add("hidden");
	}, 2000);

	modal.classList.remove("hidden");
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
			// startCountdown(5, '/home'); // add a rota da partida aqui
      console.log("you've clicked to start the match between", player1, "and", player2);
      // should call /game/local with player1_id = 5 and player2_id = 5 and player1_alias = player1 and player2_alias = player2 and tournament_id
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
