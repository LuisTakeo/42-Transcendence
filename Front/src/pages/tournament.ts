import { clearTournamentState, setupTournamentEvents } from "./tournamentEvents.ts";
import { userService } from "../services/user.service.ts";
import { tournamentsService } from "../services/tournaments.service.ts";
import "../style.css"

export default async function Tournament(): Promise<void> {
  // Route protection: require authentication
  const currentUser = await userService.requireAuth();
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }

	const app = document.getElementById("app");
  	if (!app) return;

	app.innerHTML = ""; // Clear existing content

	const main = document.createElement("main");
	main.className = "min-h-screen px-4 py-10";
	main.innerHTML =`
<div class="flex flex-col md:flex-row w-full gap-6 max-w-7xl mx-auto">

      <!-- LEFT SIDE: ADD PLAYER -->
      <div class="w-full md:w-1/2 bg-[#1E1B4B] p-8 md:p-10 rounded-2xl text-white flex flex-col items-center gap-6">
        <div class="w-full max-w-md space-y-4">
          <div class="flex justify-center">
            <h1 class="font-semibold text-3xl text-center">Tournament Players</h1>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 p-1">
            <button id="add-player-btn" class="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-xl">
              Add players
            </button>
            <button id="start-tournament" class="flex-1 bg-[#1E1B4B] text-xl border-2 border-[#383568] text-white py-2 rounded hover:bg-purple-700 transition">
              Start Tournament
            </button>
          </div>
        </div>

        <div class="w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4 text-center">Players</h2>
          <ul id="player-list" class="space-y-2 text-center">
            <!-- Players here -->
            <span id="no-players-message" class="text-gray-400 block text-xl">No players added yet.</span>
          </ul>
        </div>
      </div>

      <!-- RIGHT SIDE: MATCHES -->
      <div class="w-full md:w-1/2 bg-[#1E1B4B] p-8 md:p-10 rounded-2xl text-white text-center flex flex-col items-center gap-6">
        <h1 class="font-semibold text-3xl">Tournament Matches</h1>
		<ul id="matches-list" class="w-full max-w-md space-y-2">
		  <!-- Matches here -->
        <span id="no-matches-message" class="text-gray-400 block text-xl">No matches generated yet.</span>
      </div>
    </div>

    <!-- BOTTOM SIDE: BUTTONS -->
    <div class="flex flex-col sm:flex-row justify-center gap-4 mt-10 max-w-7xl mx-auto px-4">

      <button id="finish-tournament"
        class="bg-red-600 px-6 py-2 text-xl text-white rounded hover:bg-red-700 transition w-full sm:w-auto">
        Finish Tournament
      </button>
    </div>

    <!-- MODAL - ADD PLAYER -->
    <div id="add-player-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div class="bg-[#1E1B4B] p-6 rounded space-y-4 text-center w-80">
        <p>Digite o nome do jogador:</p>
        <input type="text" id="player-name" class="w-full border text-black rounded px-2 py-1" />
        <div class="flex justify-around">
          <button id="cancel-add-player" class="bg-red-500 px-4 py-2 text-white rounded">Cancel</button>
          <button id="confirm-add-player" class="bg-green-500 px-4 py-2 text-white rounded">Add</button>
        </div>
      </div>
    </div>

    <!-- MODAL - GENERATING MATCHES -->
    <div id="generate-matches-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div class="bg-[#1E1B4B] p-6 rounded space-y-4 text-center w-80 text-white">
        <p id="generate-matches-message" class="text-xl">Generating matches ... </p>
        <div class="loader mx-auto"></div>
      </div>
    </div>

	<!-- MODAL - ERRORS -->
    <div id="errors-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div id="errors-box" class="bg-[#1E1B4B] p-6 rounded space-y-4 text-center w-80 text-white">
        <p id="errors-message" class="text-xl"></p>
      </div>
    </div>

	<!-- MODAL - COUNTER -->
    <div id="counter-modal" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div id="counter-box" class="bg-[#1E1B4B] p-6 rounded space-y-4 text-center w-80 text-white">
        <p id="counter-message" class="text-xl"></p>
      </div>
    </div>
	`;
	app.appendChild(main);
	setupTournamentEvents();

  const finishTournamentBtn = document.getElementById("finish-tournament");
  if (finishTournamentBtn) {
    finishTournamentBtn.addEventListener("click", async () => {
      const tournamentState = JSON.parse(localStorage.getItem("tournamentState") || "{}");
      const tournamentId = tournamentState.tournamentId;

      if (tournamentId) {
        try {
          // Save tournament data
          const rankingData = await tournamentsService.getFinalRanking(tournamentId);
          // if (rankingData.success && rankingData.data) {
          //   const flattenedRanking = rankingData.data.flat(); // Flatten the array
          //   await tournamentsService.finalizeTournament(tournamentId, {
          //     status: 'finished',
          //     ranking: flattenedRanking
          //   });
          // }

          // Redirect to ranking page with tournament ID
          window.history.pushState({}, "", `/ranking?id=${tournamentId}`);
          clearTournamentState();
          // Dynamically load and render the ranking page

          const { default: RankingPage } = await import("./ranking.ts");
          RankingPage();
        } catch (error) {
          console.error("Error finalizing tournament:", error);
          alert("Failed to finalize tournament. Please try again.");
        }
      } else {
        alert("No tournament ID found. Cannot finish tournament.");
      }
    });
  }
}
