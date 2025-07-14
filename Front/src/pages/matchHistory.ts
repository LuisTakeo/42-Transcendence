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
    const content = document.getElementById("match-history-content");

    if (response.success && response.data) {
      const matches = response.data;
      if (matches.length === 0) {
        if (content) {
          content.innerHTML = `<div class="text-center text-white text-xl py-8">No matches found.</div>`;
        }
        return;
      }
      if (content) {
        content.innerHTML = '';
        const table = createMatchHistoryTable(matches, userId);
        content.appendChild(table);
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
      if (retryButton) {
        retryButton.onclick = () => {
          content.innerHTML = `
            <div class="text-center text-white text-xl">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              Loading match history...
            </div>
          `;
          loadMatchHistory(userId);
        };
      }
    }
  }
}

function createMatchHistoryTable(matches: any[], userId: number): HTMLElement {
  // Create responsive wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'overflow-x-auto rounded-lg';
  // Create table
  const table = document.createElement('table');
  table.className = 'min-w-[600px] w-full text-center text-white rounded-lg overflow-hidden';
  // Create thead
  const thead = document.createElement('thead');
  thead.className = 'bg-[#3B3567] text-base md:text-xl uppercase';
  const headRow = document.createElement('tr');
  const headers = ['Opponent', 'Your Score', 'Opponent Score', 'Winner', 'Date'];
  headers.forEach(header => {
    const th = document.createElement('th');
    th.className = 'px-2 md:px-6 py-3';
    th.textContent = header;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  // Create tbody
  const tbody = document.createElement('tbody');
  tbody.className = 'text-base md:text-lg';
  matches.forEach((match: any) => {
    const row = document.createElement('tr');
    row.className = 'bg-[#2D2856]';
    const isPlayer1 = match.player1_id === userId;
    const opponent = isPlayer1 ? match.player2_username : match.player1_username;
    const yourScore = isPlayer1 ? match.player1_score : match.player2_score;
    const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
    const winner = match.winner_username;
    // Format date as DD/MM/YYYY HH:mm (24-hour, zero-padded)
    const dateObj = new Date(match.played_at);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    // Opponent
    const tdOpponent = document.createElement('td');
    tdOpponent.className = 'px-6 py-4';
    tdOpponent.textContent = opponent ? `@${opponent}` : '-';
    row.appendChild(tdOpponent);
    // Your Score
    const tdYourScore = document.createElement('td');
    tdYourScore.className = 'px-6 py-4';
    tdYourScore.textContent = `${yourScore} points`;
    row.appendChild(tdYourScore);
    // Opponent Score
    const tdOpponentScore = document.createElement('td');
    tdOpponentScore.className = 'px-6 py-4';
    tdOpponentScore.textContent = `${opponentScore} points`;
    row.appendChild(tdOpponentScore);
    // Winner
    const tdWinner = document.createElement('td');
    tdWinner.className = 'px-6 py-4';
    tdWinner.textContent = winner ? `@${winner}` : '-';
    row.appendChild(tdWinner);
    // Date
    const tdDate = document.createElement('td');
    tdDate.className = 'px-6 py-4';
    tdDate.textContent = formattedDate;
    row.appendChild(tdDate);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}
