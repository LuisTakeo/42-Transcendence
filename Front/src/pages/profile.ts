import { userService } from "../services/user.service.ts";
import { showErrorMessage } from './notification.ts';
import { renderAchievements } from "./cards.ts";
import { friendsService } from '../services/friends.service.ts';

const RESERVED_USER_IDS = [4, 5];

interface Match {
  player2_id: number;
  player2_alias: string;
  opponentUsername?: string;
}

function getOpponentDisplayName(match: Match, playerId: number): string {
  if (RESERVED_USER_IDS.includes(match.player2_id)) {
    return match.player2_alias;
  }
  return match.opponentUsername || match.player2_alias || 'Unknown';
}

export default async function ProfilePage(userId?: number): Promise<void> {
  // Route protection: require authentication
  const currentUser = await userService.requireAuth();
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }
  if (userId && RESERVED_USER_IDS.includes(userId)) {
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `<div class='flex justify-center items-center min-h-screen'><div class='text-2xl text-red-400'>This profile is not available.</div></div>`;
    }
    return;
  }
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  // Show loading spinner while fetching user data
  app.innerHTML = `<div class="flex justify-center items-center min-h-screen"><div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>`;

  // Determine which user to show - if no userId provided, show current user
  const targetUserId = userId || currentUser.id;
  const isOwnProfile = targetUserId === currentUser.id;

  // Fetch user data before rendering the profile
  const userToLoad = targetUserId || currentUser.id;
  let user;
  try {
    user = (userToLoad === currentUser.id)
      ? currentUser
      : await userService.getUserById(userToLoad);
    if (!user) throw new Error('User not found');
  } catch (error) {
    showErrorMessage('Failed to load user profile.');
    return;
  }

  // Now render the profile page with the loaded user data
  app.innerHTML = ""; // Clear loading spinner
  const main = document.createElement("main");
  main.className = "p-4 box-border min-h-screen flex flex-col gap-2 container mx-auto";
  main.innerHTML = `
    <div class="flex flex-col md:flex-row gap-10 w-full p-4">
      <div class="flex-1 bg-[#1E1B4B] rounded-[5px] h-[400px] flex flex-col items-center justify-center">
        <div class="w-36 h-36 rounded-full overflow-hidden mt-6 mb-6">
          ${user.avatar_url
            ? `<img id="user-avatar" src="${user.avatar_url}" alt="${user.username || 'User'}" class="object-cover w-full h-full" />`
            : `<div class="w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">${(user.username || user.email || '?')[0].toUpperCase()}</div>`
          }
        </div>
        <p id="user-name" class="text-white text-2xl font-semibold mb-4">${user.name || user.username || 'User'}</p>
        <p id="user-username" class="text-white text-lg mb-4">@${user.username || 'user'}</p>
        <div class="flex items-center justify-center text-white gap-5 text-center">
          <div class="flex flex-col items-center space-y-1">
            <img src="../../assets/battle.png" alt="battle icon" class="mx-auto w-8 h-8 sm:w-6 sm:h-6 mb-2" />
            <p id="total-matches" class="text-xl font-bold">-</p>
            <p class="text-xl">battles</p>
          </div>
          <div class="text-6xl font-light px-2">|</div>
          <div class="flex flex-col items-center space-y-1">
            <img src="../../assets/win.png" alt="win icon" class="mx-auto w-8 h-8 sm:w-6 sm:h-6 mb-2" />
            <p id="total-wins" class="text-xl font-bold">-</p>
            <p class="text-xl">wins</p>
          </div>
          <div class="text-6xl font-light px-2">|</div>
          <div class="flex flex-col items-center space-y-1">
            <img src="../../assets/percent.png" alt="win rate icon" class="mx-auto w-8 h-8 sm:w-6 sm:h-6 mb-2" />
            <p id="win-rate" class="text-xl font-bold">-</p>
            <p class="text-xl whitespace-nowrap">win‑rate</p>
          </div>
        </div>
      </div>

      <div class="flex-1 bg-[#1E1B4B] rounded-[5px] h-[400px] p-4 flex flex-col">
        <h1 class="text-4xl font-bold text-center p-2">Battles</h1>
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar" style="height: calc(400px - 120px);">
          <div id="matches-container">
            <div class="text-center text-white text-xl">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              Loading matches...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col w-full p-4 bg-[#383568] max-h-[50vh] overflow-hidden rounded-[5px]">
      <div class="bg-[#383568] rounded-[5px] h-[38vh] w-full flex flex-col md:flex-row  flex-warp gap-4 p-1 justify-center overflow-auto" id="achievements-container">
        <div class="bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1" id="achievement-2fa">
          <div class="flex flex-col items-center">
            <img src="../../assets/padlock.png" alt="padlock" class="w-auto max-w-[80px] h-auto object-contain" />
            <p class="text-center text-white text-xl mt-4">two-factor authentication.</p>
          </div>
          <p class="text-center text-green-400 text-lg hidden" id="achievement-2fa-status">Achieved!</p>
        </div>
        <div class="bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1" id="achievement-friend">
          <div class="flex flex-col items-center">
            <img src="../../assets/friend-big.png" alt="people" class="w-auto max-w-[80px] h-auto object-contain" />
            <p class="text-center text-white text-xl mt-4">Make a friend.</p>
          </div>
          <p class="text-center text-green-400 text-lg hidden" id="achievement-friend-status">Achieved!</p>
        </div>
        <div class="bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1" id="achievement-wins">
          <div class="flex flex-col items-center">
            <img src="../../assets/reward.png" alt="reward" class="w-auto max-w-[80px] h-auto object-contain" />
            <p class="text-center text-white text-xl mt-4">Win 3 matches.</p>
          </div>
          <p class="text-center text-green-400 text-lg hidden" id="achievement-wins-status">Achieved!</p>
        </div>
        <div class="bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1" id="achievement-rank">
          <div class="flex flex-col items-center">
            <img src="../../assets/podio-big.png" alt="rank" class="w-auto max-w-[80px] h-auto object-contain" />
            <p class="text-center text-white text-xl mt-4">Be among the top ranked.</p>
          </div>
          <p class="text-center text-green-400 text-lg hidden" id="achievement-rank-status">Achieved!</p>
        </div>
        <div class="bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1" id="achievement-friends">
          <div class="flex flex-col items-center">
            <img src="../../assets/people-big.png" alt="people" class="w-auto max-w-[80px] h-auto object-contain" />
            <p class="text-center text-white text-xl mt-4">Make more than 3 friends.</p>
          </div>
          <p class="text-center text-green-400 text-lg hidden" id="achievement-friends-status">Achieved!</p>
        </div>
      </div>
    </div>
  `;

  app.appendChild(main);

  // Load user data if userId is provided
  if (userId !== undefined && !isNaN(userId)) {
    loadUserProfile(userId, currentUser.id);
	renderAchievements(userId);
  } else {
    // Show current user's profile (you can implement this later)
    const userName = document.getElementById("user-name") as HTMLParagraphElement;
    const userUsername = document.getElementById("user-username") as HTMLParagraphElement;
    if (userName) userName.textContent = "My Profile";
    if (userUsername) userUsername.textContent = "@myprofile";
  }

  // Show a button to return to users page
  const returnButtonContainer = document.createElement('div');
  returnButtonContainer.className = 'flex flex-col items-center';
  returnButtonContainer.innerHTML = `
    <button id='back-to-users' class=' px-6 py-3 bg-[#1E1B4B] text-white rounded hover:bg-purple-700 transition text-lg'>
      Return to Users
    </button>
  `;
  main.appendChild(returnButtonContainer);

  const backBtn = document.getElementById('back-to-users');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.pushState({}, '', '/users');
      window.dispatchEvent(new Event('popstate'));
    });
  }
   //Now load the rest of the profile data (stats, matches, achievements)
  await loadUserProfile(userToLoad, currentUser);
}

async function loadUserProfile(userId: number, currentUser: any): Promise<void> {
  try {
    // Get user data
    const user = (userId === currentUser.id)
      ? currentUser
      : await userService.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update user information
    const userName = document.getElementById("user-name") as HTMLParagraphElement;
    const userUsername = document.getElementById("user-username") as HTMLParagraphElement;
    const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;

    if (userName) {
      userName.textContent = user.name || user.username || 'User';
    }
    if (userUsername) {
      userUsername.textContent = `@${user.username || 'user'}`;
    }

    if (user.avatar_url && userAvatar) {
      userAvatar.src = user.avatar_url;
      userAvatar.alt = user.username || 'User';
      userAvatar.style.display = '';

      // Add error handler for failed avatar loads
      userAvatar.onerror = () => {
        userAvatar.style.display = 'none';
        const avatarContainer = userAvatar.parentElement;
        if (avatarContainer) {
          avatarContainer.innerHTML = `
            <div class="w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
              ${(user.username || user.email || '?')[0].toUpperCase()}
            </div>
          `;
        }
      };
    } else if (userAvatar) {
      userAvatar.style.display = 'none';
      const avatarContainer = userAvatar.parentElement;
      if (avatarContainer) {
        avatarContainer.innerHTML = `
          <div class="w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
            ${(user.username || user.email || '?')[0].toUpperCase()}
          </div>
        `;
      }
    }

        // Get and update user stats
    const stats = await userService.getUserStats(userId);

    if (stats) {
      const totalMatches = document.getElementById("total-matches") as HTMLParagraphElement;
      const totalWins = document.getElementById("total-wins") as HTMLParagraphElement;
      const winRate = document.getElementById("win-rate") as HTMLParagraphElement;

      if (totalMatches) {
        totalMatches.textContent = ((stats.wins || 0) + (stats.losses || 0)).toString();
      }
      if (totalWins) {
        totalWins.textContent = (stats.wins || 0).toString();
      }
      if (winRate) {
        const total = (stats.wins || 0) + (stats.losses || 0);
        const rate = total > 0 ? Math.round((stats.wins || 0) / total * 100) : 0;
        winRate.textContent = `${rate}%`;
      }

      // Check and update achievements
	    renderAchievements(userId);

            // Update matches list
      const matchesContainer = document.getElementById("matches-container") as HTMLDivElement;
      if (stats.recentMatches && stats.recentMatches.length > 0 && matchesContainer) {
        const table = document.createElement("table");
        table.className = "w-full border-separate border-spacing-y-2";

        const tbody = document.createElement("tbody");
        stats.recentMatches.forEach((match: any, index: number) => {
          const row = document.createElement("tr");
          row.className = "bg-[#383568] text-lg md:text-xl rounded-[5px]";

          const cell = document.createElement("td");
          cell.className = "py-3 px-3 text-center rounded-[5px] text-white";
          cell.textContent = `@${match.playerUsername || '@user'} vs @${getOpponentDisplayName(match, userId)} - ( ${match.playerScore || 0}-${match.opponentScore || 0} )`;

          row.appendChild(cell);
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        matchesContainer.innerHTML = ""; // Clear existing content
        matchesContainer.appendChild(table);
      } else {
        // No matches found
        const matchesContainer = document.getElementById("matches-container") as HTMLDivElement;
        if (matchesContainer) {
          matchesContainer.innerHTML = `
            <div class="text-center text-gray-400 text-lg py-8">
              <p>No matches played yet.</p>
              <p class="text-sm mt-2">Start playing to see your battle history!</p>
            </div>
          `;
        }
      }
    } else {
      // If no stats available, show zeros
      const totalMatches = document.getElementById("total-matches") as HTMLParagraphElement;
      const totalWins = document.getElementById("total-wins") as HTMLParagraphElement;
      const winRate = document.getElementById("win-rate") as HTMLParagraphElement;

      if (totalMatches) totalMatches.textContent = "0";
      if (totalWins) totalWins.textContent = "0";
      if (winRate) winRate.textContent = "0%";

      // Show no matches message
      const matchesContainer = document.getElementById("matches-container") as HTMLDivElement;
      if (matchesContainer) {
        matchesContainer.innerHTML = `
          <div class="text-center text-gray-400 text-lg py-8">
            <p>No matches played yet.</p>
            <p class="text-sm mt-2">Start playing to see your battle history!</p>
          </div>
        `;
      }
    }

  } catch (error) {
    console.error('Error loading user profile:', error);
    showErrorMessage('Failed to load user profile.');

    // Set fallback values
    const userName = document.getElementById("user-name") as HTMLParagraphElement;
    const userUsername = document.getElementById("user-username") as HTMLParagraphElement;
    if (userName) userName.textContent = "Profile Error";
    if (userUsername) userUsername.textContent = "@error";
  }
}
