import { initializeSearchButton } from "./button.ts";
import { usersService, User } from "../services/users.service.ts";

export default function UsersPage(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = ""; // Limpa o conteúdo

  const main = document.createElement("main");
  main.className = "ml-24 p-[2cm] flex justify-center items-center min-h-screen";
  main.innerHTML = `
    <div class="w-full max-w-6xl bg-[#1E1B4B] rounded-lg p-8">
      <h1 class="text-5xl font-bold mb-6 text-center">Looking for users?</h1>
      <span class="block h-4"></span>

      <div class="flex justify-center mb-8">
        <div class="flex focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent rounded-[5px] transition-all duration-200">
          <input type="text" id="searchUsers" placeholder="Search by name, username, or email..."
            class="w-80 px-6 py-3 rounded-l-[5px] border border-[#383568] bg-[#383568] text-white placeholder-gray-400 focus:outline-none text-2xl [&:-webkit-autofill]:bg-[#383568] [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_#383568_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" />
          <button class="px-6 py-3 bg-[#383568] text-white font-semibold rounded-r-[5px] hover:bg-[#4E4A72] transition duration-200 ease-in-out border-l-0 border border-[#383568]"
            id="searchUsersButton">
            <img src="../../assets/find.png" alt="find">
          </button>
        </div>
      </div>

      <span class="block h-4"></span>

      <div class="grid grid-cols-1 gap-6" id="results">
        <div class="text-center text-white text-xl">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          Loading users...
        </div>
      </div>

      <div class="flex justify-center mt-8 space-x-4" id="pagination" style="display: none;">
        <button id="prevPage" class="px-4 py-2 bg-[#383568] text-white rounded hover:bg-[#4E4A72] transition disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        <span id="pageInfo" class="px-4 py-2 text-white"></span>
        <button id="nextPage" class="px-4 py-2 bg-[#383568] text-white rounded hover:bg-[#4E4A72] transition disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  `;

  app.appendChild(main);

  // Inicializa os event listeners após o HTML ser renderizado
  initializeSearchButton();

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

    resultsContainer.innerHTML = users.map(user => `
      <div class="p-6 bg-[#383568] rounded-lg text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            ${user.avatar_url
              ? `<img src="${user.avatar_url}" alt="${user.name}" class="w-16 h-16 rounded-full object-cover">`
              : `<div class=\"w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold\">${user.name.charAt(0).toUpperCase()}</div>`
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
              ${user.last_seen_at ?
                `<span class="text-sm text-gray-400">Last seen: ${new Date(user.last_seen_at).toLocaleDateString()}</span>` :
                ''
              }
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

    // Add event listeners for the newly rendered buttons
    addViewProfileListeners();
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

      const response = await usersService.getUsers(page, 10, search);

      if (response.success) {
        renderUsers(response.data);
        updatePagination(response.pagination.currentPage, response.pagination.totalPages);
        currentPage = response.pagination.currentPage;
        totalPages = response.pagination.totalPages;
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      resultsContainer.innerHTML = `
        <div class="text-center text-white text-xl py-8">
          <p class="text-red-400 mb-2">Error loading users</p>
          <p class="text-gray-400 text-sm">Please try again later.</p>
          <button id="retry-button" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
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
  let searchTimeout: number;

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

  // Add event listeners for View Profile buttons
  function addViewProfileListeners(): void {
    const viewProfileButtons = document.querySelectorAll('.view-profile-btn');
    viewProfileButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = (e.target as HTMLButtonElement).getAttribute('data-user-id');
        if (userId) {
          usersService.navigateToProfile(parseInt(userId));
        }
      });
    });
  }

  // Load initial users
  loadUsers();

  // Add event listeners after initial load
  setTimeout(addViewProfileListeners, 100);
}
