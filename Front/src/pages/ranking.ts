import { usersService } from "../services/users.service.ts";
import { userService } from "../services/user.service.ts";
import { rankingService, RankingUser } from "../services/ranking.service.ts";
import { friendsService } from "../services/friends.service.ts";
import { showSuccessMessage, showErrorMessage } from './notification.ts';
import { tournamentsService } from "../services/tournaments.service.ts";

let rankingData: RankingUser[] = [];


const RESERVED_USER_IDS = [4, 5];

function filterReservedUsers(users: any[]): any[] {
  return users.filter(user => !RESERVED_USER_IDS.includes(user.id));
}

function renderRows(tournamentId?: number | null): string {
  if (tournamentId) {
    return rankingData
      .map((u, index) => `
      <tr class="bg-[#2D2856]">
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.position || index + 1}.</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.username}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.totalMatches || 0}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.wins || 0}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${(u.totalMatches || 0) - (u.wins || 0)}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.tournamentPoints || 0}</td>
      </tr>`).join("");
  }
  return filterReservedUsers(rankingData)
    .map(
      (u, index) => `
      <tr class="bg-[#2D2856]">
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.position || index + 1}.</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.username}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.totalMatches || 0}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.wins || 0}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.points ?? '-'}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">
          <button class="profile-btn" data-user-id="${u.id || u.username}" title="Go to user profile"><img src="../../assets/arrow.png" alt="go to user profile" class="w-6 h-6 sm:w-8 sm:h-8"/></button>
        </td>
      </tr>`
    )
    .join("");
}

export default async function RankingPage(): Promise<void> {
  // Route protection: require authentication
  const currentUser = await userService.requireAuth();
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const tournamentIdParam = urlParams.get('id');
  const tournamentId = tournamentIdParam ? parseInt(tournamentIdParam) : null;


  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = ""; // Clear existing content

  const main = document.createElement("main");
  main.className = "main-content p-4 md:p-8 lg:p-12 flex justify-center items-center min-h-screen";

  const titleText = tournamentId ? "Tournament Ranking" : "Global Ranking";

  main.innerHTML = `
    <div class="w-full md:p-2 lg:p-12 bg-[#1E1B4B] rounded-lg p-8">
      ${tournamentId ? `
        <div class="mb-4">
          <button id="back-to-global" class="text-purple-400 hover:text-purple-300 transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Global Ranking
          </button>
        </div>
      ` : ''}
      <h1 class="text-5xl font-bold mb-6 text-center">${titleText}</h1>
      ${tournamentId ? `<p class="text-center text-gray-300 mb-4">Tournament ID: ${tournamentId}</p>` : ''}
      <div class="w-full max-w-4xl mx-auto mt-10">
        <div id="ranking-content">
          <div class="text-center text-white text-xl">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading ranking...
          </div>
        </div>
      </div>
    </div>
  `;

  app.appendChild(main);

  if (tournamentId) {
    const backButton = document.getElementById('back-to-global');
    backButton?.addEventListener('click', () => {
      window.history.pushState({}, '', '/ranking');
      RankingPage(); // Reload page without query params
    });
  }


  // Load ranking data
  loadRanking(tournamentId);

  // Add event delegation for profile navigation buttons
  const mainContainer = document.querySelector('.main-content');
  if (mainContainer) {
    mainContainer.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      // Check if the clicked element or its parent has the profile-btn class
      let buttonElement = target;
      if (!buttonElement.classList.contains('profile-btn')) {
        buttonElement = target.closest('.profile-btn') as HTMLElement;
      }

      if (buttonElement) {
        const userId = buttonElement.getAttribute('data-user-id');
        if (!userId) return;

        const userIdNum = parseInt(userId);

        if (buttonElement.classList.contains('profile-btn')) {
          usersService.navigateToProfile(userIdNum);
        }
      }
    });
  }
}

async function loadRanking(tournamentId: number | null): Promise<void> {
  try {
    let response;
    const rankingContent = document.getElementById('ranking-content');

    if (tournamentId) {
      // Load tournament ranking using the service
      response = await tournamentsService.getFinalRanking(tournamentId);

      console.log(response);
      if (response.success && response.data) {
        // Transform tournament data to match RankingUser interface
        rankingData = response.data.map((player: any, index: number) => ({
          position: player.rank || (index + 1),
          id: player.user_id,
          username: player.username,
          name: player.name,
          totalMatches: player.totalMatches || 0,
          wins: player.victories,
          winRate: 0,
          tournamentPoints: player.points,
          pointsDiff: player.diff,
          pointsMade: player.made
        }));

        // Sort by rank to ensure correct order
        rankingData.sort((a, b) => a.position - b.position);
      } else {
        throw new Error('Failed to load tournament ranking data');
      }
    } else {
      // Load global ranking
      response = await rankingService.getRanking();

      if (response.success && response.data) {
        rankingData = response.data;
      } else {
        throw new Error('Failed to load global ranking data');
      }
    }

    if (rankingContent) {
      rankingContent.innerHTML = `
        <div id="ranking-content" class="overflow-x-auto">
          <table class="w-full min-w-full text-center text-white rounded-lg overflow-hidden">
            <thead class="bg-[#3B3567] text-2xl uppercase">
              <tr>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Pos</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">User</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Matches</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Wins</th>
                ${!tournamentId ? '<th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Points</th>' : ''}
                ${tournamentId ? '<th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Defeats</th>' : '<th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Profile</th>'}
                ${tournamentId ? '<th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Points</th>' : ''}
              </tr>
            </thead>
            <tbody class="text-2xl">
              ${renderRows(tournamentId)}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading ranking:', error);
    const rankingContent = document.getElementById('ranking-content');
    if (rankingContent) {
      const errorMessage = tournamentId ? 'tournament ranking' : 'ranking';
      rankingContent.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p class="text-red-400 mb-2">Error loading ${errorMessage}</p>
          <p class="text-gray-400 text-sm">${error instanceof Error ? 'Not Found' : 'Unknown error'}</p>
          ${tournamentId ? `
            <button id="back-to-global-error" class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition mr-2">
              Back to Global Ranking
            </button>
          ` : ''}
          <button id="retry-ranking" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Retry
          </button>
        </div>
      `;

      const retryButton = document.getElementById("retry-ranking");
      retryButton?.addEventListener("click", () => {
        rankingContent.innerHTML = `
          <div class="text-center text-white text-xl">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading ranking...
          </div>
        `;
        loadRanking(tournamentId);
      });

      if (tournamentId) {
        const backErrorButton = document.getElementById('back-to-global-error');
        backErrorButton?.addEventListener('click', () => {
          window.history.pushState({}, '', '/ranking');
          RankingPage();
        });
      }
    }
  }
}
