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
  main.className = "ml-24 p-[2cm] flex justify-center items-center min-h-screen";
  main.innerHTML = `
    <div class="w-full max-w-6xl bg-[#1E1B4B] rounded-lg p-8">
      <h1 class="text-5xl font-bold mb-6 text-center">Looking for users?</h1>
      <span class="block h-4"></span>

      <div class="flex justify-center mb-8">
        <input type="text" id="searchUsers" placeholder="Search..."
          class="w-80 px-6 py-3 rounded-l-[5px] border border-[#383568] bg-[#1E1B4B] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-2xl" />
        <button class="px-6 py-3 bg-[#383568] text-white font-semibold rounded-r-[5px] hover:bg-[#4E4A72] transition duration-200 ease-in-out"
          id="searchUsersButton">
          <img src="../../assets/find.png" alt="find">
        </button>
      </div>

      <span class="block h-4"></span>

      <div class="grid grid-cols-1 gap-6" id="results">
        ${[1, 2, 3].map(i => `
          <div class="p-4 bg-[#383568] rounded-lg text-white shadow-lg hover:shadow-2xl transition">
            <h3 class="text-2xl font-semibold mb-2">Resultado ${i}</h3>
            <p>Descrição do ${i === 1 ? "primeiro" : i === 2 ? "segundo" : "terceiro"} resultado de pesquisa...</p>
          </div>
        `).join("")}
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
