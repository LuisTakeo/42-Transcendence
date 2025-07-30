import { matchesService } from "../services/matches.service";
import { tournamentsService } from "../services/tournaments.service";
import { userService } from "../services/user.service";
//import { gameService } from "../services/game.service";

export function setupTournamentEvents() {
	const addPlayerBtn = document.getElementById("add-player-btn") as HTMLButtonElement;
	const modal = document.getElementById("add-player-modal");
	const cancelBtn = document.getElementById("cancel-add-player");
	const confirmBtn = document.getElementById("confirm-add-player");
	const input = document.getElementById("player-name") as HTMLInputElement;
	const playerList = document.getElementById("player-list") as HTMLUListElement;
	const generateMatchesBtn = document.getElementById("generate-matches-btn") as HTMLButtonElement;
	const startTournamentBtn = document.getElementById("start-tournament") as HTMLButtonElement;
	const noPlayersMessage = document.getElementById("no-players-message");
	const matchesList = document.getElementById("matches-list") as HTMLUListElement;

	// Create finish tournament button
	const finishBtn = setupFinishTournamentButton(startTournamentBtn.parentElement || document.body);

	// Function to disable tournament control buttons
	const disableTournamentControls = () => {
		if (addPlayerBtn) {
			addPlayerBtn.disabled = true;
			addPlayerBtn.classList.add('opacity-50', 'cursor-not-allowed');
		}
		if (generateMatchesBtn) {
			generateMatchesBtn.disabled = true;
			generateMatchesBtn.classList.add('opacity-50', 'cursor-not-allowed');
		}
	};

	// Load saved state if it exists
	const savedTournamentId = loadTournamentState(playerList, matchesList);
	if (savedTournamentId) {
		startTournamentBtn.disabled = true;
		startTournamentBtn.textContent = `Tournament ${savedTournamentId} in progress ...`;
		startTournamentBtn.classList.add('opacity-50', 'cursor-not-allowed');
		finishBtn.style.display = "block";
		disableTournamentControls();
	}

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


			// Disable other tournament controls
			disableTournamentControls();

			// Disable all 'Remover' buttons
			const removeButtons = playerList.querySelectorAll('button');
			removeButtons.forEach(button => {
				button.disabled = true;
				button.classList.add('opacity-50', 'cursor-not-allowed');
			});

			// Save tournament state and show finish button
			saveTournamentState(playerList, matchesList, tournamentResponse.data.id.toString());
			const finishBtn = document.querySelector("button.bg-red-500") as HTMLButtonElement;
			if (finishBtn) {
				finishBtn.style.display = "block";
			}

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

	// Check if tournament is in progress
	const tournamentState = JSON.parse(localStorage.getItem('tournamentState') || '{}');
	const isDisabled = !!tournamentState.tournamentId;

	const li: HTMLLIElement = document.createElement("li");
	li.className =
	  "bg-[#383568] text-xl border border-purple-300 rounded-lg px-4 py-2 flex items-center justify-between max-w-md mx-auto";

	li.innerHTML = `
	  <span class="text-white font-medium">${name}</span>
	  <button class="text-xl text-red-500 hover:text-red-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${isDisabled ? 'disabled' : ''}>Remover</button>
	`;

	const noPlayersMessage = document.getElementById("no-players-message");
	if (noPlayersMessage && playerList.children.length > 0) {
		noPlayersMessage.style.display = "none";
	}

	const removeButton = li.querySelector("button");
	if (removeButton && !isDisabled) {
		removeButton.addEventListener("click", () => li.remove());
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

function addMatches(player1: string, player2: string, matchesList: HTMLUListElement): void {
	if (!matchesList) return;

	const li: HTMLLIElement = document.createElement("li");
	li.className =
	  "bg-[#383568] text-xl border border-purple-300 rounded-lg px-4 py-2 flex items-center justify-between max-w-md mx-auto mb-2";

	li.innerHTML = `
		<span class="text-white font-medium">${player1}</span>
		<span class="text-white font-bold">VS</span>
		<span class="text-white font-medium">${player2}</span>
		<button class="text-xl text-white bg-green-500 rounded-lg hover:text-green-700 border-2 border-green-700 p-1 transition-colors" data-player1="${player1}" data-player2="${player2}">START</button>
	`;

	const noMatchesMessage = document.getElementById("no-matches-message");
	if (noMatchesMessage && matchesList.children.length > 0) {
		noMatchesMessage.style.display = "none";
	}

	const startMatch = li.querySelector("button");
	if (startMatch) {
		startMatch.addEventListener("click", (e) => {
			const button = e.currentTarget as HTMLButtonElement;

			// Disable the button and change its appearance
			button.disabled = true;
			button.classList.remove('bg-green-500', 'hover:text-green-700', 'border-green-700');
			button.classList.add('bg-gray-500', 'border-gray-700', 'cursor-not-allowed', 'opacity-50');

			const tournamentId = JSON.parse(localStorage.getItem('tournamentState') || '{}').tournamentId;
			const session = `${player1}-${player2}-${tournamentId}`;
			const queryParams = new URLSearchParams({
				session: session
			}).toString();

	  // Store navigation token with timestamp
	  const navigationToken = {
		  timestamp: Date.now(),
		  session: session
	  };
	  localStorage.setItem('tournament_navigation', JSON.stringify(navigationToken));

			// Save the current tournament state to preserve button states
			const playerList = document.getElementById("player-list") as HTMLUListElement;
			if (playerList) {
				saveTournamentState(playerList, matchesList, tournamentId);
			}

			startCountdown(3, `/howToPlay?${queryParams}`);
		});

		// Check if this match was already started
		const tournamentId = JSON.parse(localStorage.getItem('tournamentState') || '{}').tournamentId;
		const startedMatches = JSON.parse(localStorage.getItem('startedTournamentMatches') || '{}');
		if (startedMatches[tournamentId]) {
			const matchStarted = startedMatches[tournamentId].some(
				(match: { player1: string, player2: string }) =>
					(match.player1 === player1 && match.player2 === player2) ||
					(match.player1 === player2 && match.player2 === player1)
			);
			if (matchStarted) {
				startMatch.disabled = true;
				startMatch.classList.remove('bg-green-500', 'hover:text-green-700', 'border-green-700');
				startMatch.classList.add('bg-gray-500', 'border-gray-700', 'cursor-not-allowed', 'opacity-50');
				startMatch.textContent = 'START';
			}
		}
	}

	matchesList.appendChild(li);
}

export function showErrorModal(message: string, duration: number = 5000): void {
	const modal = document.getElementById("errors-modal");
	const messageEl = document.getElementById("errors-message");

	if (!modal || !messageEl) return;

	messageEl.textContent = message;
	modal.classList.remove("hidden");

	if (duration > 0) {
		setTimeout(() => {
			modal.classList.add("hidden");
		}, duration);
	}
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
	messageEl.textContent = 'Redirecting to game in ' + current.toString() + ' seconds...';

	const interval = setInterval(() => {
		current--;
		if (current <= 0) {
			clearInterval(interval);
			window.location.href = redirectUrl;
		} else {
			messageEl.textContent = 'Redirecting to game in ' + current.toString() + ' seconds...';
		}
	}, 1000);
}

// Save tournament state to localStorage
function saveTournamentState(players: HTMLUListElement, matches: HTMLUListElement, tournamentId?: string) {
	const playerItems = Array.from(players.children).map(li => {
		const span = li.querySelector("span");
		const name = span?.textContent?.trim();
		return name || null;
	}).filter(name => name !== null);

	const matchItems = Array.from(matches.children).map(li => {
		const spans = li.querySelectorAll("span");
		const player1 = spans[0]?.textContent?.trim();
		const player2 = spans[2]?.textContent?.trim();
		const startButton = li.querySelector("button") as HTMLButtonElement;
		const isDisabled = startButton?.disabled || false;
		return player1 && player2 ? {
			player1,
			player2,
			isDisabled
		} : null;
	}).filter(match => match !== null);

	const state = {
		players: playerItems,
		matches: matchItems,
		tournamentId: tournamentId
	};

	localStorage.setItem('tournamentState', JSON.stringify(state));
}

// Load tournament state from localStorage
function loadTournamentState(playerList: HTMLUListElement, matchesList: HTMLUListElement): string | undefined {
	const stateStr = localStorage.getItem('tournamentState');
	if (!stateStr) return undefined;

	const state = JSON.parse(stateStr);

	// Load players
	playerList.innerHTML = '';
	state.players.filter((name: string) => name?.trim()).forEach((name: string) => {
		addPlayer(name, playerList);
	});

	// Load matches
	matchesList.innerHTML = '';
	state.matches.forEach((match: { player1: string, player2: string, isDisabled: boolean }) => {
		addMatches(match.player1, match.player2, matchesList);
		if (match.isDisabled) {
			// Find the button for this match and disable it
			const matchLi = Array.from(matchesList.children).find(li => {
				const spans = li.querySelectorAll("span");
				const p1 = spans[0]?.textContent?.trim();
				const p2 = spans[2]?.textContent?.trim();
				return (p1 === match.player1 && p2 === match.player2);
			});
			if (matchLi) {
				const button = matchLi.querySelector("button");
				if (button) {
					button.disabled = true;
					button.classList.remove('bg-green-500', 'hover:text-green-700', 'border-green-700');
					button.classList.add('bg-gray-500', 'border-gray-700', 'cursor-not-allowed', 'opacity-50');
				}
			}
		}
	});

	if (state.tournamentId) {
		// Disable all remove buttons when tournament is in progress
		const removeButtons = playerList.querySelectorAll('button');
		removeButtons.forEach(button => {
			button.disabled = true;
			button.classList.add('opacity-50', 'cursor-not-allowed');
		});
	}

	return state.tournamentId;
}

// Clear tournament state
function clearTournamentState() {
	localStorage.removeItem('tournamentState');
}

// Create and setup finish tournament button
function setupFinishTournamentButton(container: HTMLElement) {
	const finishBtn = document.createElement("button");
	finishBtn.textContent = "Clear";
	finishBtn.className = "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 mt-4";
	finishBtn.style.display = "none";

	finishBtn.addEventListener("click", () => {
		clearTournamentState();
		location.reload(); // Reload page to reset all state
	});

	container.appendChild(finishBtn);
	return finishBtn;
}
