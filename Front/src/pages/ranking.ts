import { usersService } from "../services/users.service.ts";
import { userService } from "../services/user.service.ts";
import { rankingService, RankingUser } from "../services/ranking.service.ts";
import { friendsService } from "../services/friends.service.ts";
import { showSuccessMessage, showErrorMessage } from './notification.ts';

let rankingData: RankingUser[] = [];

/**
 * Check authentication and get current user.
 * Returns the current user object or null if not authenticated.
 */
async function getCurrentUser(): Promise<any | null> {
	const currentUser = await userService.requireAuth();
	if (!currentUser) {
		return null; // User will be redirected to login
	}
	return currentUser;
}

/**
 * Determine which user to show.
 * If no userId is provided, show current user.
 * Returns { targetUserId, isOwnProfile }
 */
async function getTargetUserInfo(userId?: number): Promise<{ targetUserId: number, isOwnProfile: boolean } | null> {
	const currentUser = await getCurrentUser();
	if (!currentUser) {
		return null;
	}
	const targetUserId = userId || currentUser.id;
	const isOwnProfile = targetUserId === currentUser.id;
	return { targetUserId, isOwnProfile };
}

// Helper function to get current user ID - checks authentication and returns user ID or null
async function getCurrentUserId(): Promise<number | null> {
	const currentUser = await userService.requireAuth();
	if (!currentUser) {
		return null; // User will be redirected to login if not authenticated
	}
	return currentUser.id;
}

const RESERVED_USER_IDS = [999998, 999999];

function filterReservedUsers(users: any[]): any[] {
  return users.filter(user => !RESERVED_USER_IDS.includes(user.id));
}

function renderRows(): string {
  return filterReservedUsers(rankingData)
    .map(
      (u) => `
      <tr class="bg-[#2D2856]">
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.position}.</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.username}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.totalMatches}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">${u.wins}</td>
        <td class="px-3 py-2 md:px-6 md:py-4 text-sm md:text-2xl">
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
  main.className = "main-content p-4 md:p-8 lg:p-12 flex justify-center items-center min-h-screen";
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
		<div id="ranking-content" class="overflow-x-auto">
          <table class="w-full min-w-full text-center text-white rounded-lg overflow-hidden">
            <thead class="bg-[#3B3567] text-2xl uppercase">
              <tr>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Pos</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">User</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Matches</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Wins</th>
                <th class="px-3 py-2 md:px-6 md:py-3 text-sm md:text-2xl uppercase">Options</th>
              </tr>
            </thead>
            <tbody class="text-2xl">
              ${renderRows()}
            </tbody>
          </table>
		</div>
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
    buttonElement.style.opacity = '0.5';
    buttonElement.style.pointerEvents = 'none';
    const currentUserId = await getCurrentUserId();
    if (currentUserId && userId === currentUserId) {
      showErrorMessage("You cannot add yourself as a friend!");
      return;
    }
    const testUserId = currentUserId || 999;
    const checkResponse = await friendsService.checkFriendship(testUserId, userId);
    if (checkResponse.success && checkResponse.data?.are_friends) {
      showErrorMessage("You are already friends with this user!");
      return;
    }
    const response = await friendsService.createFriendship({
      user1_id: testUserId,
      user2_id: userId
    });
    if (response.success) {
      showSuccessMessage("Friend added successfully!");
      buttonElement.style.opacity = '0.3';
      buttonElement.title = 'Already friends';
    } else {
      throw new Error('Failed to add friend');
    }
  } catch (error) {
    console.error('Error adding friend:', error);
    showErrorMessage('Failed to add friend. Please try again.');
  } finally {
    buttonElement.style.opacity = '1';
    buttonElement.style.pointerEvents = 'auto';
  }
}

async function handleRemoveFriend(userId: number, buttonElement: HTMLElement): Promise<void> {
  try {
    buttonElement.style.opacity = '0.5';
    buttonElement.style.pointerEvents = 'none';
    const currentUserId = await getCurrentUserId();
    if (currentUserId && userId === currentUserId) {
      showErrorMessage("You cannot remove yourself!");
      return;
    }
    const testUserId = currentUserId || 999;
    const checkResponse = await friendsService.checkFriendship(testUserId, userId);
    if (!checkResponse.success || !checkResponse.data?.are_friends) {
      showErrorMessage("You are not friends with this user!");
      return;
    }
    // Actually perform the removal, no confirmation
    const response = await friendsService.deleteFriendship(testUserId, userId);
    if (response.success) {
      showSuccessMessage("Friend removed successfully!");
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
    showErrorMessage(`Failed to remove friend: ${errorMessage}`);
  } finally {
    buttonElement.style.opacity = '1';
    buttonElement.style.pointerEvents = 'auto';
  }
}
