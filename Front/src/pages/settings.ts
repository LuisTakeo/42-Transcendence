import { initializeEditField } from "./editField.ts";
import { initializeTwoFactor } from "./twoFactor.ts";
import { friendsService } from "../services/friends.service.ts";
import { usersService } from "../services/users.service.ts";
import { userService } from "../services/user.service.ts";
import { getBaseUrl } from "../services/base-api.ts";
import { showSuccessMessage, showErrorMessage } from './notification.ts';

export default async function SettingsPage(): Promise<void> {
	const app = document.getElementById("app");
	if (!app) return;

	// Show loading spinner while fetching user data
	app.innerHTML = `<div class="flex justify-center items-center min-h-screen"><div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>`;

	// Fetch user data
	let user;
	try {
		user = await userService.getCurrentUser();
		if (!user) throw new Error('No authenticated user found');
	} catch (error) {
		showErrorMessage('Failed to load user data. Please try again.');
		return;
	}

	// Now render the settings page with the loaded user data
	app.innerHTML = `
	<main class="flex min-h-screen p-10">
	  <div class="flex w-full gap-8">

		<!-- Caixa 1 -->
		<div class="w-full md:flex-1 bg-[#1E1B4B] rounded-[5px] p-6">
		  <div class="w-36 h-36 rounded-full overflow-hidden bg-white mt-6 mb-2 mx-auto relative group">
			<div id="profile-pic-container" class="w-full h-full">
				${user.avatar_url
					? `<img src="${user.avatar_url}" alt="${user.name}" class="object-cover w-full h-full" onerror="console.error('Avatar load failed:', '${user.avatar_url}'); this.style.display='none'; this.nextElementSibling.style.display='flex';">
					<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold text-white" style="display: none;">${user.name.charAt(0).toUpperCase()}</div>`
					: `<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold text-white">${user.name.charAt(0).toUpperCase()}</div>`
				}
			</div>

			<div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
			  <button id="change-pic-btn" class="text-white font-semibold text-lg px-3 py-1 bg-[#4A4580] rounded hover:bg-[#5C5599]">
				Select photo
			  </button>
			</div>

			<!--<input id="file-input" type="file" accept="image/*" class="hidden" />-- ver se isso esta usando e para que -->
		  </div>

      <div class="w-full mb-2 px-2 md:px-6">
        <label class="block text-lg mb-1">Name</label>
        <div class="flex items-center gap-2">
          <input id="nameInput" type="text" value="${user.name}"
            class="w-full px-4 py-2 rounded-[5px] bg-[#383568] text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled />
          <button data-id="nameInput"
            class="edit-btn w-10 h-10 p-1 bg-[#4A4580] rounded-[5px] hover:bg-[#5C5599] transition flex items-center justify-center">
            <img src="../../assets/lapis.png" alt="Editar" class="w-6 h-6" />
          </button>
        </div>
      </div>

		  <div class="w-full mb-2 p-6">
			<label class="block text-lg mb-1">Username</label>
			<div class="flex items-center gap-2">
			  <input id="usernameInput" type="text" value="${user.username}"
				class="w-full px-4 py-2 rounded-[5px] bg-[#383568] text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500"
				disabled />

			<!-- <button data-id="usernameInput"
				class="edit-btn w-10 h-10 p-1 bg-[#4A4580] rounded-[5px] hover:bg-[#5C5599] transition flex items-center justify-center">
				<img src="../../assets/lapis.png" alt="Editar" class="w-6 h-6" />
			  </button>
			</div> -->
		  </div>

      <div id="two-factor-section" class="bg-[#1E1B4B] p-6 rounded-lg w-full max-w-md mx-auto">
        <h2 class="text-xl font-bold mb-4">Security</h2>
        <div id="2fa-status" class="mb-4 text-lg text-gray-300">
          Two-factor authentication is not enabled.
        </div>
        <button id="activate-2fa-btn"
          class="bg-[#383568] hover:bg-[#4a4480] transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg">
          Enable two-factor authentication
        </button>
        <div id="2fa-input-section" class="mt-4 hidden">
          <label for="2fa-code" class="block mb-2 text-lg">Enter the code you received:</label>
          <input
            type="text"
            id="2fa-code"
            class="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none"
            placeholder="123456"
          />
          <button id="confirm-2fa-btn"
            class="mt-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-md text-white font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>

		<!-- Caixa 2 -->
		<div class="w-full md:flex-1 bg-[#1E1B4B] rounded-[5px] p-6">
		  <h1 class="text-4xl md:text-5xl text-white font-bold text-center mb-6">Friends</h1>

		  <div id="friends-container" class="space-y-2">
			<div class="text-center text-white text-xl">
			  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
			  Loading friends...
			</div>
		  </div>
		</div>

	  </div>
	</main>

	<!-- Avatar Selection Modal -->
	<div id="avatar-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
		<div class="bg-[#1E1B4B] rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-3xl font-bold text-white">Choose Your Avatar</h2>
				<button id="close-modal" class="text-white hover:text-gray-300 text-2xl font-bold">
					&times;
				</button>
			</div>

			<div id="avatar-grid" class="grid grid-cols-4 gap-4">
				<!-- Avatars will be loaded here -->
			</div>

			<div class="flex justify-end mt-6">
				<button id="cancel-avatar" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2">
					Cancel
				</button>
			</div>
		</div>
	</div>
	`;

	// Load friends
	loadFriends();
	setupFriendDeleteHandlers();

	// Inicializa as funcionalidades após renderizar o HTML
	setTimeout(() => {
		initializeEditField();
		initializeTwoFactor();
		initializeAvatarSelection();
	}, 0);
}

// Function to set up event delegation for delete friend buttons
function setupFriendDeleteHandlers(): void {
	const friendsContainer = document.getElementById('friends-container');
	if (!friendsContainer) return;

	friendsContainer.addEventListener('click', async (e) => {
		const target = e.target as HTMLElement;

		// Check if the clicked element is a delete friend button
		if (target.classList.contains('delete-friend-btn')) {
			const userId1 = target.getAttribute('data-user-id1');
			const userId2 = target.getAttribute('data-user-id2');

			if (userId1 && userId2) {
				// Show confirmation dialog
				const confirmed = confirm('Are you sure you want to remove this friend?');
				if (confirmed) {
					try {
						// Disable button while processing
						target.style.opacity = '0.5';
						target.style.pointerEvents = 'none';

						const response = await friendsService.deleteFriendship(parseInt(userId1, 10), parseInt(userId2, 10));
						if (response.success) {
							showSuccessMessage('Friend removed successfully!');
							// Reload the friends list to update the DOM
							await loadFriends();
						} else {
							showErrorMessage('Failed to remove friend. Please try again.');
						}
					} catch (error) {
						console.error('Error deleting friendship:', error);
						showErrorMessage('Failed to remove friend. Please try again.');
					} finally {
						// Re-enable button
						target.style.opacity = '1';
						target.style.pointerEvents = 'auto';
					}
				}
			}
		}
	});
}

// Function to update 2FA status UI based on user's current state
function update2FAStatus(isEnabled: boolean): void {
	const statusElement = document.getElementById('2fa-status');
	const enableButton = document.getElementById('activate-2fa-btn');
	const inputSection = document.getElementById('2fa-input-section');

	if (!statusElement || !enableButton || !inputSection) return;

	if (isEnabled) {
		// User has 2FA enabled
		statusElement.textContent = 'Two-factor authentication is enabled.';
		statusElement.className = 'mb-4 text-lg text-green-400';
		enableButton.textContent = 'Disable two-factor authentication';
		enableButton.className = 'bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg';
		inputSection.classList.add('hidden');
	} else {
		// User doesn't have 2FA enabled
		statusElement.textContent = 'Two-factor authentication is not enabled.';
		statusElement.className = 'mb-4 text-lg text-gray-300';
		enableButton.textContent = 'Enable two-factor authentication';
		enableButton.className = 'bg-[#383568] hover:bg-[#4a4480] transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg';
		inputSection.classList.add('hidden');
	}
}

// Helper function to get current user ID - checks authentication and returns user ID or null
async function getCurrentUserId(): Promise<number | null> {
	const currentUser = await userService.requireAuth();
	if (!currentUser) {
		return null; // User will be redirected to login if not authenticated
	}
	return currentUser.id;
}

async function loadCurrentUser(): Promise<void> {
	try {
		// Get the current user directly from the user service
		const user = await userService.getCurrentUser();

		if (!user) {
			throw new Error('No authenticated user found');
		}

		const profilePicContainer = document.getElementById('profile-pic-container');
		const nameInput = document.getElementById('nameInput') as HTMLInputElement;
		const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;

		if (!profilePicContainer || !nameInput || !usernameInput) return;

		// Update profile photo - backend now returns full URLs
		if (user.avatar_url) {
			profilePicContainer.innerHTML = `
				<img src="${user.avatar_url}" alt="${user.name}" class="object-cover w-full h-full" onerror="console.error('Avatar load failed:', '${user.avatar_url}'); this.style.display='none'; this.nextElementSibling.style.display='flex';">
				<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold text-white" style="display: none;">${user.name.charAt(0).toUpperCase()}</div>
			`;
		} else {
			profilePicContainer.innerHTML = `
				<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold text-white">${user.name.charAt(0).toUpperCase()}</div>
			`;
		}

		// Update form fields and store original values
		nameInput.value = user.name;
		nameInput.dataset.originalValue = user.name;
		usernameInput.value = user.username;
		usernameInput.dataset.originalValue = user.username;

		// Update 2FA status based on user data
		update2FAStatus(user.two_factor_enabled === 1);

	} catch (error) {
		console.error('Error loading current user:', error);
		showErrorMessage('Failed to load user data. Please try again.');
	}
}

async function loadFriends(): Promise<void> {
	try {
		// Get current user ID using the helper function
		const currentUserId = await getCurrentUserId();

		if (!currentUserId) {
			throw new Error('No user ID found');
		}

		const friendsResponse = await friendsService.getFriendsByUser(currentUserId);

		if (!friendsResponse.success || !friendsResponse.data) {
			throw new Error('Failed to load friends');
		}

		const friends = friendsResponse.data;
		const friendsContainer = document.getElementById('friends-container');

		if (!friendsContainer) return;

		if (friends.length === 0) {
			friendsContainer.innerHTML = `
				<div class="text-center text-white text-xl py-8">
					<p>No friends yet.</p>
					<p class="text-gray-400 mt-2">Add some friends to see them here!</p>
				</div>
			`;
			return;
		}

		// Get all unique user IDs from friends
		const userIds = new Set<number>();
		for (const friend of friends) {
			if (friend.user1_id !== currentUserId) userIds.add(friend.user1_id);
			if (friend.user2_id !== currentUserId) userIds.add(friend.user2_id);
		}

		// Get user details for all friends
		const usersResponse = await usersService.getAllUsers();
		const users = usersResponse.success ? usersResponse.data : [];
		const userMap = new Map(users.map(user => [user.id, user]));

		// Render friends
		friendsContainer.innerHTML = friends.map(friend => {
			const friendId = friend.user1_id === currentUserId ? friend.user2_id : friend.user1_id;
			const friendUser = userMap.get(friendId);

			if (!friendUser) {
				return `
					<div class="flex items-center justify-between bg-[#383568] p-4 rounded-lg friend-entry">
						<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
							?
						</div>
						<span class="text-white text-lg mx-4 flex-1">Unknown User</span>
						<button class="text-red-400 hover:text-red-600 text-xl transition-colors delete-friend-btn" data-user-id1="${currentUserId}" data-user-id2="${friendId}">&#10006;</button>
					</div>
				`;
			}

			const displayName = friendUser.name || friendUser.username || 'Unknown User';

			return `
				<div class="flex items-center justify-between bg-[#383568] p-4 rounded-lg friend-entry">
					<div class="flex-shrink-0">
						${friendUser.avatar_url
							? `<img src="${friendUser.avatar_url}" alt="${displayName}" class="w-12 h-12 rounded-full object-cover" onerror="console.error('Friend avatar load failed for ${displayName}:', '${friendUser.avatar_url}'); this.style.display='none'; this.nextElementSibling.style.display='flex';">
							   <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold" style="display: none;">${displayName.charAt(0).toUpperCase()}</div>`
							: `<div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">${displayName.charAt(0).toUpperCase()}</div>`
						}
					</div>
					<span class="text-white text-lg mx-4 flex-1">${displayName}</span>
					<button class="text-red-400 hover:text-red-600 text-xl transition-colors delete-friend-btn" data-user-id1="${currentUserId}" data-user-id2="${friendId}">&#10006;</button>
				</div>
			`;
		}).join('');

	} catch (error) {
		console.error('Error loading friends:', error);
		showErrorMessage('Failed to load friends. Please try again.');
		const friendsContainer = document.getElementById('friends-container');
		if (friendsContainer) {
			friendsContainer.innerHTML = `
				<div class="text-center text-white text-xl py-8">
					<p class="text-red-400 mb-2">Error loading friends</p>
					<p class="text-gray-400 text-sm">Please try again later.</p>
					<button onclick="location.reload()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
						Retry
					</button>
				</div>
			`;
		}
	}
}

function initializeAvatarSelection(): void {
	const changePicBtn = document.getElementById('change-pic-btn') as HTMLButtonElement;
	const modal = document.getElementById('avatar-modal');
	const closeModal = document.getElementById('close-modal');
	const cancelBtn = document.getElementById('cancel-avatar');
	const avatarGrid = document.getElementById('avatar-grid');

	if (!changePicBtn || !modal || !closeModal || !cancelBtn || !avatarGrid) return;

	// Load avatars into the grid
	loadAvatarOptions();

	// Handle edit photo button click
	changePicBtn.addEventListener('click', () => {
		modal.classList.remove('hidden');
	});

	// Handle close modal
	closeModal.addEventListener('click', () => {
		modal.classList.add('hidden');
	});

	// Handle cancel button
	cancelBtn.addEventListener('click', () => {
		modal.classList.add('hidden');
	});

	// Handle clicking outside modal
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.classList.add('hidden');
		}
	});

	// Handle escape key
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
			modal.classList.add('hidden');
		}
	});
}

function loadAvatarOptions(): void {
	const avatarGrid = document.getElementById('avatar-grid');
	if (!avatarGrid) return;

	// Show loading state
	avatarGrid.innerHTML = `
		<div class="col-span-4 text-center text-white text-xl py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
			Loading avatars...
		</div>
	`;

	// Fetch avatars dynamically from backend
	fetchAvatarsFromBackend();
}

async function fetchAvatarsFromBackend(): Promise<void> {
	const avatarGrid = document.getElementById('avatar-grid');
	if (!avatarGrid) return;

	try {
		const response = await usersService.getAvailableAvatars();

		if (!response.success || !response.data) {
			throw new Error('Failed to load avatars');
		}

		const avatarOptions = response.data;

		// Create avatar grid
		avatarGrid.innerHTML = avatarOptions.map((avatarName, index) => `
			<div class="flex flex-col items-center">
				<button
					class="avatar-option w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all duration-200 hover:scale-110"
					data-avatar="${avatarName}"
					title="Avatar ${index + 1}"
				>
					<img
						src="${getBaseUrl()}/public/avatars/${avatarName}"
						alt="Avatar ${index + 1}"
						class="w-full h-full object-cover"
						onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
					/>
					<div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg" style="display: none;">
						${String.fromCharCode(65 + index)} <!-- A, B, C, etc. -->
					</div>
				</button>
			</div>
		`).join('');

		// Add click handlers for avatar selection
		avatarGrid.addEventListener('click', async (e) => {
			const target = e.target as HTMLElement;
			const avatarButton = target.closest('.avatar-option') as HTMLElement;

			if (avatarButton) {
				const avatarName = avatarButton.getAttribute('data-avatar');
				if (avatarName) {
					await selectAvatar(avatarName);
				}
			}
		});

	} catch (error) {
		console.error('Error loading avatars:', error);
		avatarGrid.innerHTML = `
			<div class="col-span-4 text-center text-white text-xl py-8">
				<p class="text-red-400 mb-2">Error loading avatars</p>
				<p class="text-gray-400 text-sm">Please try again later.</p>
				<button onclick="location.reload()" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
					Retry
				</button>
			</div>
		`;
		showErrorMessage('Failed to load avatars. Please try again.');
	}
}

async function selectAvatar(avatarName: string): Promise<void> {
	try {
		// Show loading state
		const changePicBtn = document.getElementById('change-pic-btn') as HTMLButtonElement;
		if (changePicBtn) {
			changePicBtn.textContent = 'Updating...';
			changePicBtn.disabled = true;
		}

		// Save to backend first
		await saveAvatarUrl(avatarName);

		// Reload current user to get the updated avatar URL from backend
		await loadCurrentUser();

		// Close modal
		const modal = document.getElementById('avatar-modal');
		if (modal) {
			modal.classList.add('hidden');
		}

		// Show success message
		showSuccessMessage('Avatar updated successfully!');
	} catch (error) {
		console.error('Error updating avatar:', error);
		showErrorMessage('Failed to update avatar. Please try again.');
	} finally {
		// Reset button state
		const changePicBtn = document.getElementById('change-pic-btn') as HTMLButtonElement;
		if (changePicBtn) {
			changePicBtn.textContent = 'Select Photo';
			changePicBtn.disabled = false;
		}
	}
}

async function saveAvatarUrl(avatarName: string): Promise<void> {
	try {
		// Update user's avatar_url using the user service
		const updatedUser = await userService.updateProfile({
			avatar_url: avatarName
		});

		if (!updatedUser) {
			throw new Error('Failed to save avatar URL');
		}
	} catch (error) {
		console.error('Error saving avatar URL:', error);
		showErrorMessage('Failed to save avatar. Please try again.');
	}
}
