import { usersService, User } from '../services/users.service.ts';
import { userService } from '../services/user.service.ts';

export default function UsersPage(): string {
  return `
    <main class="px-4 md:px-[50px] py-8 flex justify-center items-start min-h-screen">
      <div class="w-full max-w-6xl bg-[#1E1B4B] p-4 sm:p-6 md:p-8">
        <!-- Título -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-center">Looking for users?</h1>

        <span class="block h-4"></span>

        <!-- Search Field -->
        <div class="flex justify-center items-stretch sm:items-center gap-2 sm:gap-0 mb-8">
          <input
            type="text"
            id="searchUsers"
            placeholder="Search..."
            class="flex-1 min-w-0 sm:w-auto sm:max-w-sm px-4 py-2 sm:px-6 sm:py-2 rounded sm:rounded-l-[5px] border border-[#383568] bg-[#1E1B4B] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-base sm:text-lg md:text-xl"/>

          <button class="px-4 sm:px-6 py-2 sm:py-3 bg-[#383568] text-white font-semibold rounded sm:rounded-r-[5px] hover:bg-[#4E4A72] transition duration-200 ease-in-out"
            id="searchUsersButton">
            <img src="../../assets/find.png" alt="search" class="w-8 h-10 sm:w-6 sm:h-6">
          </button>

        </div>

        <span class="block h-4"></span>

        <!-- research results -->
        <div id="results" class="grid grid-cols-1 gap-6">
          <!-- Users will be loaded here -->
        </div>

        <!-- Pagination -->
        <div id="pagination" class="flex items-center justify-center mt-8 space-x-4">
          <button
            id="prevPage"
            class="px-4 py-2 bg-[#383568] text-white rounded hover:bg-[#4E4A72] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>

          <span id="pageInfo" class="text-white"></span>
          
		  <button
            id="nextPage"
            class="px-4 py-2 bg-[#383568] text-white rounded hover:bg-[#4E4A72] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
		  
        </div>
      </div>
    </main>
  `;
}

// Initialize users page with functionality
export async function initializeUsersPage(): Promise<void> {
  // Check authentication
  const user = await userService.requireAuth();
  if (!user) {
    return; // User will be redirected to login
  }

  function formatLastSeen(lastSeenAt: string): string {
    if (!lastSeenAt) return 'Unknown';
    const lastSeen = new Date(lastSeenAt);
    if (isNaN(lastSeen.getTime())) return 'Unknown';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }

  function showErrorMessage(message: string): void {
    // You can implement a toast notification here if needed
    console.error(message);
  }

  // State management
  let currentPage = 1;
  let currentSearch = "";
  let totalPages = 1;

  const input = document.getElementById("searchUsers") as HTMLInputElement;
  const button = document.getElementById("searchUsersButton") as HTMLButtonElement;
  const resultsContainer = document.getElementById("results") as HTMLDivElement;
  const paginationContainer = document.getElementById("pagination") as HTMLDivElement;
  const prevButton = document.getElementById("prevPage") as HTMLButtonElement;
  const nextButton = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLSpanElement;

  const RESERVED_USER_IDS = [4, 5];

  function filterReservedUsers(users: any[]): any[] {
    return users.filter(user => !RESERVED_USER_IDS.includes(user.id));
  }

  // Function to render user cards
  function renderUsers(users: User[]): void {
    if (users.length === 0) {
      resultsContainer.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p>No users found matching your search.</p>
          <p class="text-gray-400 mt-2">Try a different search term.</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filterReservedUsers(users).map(user => `
      <div class="p-4 bg-[#383568] rounded-lg text-white shadow-lg hover:shadow-2xl transition">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" alt="${user.name}" class="w-16 h-16 rounded-full object-cover avatar-image" data-user-name="${user.name}" data-avatar-url="${user.avatar_url}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                 <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold" style="display: none;">${user.name.charAt(0).toUpperCase()}</div>`
              : `<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">${user.name.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-semibold mb-1 truncate">${user.name}</h3>
            <p class="text-gray-300 text-lg mb-1">@${user.username}</p>
            <p class="text-gray-400 text-sm mb-2">${user.email}</p>
            <div class="flex items-center space-x-4">
              <span class="flex items-center space-x-1">
                <div class="w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}"></div>
                <span class="text-sm">${user.is_online ? 'Online' : 'Offline'}</span>
              </span>
              ${!user.is_online && user.last_seen_at
                ? `<span class="text-sm text-gray-400">Last seen: ${formatLastSeen(user.last_seen_at as string)}</span>`
                : ''}
            </div>
          </div>
          <div class="flex-shrink-0">
            <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition duration-200 text-sm view-profile-btn" data-user-id="${user.id}">
              View Profile
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Function to update pagination
  function updatePagination(currentPage: number, totalPages: number): void {
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }

    paginationContainer.style.display = 'flex';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
  }

  // Function to load users
  async function loadUsers(page: number = 1, search: string = ""): Promise<void> {
    try {
      // Show loading state
      resultsContainer.innerHTML = `
        <div class="text-center text-white text-xl">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          ${search ? 'Searching...' : 'Loading users...'}
        </div>
      `;

      // Get current user to filter them out
      const currentUser = await userService.getCurrentUser();

      const response = await usersService.getUsers(page, 10, search);

      if (response.success) {
        // Filter out the current user from the results
        let usersToShow = response.data;
        if (currentUser) {
          usersToShow = response.data.filter(user => user.id !== currentUser.id);
        }

        renderUsers(usersToShow);
        updatePagination(response.pagination.currentPage, response.pagination.totalPages);
        currentPage = response.pagination.currentPage;
        totalPages = response.pagination.totalPages;
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showErrorMessage('Failed to load users. Please try again.');
      resultsContainer.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p class="text-red-400 mb-2">Error loading users</p>
          <p class="text-gray-400 text-sm">Please try again later.</p>
          <button id="retry-button" class="mt-4 px-4 py-2 bg-[#383568] text-white rounded hover:bg-[#4E4A72] transition">
            Retry
          </button>
        </div>
      `;
      const retryButton = document.getElementById("retry-button");
      retryButton?.addEventListener("click", () => {
        location.reload();
      });
    }
  }

  // Debounce function to limit API calls
  let searchTimeout: ReturnType<typeof setTimeout>;

  function debouncedSearch(searchTerm: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = searchTerm;
      currentPage = 1;
      loadUsers(currentPage, searchTerm);
    }, 300); // 300ms delay
  }

  // Dynamic search as user types
  input?.addEventListener("input", (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.trim();
    debouncedSearch(searchTerm);
  });

  // Search button (still works for immediate search)
  button?.addEventListener("click", () => {
    const searchTerm = input?.value.trim() || "";
    clearTimeout(searchTimeout); // Cancel any pending search
    currentSearch = searchTerm;
    currentPage = 1;
    loadUsers(currentPage, searchTerm);
  });

  // Enter key search
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const searchTerm = input.value.trim() || "";
      clearTimeout(searchTimeout); // Cancel any pending search
      currentSearch = searchTerm;
      currentPage = 1;
      loadUsers(currentPage, searchTerm);
    }
  });

  // Pagination
  prevButton?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadUsers(currentPage, currentSearch);
    }
  });

  nextButton?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadUsers(currentPage, currentSearch);
    }
  });

  // Add event delegation for View Profile buttons
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Check if the clicked element or its parent has the view-profile-btn class
    let buttonElement = target;
    if (!buttonElement.classList.contains('view-profile-btn')) {
      buttonElement = target.closest('.view-profile-btn') as HTMLElement;
    }

    if (buttonElement && buttonElement.classList.contains('view-profile-btn')) {
      const userId = buttonElement.getAttribute('data-user-id');
      if (userId) {
        usersService.navigateToProfile(parseInt(userId));
      }
    }
  });

  // Load initial users
  loadUsers();
}
