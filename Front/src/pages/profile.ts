import { usersService } from "../services/users.service.ts";
import { matchesService } from "../services/matches.service.ts";

export default function ProfilePage(userId?: number): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = ""; // Clear existing content

  const main = document.createElement("main");
  main.className = "p-4 box-border min-h-screen flex flex-col gap-2 container mx-auto";
  main.innerHTML = `
    <div class="flex flex-col md:flex-row gap-10 w-full p-8">
		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] min-h-[350px] flex flex-col items-center justify-center">
		  <div class="w-36 h-36 rounded-full overflow-hidden bg-white mt-6 mb-6">
			<img src="../../assets/minecraft.jpg" alt="Usuário" class="object-cover w-full h-full" />
		  </div>
		  <p class="text-white text-2xl font-semibold mb-4">username</p>
		  
		  <div class="flex flex-wrap items-center justify-center text-white gap-5 text-center">
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/battle.png" alt="battle icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">10</p>
				<p class="text-lg sm:text-2xl">battles</p>
			</div>
			<div class="text-4xl sm:text-6xl font-light px-2 select-none">|</div>
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/win.png" alt="win icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">5</p>
				<p class="text-lg sm:text-2xl">wins</p>
			</div>
			<div class="text-4xl sm:text-6xl font-light px-2 select-none">|</div>
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/percent.png" alt="win rate icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">6</p>
				<p class="text-lg sm:text-2xl whitespace-nowrap">win‑rate</p>
			</div>
			</div>

		</div>

		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] min-h-[350px] p-4 flex flex-col">
		  <h1 class="text-4xl font-bold text-center p-2">Battles</h1>
		  <div class="max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible p-2"">
			<table class="w-full border-separate border-spacing-y-4">
			  <tbody>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 4 x 0 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
			  </tbody>
			</table>
		  </div>
		</div>
	  </div>

	  
	  <div class="flex flex-col w-full p-6 bg-[#383568] max-h-[70vh] rounded-[5px]">
		<div class="bg-[#383568] rounded-[5px] w-full flex flex-wrap gap-4 p-2 overflow-auto max-h-[60vh]">
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/padlock.png" alt="padlock" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">two-factor authentication.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/friend-big.png" alt="people" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Make a friend.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/reward.png" alt="reward" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Win 3 matches.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/podio-big.png" alt="rank" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Be among the top ranked.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/people-big.png" alt="people" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Make more than 3 friends.</p>
			</div>
		</div>
	  </div>
  `;

  app.appendChild(main);

  // Load user data if userId is provided
  if (userId !== undefined && !isNaN(userId)) {
    loadUserProfile(userId);
  } else {
    // Show current user's profile (you can implement this later)
    const userName = document.getElementById("user-name") as HTMLParagraphElement;
    const userUsername = document.getElementById("user-username") as HTMLParagraphElement;
    if (userName) userName.textContent = "My Profile";
    if (userUsername) userUsername.textContent = "@myprofile";
  }

  // Show a button to return to users page
  const returnButtonContainer = document.createElement('div');
  returnButtonContainer.className = 'flex flex-col items-center mt-8';
  returnButtonContainer.innerHTML = `
    <button id='back-to-users' class='mt-4 px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-lg'>
      Return to Users
    </button>
  `;
  app.appendChild(returnButtonContainer);

  const backBtn = document.getElementById('back-to-users');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.pushState({}, '', '/users');
      window.dispatchEvent(new Event('popstate'));
    });
  }
}

async function loadUserProfile(userId: number): Promise<void> {
  try {
    const [userResponse, statsResponse, matchesResponse] = await Promise.all([
      usersService.getUserById(userId),
      matchesService.getPlayerStats(userId),
      matchesService.getPlayerMatches(userId)
    ]);

    if (userResponse.success && userResponse.data) {
      const user = userResponse.data;

      // Update user information
      const userName = document.getElementById("user-name") as HTMLParagraphElement;
      const userUsername = document.getElementById("user-username") as HTMLParagraphElement;
      const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;

      if (userName) userName.textContent = user.name;
      if (userUsername) userUsername.textContent = `@${user.username}`;

      if (user.avatar_url && userAvatar) {
        userAvatar.src = user.avatar_url;
        userAvatar.alt = user.name;
        userAvatar.style.display = '';

        // Add error handler for failed avatar loads
        userAvatar.onerror = () => {
          userAvatar.style.display = 'none';
          const avatarContainer = userAvatar.parentElement;
          if (avatarContainer) {
            avatarContainer.innerHTML = `
              <div class="w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                ${user.name.charAt(0).toUpperCase()}
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
              ${user.name.charAt(0).toUpperCase()}
            </div>
          `;
        }
      }
    } else {
      throw new Error('Failed to load user profile');
    }

    // Update match statistics
    if (statsResponse.success && statsResponse.data) {
      const stats = statsResponse.data;

      const totalMatches = document.getElementById("total-matches") as HTMLParagraphElement;
      const totalWins = document.getElementById("total-wins") as HTMLParagraphElement;
      const winRate = document.getElementById("win-rate") as HTMLParagraphElement;

      if (totalMatches) totalMatches.textContent = stats.totalMatches.toString();
      if (totalWins) totalWins.textContent = stats.wins.toString();
      if (winRate) winRate.textContent = `${Math.round(stats.winRate)}%`;
        } else {
      // If no stats available, show zeros
      const totalMatches = document.getElementById("total-matches") as HTMLParagraphElement;
      const totalWins = document.getElementById("total-wins") as HTMLParagraphElement;
      const winRate = document.getElementById("win-rate") as HTMLParagraphElement;

      if (totalMatches) totalMatches.textContent = "0";
      if (totalWins) totalWins.textContent = "0";
      if (winRate) winRate.textContent = "0%";
    }

        // Update matches list
    const matchesContainer = document.getElementById("matches-container") as HTMLDivElement;
    if (matchesResponse.success && matchesResponse.data && matchesResponse.data.length > 0) {
      const matches = matchesResponse.data;

      if (matchesContainer) {
        const table = document.createElement("table");
        table.className = "w-full border-separate border-spacing-y-4";

        const tbody = document.createElement("tbody");
        matches.forEach(match => {
          const isPlayer1 = match.player1_id === userId;
          const playerName = isPlayer1 ? match.player1_name : match.player2_name;
          const opponentName = isPlayer1 ? match.player2_name : match.player1_name;
          const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
          const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;

          const row = document.createElement("tr");
          row.className = "bg-[#383568] text-xl md:text-2xl rounded-[5px]";

          const cell = document.createElement("td");
          cell.className = "py-4 px-3 text-center rounded-[5px]";
          cell.textContent = `${playerName} ${playerScore} x ${opponentScore} ${opponentName}`;

          row.appendChild(cell);
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        matchesContainer.innerHTML = ""; // Clear existing content
        matchesContainer.appendChild(table);
      }
    } else {
      // No matches found
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
    const userName = document.getElementById("user-name") as HTMLParagraphElement;
    if (userName) userName.textContent = "User not found";
    // Immediately redirect to /users
    window.history.pushState({}, '', '/users');
    window.dispatchEvent(new Event('popstate'));
  }
}
