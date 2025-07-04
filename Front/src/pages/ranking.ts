import { usersService } from "../services/users.service.ts";
import { rankingService, RankingUser } from "../services/ranking.service.ts";
import { friendsService } from "../services/friends.service.ts";

let rankingData: RankingUser[] = [];

// Helper function to get current user ID - in a real app this would come from auth/session
function getCurrentUserId(): number | null {
  // For testing purposes, return user ID 1
  // In a real app, this would check localStorage, sessionStorage, or auth context
  return 1; // Testing as user ID 1
}

function renderRows(): string {
  return rankingData
    .map(
      (u) => `
      <tr class="bg-[#2D2856]">
        <td class="px-6 py-4">${u.position}.</td>
        <td class="px-6 py-4">${u.username}</td>
        <td class="px-6 py-4">${u.totalMatches}</td>
        <td class="px-6 py-4">${u.wins}</td>
        <td class="px-6 py-4">
          <div class="flex gap-6 justify-center">
            <button class="add-friend-btn" data-user-id="${u.id}" title="Add friend"><img src="../../assets/add-friend.png" alt="add friend" class="w-8 h-8"/></button>
            <button class="remove-friend-btn" data-user-id="${u.id}" title="Remove friend"><img src="../../assets/remove-user.png" alt="remove friend" class="w-8 h-8"/></button>
            <button class="profile-btn" data-user-id="${u.id}" title="Go to user profile"><img src="../../assets/arrow.png" alt="go to user profile" class="w-8 h-8"/></button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

export default function RankingPage(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = ""; // Clear existing content

  const main = document.createElement("main");
  main.className = "main-content p-4 md:p-4 lg:p-10 flex justify-center items-center min-h-screen";
  main.innerHTML = `
    <div class="w-full md:p-2 lg:p-12 bg-[#1E1B4B] rounded-lg p-8">
      <h1 class="text-5xl font-bold mb-6 text-center">Ranking</h1>
      <div class="w-full max-w-3xl mx-auto mt-10">
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

  // Load ranking data
  loadRanking();

  // Add event delegation for profile navigation buttons
  const mainContainer = document.querySelector('.main-content');
  if (mainContainer) {
    mainContainer.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;

      // Check if the clicked element or its parent has the profile-btn class
      let buttonElement = target;
      if (!buttonElement.classList.contains('profile-btn') &&
          !buttonElement.classList.contains('add-friend-btn') &&
          !buttonElement.classList.contains('remove-friend-btn')) {
        buttonElement = target.closest('.profile-btn, .add-friend-btn, .remove-friend-btn') as HTMLElement;
      }

      if (buttonElement) {
        const userId = buttonElement.getAttribute('data-user-id');
        if (!userId) return;

        const userIdNum = parseInt(userId);

        if (buttonElement.classList.contains('profile-btn')) {
          usersService.navigateToProfile(userIdNum);
        } else if (buttonElement.classList.contains('add-friend-btn')) {
          await handleAddFriend(userIdNum, buttonElement);
        } else if (buttonElement.classList.contains('remove-friend-btn')) {
          await handleRemoveFriend(userIdNum, buttonElement);
        }
      }
    });
  }
}

async function loadRanking(): Promise<void> {
  try {
    const response = await rankingService.getRanking();
    const rankingContent = document.getElementById('ranking-content');

    if (response.success && response.data) {
      rankingData = response.data;

      if (rankingContent) {
        rankingContent.innerHTML = `
          <table class="w-full text-center text-white rounded-lg overflow-hidden">
            <thead class="bg-[#3B3567] text-2xl uppercase">
              <tr>
                <th class="px-6 py-3">Pos</th>
                <th class="px-6 py-3">User</th>
                <th class="px-6 py-3">Matches</th>
                <th class="px-6 py-3">Wins</th>
                <th class="px-6 py-3">Options</th>
              </tr>
            </thead>
            <tbody class="text-2xl">
              ${renderRows()}
            </tbody>
          </table>
        `;
      }
    } else {
      throw new Error('Failed to load ranking data');
    }
  } catch (error) {
    console.error('Error loading ranking:', error);
    const rankingContent = document.getElementById('ranking-content');
    if (rankingContent) {
      rankingContent.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p class="text-red-400 mb-2">Error loading ranking</p>
          <p class="text-gray-400 text-sm">Please try again later.</p>
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
        loadRanking();
      });
    }
  }
}

async function handleAddFriend(userId: number, buttonElement: HTMLElement): Promise<void> {
  try {
    // Disable button during request
    buttonElement.style.opacity = '0.5';
    buttonElement.style.pointerEvents = 'none';

    // For testing purposes when not logged in, we'll use a mock user ID
    // In a real app this would come from auth/session
    const currentUserId = getCurrentUserId(); // Helper function to get current user

    if (currentUserId && userId === currentUserId) {
      alert("You cannot add yourself as a friend!");
      return;
    }

    // If no current user (not logged in), use a test user ID for demo
    const testUserId = currentUserId || 999; // Use 999 as test user when not logged in

    // Check if already friends
    const checkResponse = await friendsService.checkFriendship(testUserId, userId);
    if (checkResponse.success && checkResponse.data?.are_friends) {
      alert("You are already friends with this user!");
      return;
    }

    // Create friendship
    const response = await friendsService.createFriendship({
      user1_id: testUserId,
      user2_id: userId
    });

    if (response.success) {
      alert("Friend added successfully!");
      // Optionally update UI to reflect the change
      buttonElement.style.opacity = '0.3';
      buttonElement.title = 'Already friends';
    } else {
      throw new Error('Failed to add friend');
    }
  } catch (error) {
    console.error('Error adding friend:', error);
    alert('Failed to add friend. Please try again.');
  } finally {
    // Re-enable button
    buttonElement.style.opacity = '1';
    buttonElement.style.pointerEvents = 'auto';
  }
}

async function handleRemoveFriend(userId: number, buttonElement: HTMLElement): Promise<void> {
  try {
    // Disable button during request
    buttonElement.style.opacity = '0.5';
    buttonElement.style.pointerEvents = 'none';

    // For testing purposes when not logged in, we'll use a mock user ID
    // In a real app this would come from auth/session
    const currentUserId = getCurrentUserId(); // Helper function to get current user

    if (currentUserId && userId === currentUserId) {
      alert("You cannot remove yourself!");
      return;
    }

    // If no current user (not logged in), use a test user ID for demo
    const testUserId = currentUserId || 999; // Use 999 as test user when not logged in

    // Only allow removing friendships where the current user is involved (more secure)
    const checkResponse = await friendsService.checkFriendship(testUserId, userId);

    if (!checkResponse.success || !checkResponse.data?.are_friends) {
      alert("You are not friends with this user!");
      return;
    }

    // Confirm removal
    const targetUser = rankingData.find(u => u.id === userId);
    const targetUsername = targetUser ? targetUser.username : `user ${userId}`;

    if (!confirm(`Are you sure you want to remove ${targetUsername} from your friends?`)) {
      return;
    }

    // Delete friendship
    const response = await friendsService.deleteFriendship(testUserId, userId);

    if (response.success) {
      alert("Friend removed successfully!");
      // Optionally update UI to reflect the change
      const addButton = buttonElement.parentElement?.querySelector('.add-friend-btn') as HTMLElement;
      if (addButton) {
        addButton.style.opacity = '1';
        addButton.title = 'Add friend';
      }
    } else {
      throw new Error(`Failed to remove friend: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error removing friend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`Failed to remove friend: ${errorMessage}`);
  } finally {
    // Re-enable button
    buttonElement.style.opacity = '1';
    buttonElement.style.pointerEvents = 'auto';
  }
}
