import { matchesService } from "../services/matches.service.ts";
import { userService } from "../services/user.service.ts";
import { showErrorMessage } from "./notification.ts";

export default async function MatchHistoryPage(): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;

  // Check authentication and get current user
  const currentUser = await userService.requireAuth();
  if (!currentUser) return;

  app.innerHTML = "";

  const main = document.createElement("main");
  main.className = "main-content p-4 md:p-4 lg:p-10 flex justify-center items-center min-h-screen";
  main.innerHTML = `
    <div class="w-full md:p-2 lg:p-12 bg-[#1E1B4B] rounded-lg p-4 md:p-8">
      <h1 class="text-3xl md:text-5xl font-bold mb-6 text-center">Match History</h1>
      <div class="w-full max-w-3xl mx-auto mt-6 md:mt-10">
        <div id="match-history-content" class="overflow-x-auto rounded-lg">
          <div class="text-center text-white text-xl">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading match history...
          </div>
        </div>
      </div>
    </div>
  `;

  app.appendChild(main);

  // Load match history data
  loadMatchHistory(currentUser.id);
}

async function loadMatchHistory(userId: number): Promise<void> {
  try {
    const response = await matchesService.getPlayerMatches(userId);
    console.log('API response for match history:', response);
    const content = document.getElementById("match-history-content");

    if (response.success && response.data) {
      const matches = response.data;
      console.log('Matches array:', matches);
      if (matches.length === 0) {
        if (content) {
          content.innerHTML = `<div class="text-center text-white text-xl py-8">No matches found.</div>`;
        }
        return;
      }
      if (content) {
        content.innerHTML = `
          <div class="overflow-x-auto rounded-lg">
            <table class="min-w-[600px] w-full text-center text-white rounded-lg overflow-hidden">
              <thead class="bg-[#3B3567] text-base md:text-xl uppercase">
                <tr>
                  <th class="px-2 md:px-6 py-3">Opponent</th>
                  <th class="px-2 md:px-6 py-3">Your Score</th>
                  <th class="px-2 md:px-6 py-3">Opponent Score</th>
                  <th class="px-2 md:px-6 py-3">Winner</th>
                  <th class="px-2 md:px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody class="text-base md:text-lg">
                ${matches.map((m: any) => renderMatchRow(m, userId)).join("")}
              </tbody>
            </table>
          </div>
        `;
      }
    } else {
      throw new Error("Failed to load match history");
    }
  } catch (error) {
    console.error("Error loading match history:", error);
    const content = document.getElementById("match-history-content");
    if (content) {
      content.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p class="text-red-400 mb-2">Error loading match history</p>
          <p class="text-gray-400 text-sm">Please try again later.</p>
          <button id="retry-match-history" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Retry
          </button>
        </div>
      `;
      const retryButton = document.getElementById("retry-match-history");
      retryButton?.addEventListener("click", () => {
        content.innerHTML = `
          <div class="text-center text-white text-xl">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading match history...
          </div>
        `;
        loadMatchHistory(userId);
      });
    }
  }
}

function renderMatchRow(match: any, userId: number): string {
  const isPlayer1 = match.player1_id === userId;
  const opponent = isPlayer1 ? match.player2_username : match.player1_username;
  const yourScore = isPlayer1 ? match.player1_score : match.player2_score;
  const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
  const winner = match.winner_username;
  // Simple format: DD/MM/YYYY HH:mm (24-hour, zero-padded)
  const dateObj = new Date(match.played_at);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
  return `
    <tr class="bg-[#2D2856]">
      <td class="px-6 py-4">@${opponent}</td>
      <td class="px-6 py-4">${yourScore} points</td>
      <td class="px-6 py-4">${opponentScore} points</td>
      <td class="px-6 py-4">@${winner}</td>
      <td class="px-6 py-4">${formattedDate}</td>
    </tr>
  `;
}
