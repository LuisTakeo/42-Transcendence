import { userService } from "../services/user.service.ts";
import { showErrorMessage } from './notification.ts';

export default async function ProfilePage(userId?: number): Promise<void> {
  const app = document.getElementById("app");
  if (!app) {
    return;
  }

  // Check authentication and get current user
  const currentUser = await userService.requireAuth();

  if (!currentUser) {
    return; // User will be redirected to login
  }

  // Determine which user to show - if no userId provided, show current user
  const targetUserId = userId || currentUser.id;
  const isOwnProfile = targetUserId === currentUser.id;

  app.innerHTML = ""; // Clear existing content

  const main = document.createElement("main");
  main.className = "p-4 box-border min-h-screen flex flex-col gap-2 container mx-auto";
  main.innerHTML = `
	  <div class="flex flex-col md:flex-row gap-10 w-full p-8">
		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] h-[400px] flex flex-col items-center justify-center">
		  <div class="w-36 h-36 rounded-full overflow-hidden mt-6 mb-6">
          <img id="user-avatar" src="../../assets/minecraft.jpg" alt="User" class="object-cover w-full h-full" />
		  </div>
        <p id="user-name" class="text-white text-2xl font-semibold mb-4">Loading...</p>
        <p id="user-username" class="text-white text-lg mb-4">@loading</p>
		  <div class="flex items-center justify-center text-white gap-5 text-center">
			<div class="flex flex-col items-center space-y-1">
			  <img src="../../assets/battle.png" alt="battle icon" class="mx-auto w-8 h-8 mb-2" />
            <p id="total-matches" class="text-4xl font-bold">-</p>
			  <p class="text-2xl">battles</p>
			</div>
			<div class="text-6xl font-light px-2">|</div>
			<div class="flex flex-col items-center space-y-1">
			  <img src="../../assets/win.png" alt="win icon" class="mx-auto w-8 h-8 mb-2" />
            <p id="total-wins" class="text-4xl font-bold">-</p>
			  <p class="text-2xl">wins</p>
			</div>
			<div class="text-6xl font-light px-2">|</div>
			<div class="flex flex-col items-center space-y-1">
			  <img src="../../assets/percent.png" alt="win rate icon" class="mx-auto w-8 h-8 mb-2" />
            <p id="win-rate" class="text-4xl font-bold">-</p>
			  <p class="text-2xl whitespace-nowrap">win‑rate</p>
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

	  <div class="flex flex-col w-full p-6 bg-[#383568] max-h-[50vh] overflow-hidden rounded-[5px]">
		<div class="bg-[#383568] rounded-[5px] w-full h-[38vh] flex flex-col md:flex-row flex-wrap gap-4 p-1 overflow-auto">
		  <div class="bg-[#1E1B4B] md:flex-1 rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/padlock.png" alt="padlock" class="w-full max-w-[100px] h-auto object-contain" />
			<p class="text-center text-white text-2xl mt-4">two-factor authentication.</p>
		  </div>
		  <div class="bg-[#1E1B4B] md:flex-1 rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/friend-big.png" alt="people" class="w-full max-w-[100px] h-auto object-contain" />
			<p class="text-center text-white text-2xl mt-4">Make a friend.</p>
		  </div>
		  <div class="bg-[#1E1B4B] md:flex-1 rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/reward.png" alt="reward" class="w-full max-w-[100px] h-auto object-contain" />
			<p class="text-center text-white text-2xl mt-4">Win 3 matches.</p>
		  </div>
		  <div class="bg-[#1E1B4B] md:flex-1 rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/podio-big.png" alt="rank" class="w-full max-w-[100px] h-auto object-contain" />
			<p class="text-center text-white text-2xl mt-4">Be among the top ranked.</p>
		  </div>
		  <div class="bg-[#1E1B4B] md:flex-1 rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/people-big.png" alt="people" class="w-full max-w-[100px] h-auto object-contain" />
			<p class="text-center text-white text-2xl mt-4">Make more than 3 friends.</p>
		  </div>
		</div>
	  </div>
  `;

  app.appendChild(main);

  // Load user data - if no userId provided, show current user
  const userToLoad = targetUserId || currentUser.id;
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
          cell.textContent = `@${match.playerUsername || '@user'} vs @${match.opponentUsername || '@unknown'} - ( ${match.playerScore || 0}-${match.opponentScore || 0} )`;

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
