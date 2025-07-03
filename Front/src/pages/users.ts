import { initializeSearchButton } from "./button.ts";

export default function UsersPage(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = ""; // Limpa o conteúdo

  // const aside = document.createElement("aside");
  // aside.className = "fixed left-0 top-0 h-screen w-20 bg-[#1E1B4B] flex flex-col justify-between";
  // aside.innerHTML = `
  //   <nav class="flex flex-col items-center space-y-7 pt-6">
  //     ${["home", "profile", "settings", "users", "ranking", "logout"].map(name => `
  //       <a href="/${name}.html" class="relative hover:bg-[#383568] px-3 py-3 hover:bg-opacity-40 ease-in-out rounded-[5px] hover:scale-110 transition">
  //         <img src="./assets/${name === "logout" ? "sair-white" : name}-white.png" alt="${name}" />
  //       </a>`).join("")}
  //   </nav>
  // `;

  const main = document.createElement("main");
  main.className = "ml-24 p-[50px] flex justify-center items-center min-h-screen";
  main.innerHTML = `
    <div class="w-full px-4">
  <div class="max-w-7xl mx-auto bg-[#1E1B4B] rounded-lg p-6 md:p-10">
    <!-- Título -->
    <h1 class="text-3xl md:text-5xl font-bold mb-6 text-center text-white">
      Looking for users?
    </h1>

    <!-- Formulário de busca -->
    <form class="flex flex-col md:flex-row items-center w-full max-w-3xl mx-auto mb-10 gap-2 md:gap-0">
      <input
        type="text"
        id="searchUsers"
        placeholder="Search..."
        class="flex-1 w-full px-5 py-4 text-base md:text-xl bg-[#1E1B4B] border border-[#383568] placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 rounded md:rounded-l-[5px]"
      />
      <button
        id="searchUsersButton"
        class="w-full md:w-auto px-5 py-4 bg-[#383568] text-white font-semibold rounded md:rounded-r-[5px] md:rounded-l-none hover:bg-[#4E4A72] transition flex justify-center items-center">
        <img src="../../assets/find.png" alt="Find" class="w-6 h-6" />
      </button>
    </form>

    <!-- Resultados -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
      ${[1, 2, 3, 4, 5, 6].map(i => `
        <div class="w-full max-w-sm p-6 bg-[#383568] rounded-lg text-white shadow hover:shadow-xl transition">
          <h3 class="text-xl md:text-2xl font-bold mb-2">Result ${i}</h3>
          <p>Description for result ${i}...</p>
        </div>
      `).join("")}
    </div>
  </div>
</div>

  `;

  app.appendChild(main);

  // Inicializa os event listeners após o HTML ser renderizado
  initializeSearchButton();

  const input = document.getElementById("searchUsers") as HTMLInputElement;
  const button = document.getElementById("searchUsersButton") as HTMLButtonElement;

  button?.addEventListener("click", () => {
    alert(`Procurando por: ${input?.value}`);
    // aqui você pode manipular os dados e popular #results dinamicamente
  });
}
