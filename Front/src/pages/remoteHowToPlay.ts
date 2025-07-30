import { userService } from "../services/user.service.ts";
import "../style.css";

export default async function RemoteHowToPlay(): Promise<void> {
  // Route protection: require authentication
  const currentUser = await userService.requireAuth();
  if (!currentUser) {
	  window.location.href = '/login';
	  return;
  }

	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = ""; // Clear existing content

	const main = document.createElement("main");
	main.className = "min-h-screen flex flex-col justify-center items-center mt-0 gap-2";
	main.innerHTML =`
	<div class="flex justify-center gap-10 max-w-xl w-full px-4 py-10 mx-auto p-6">
		<div class="flex-1 min-w-[250px] max-w-[1000px] bg-[#1E1B4B] p-10 rounded-2xl text-white text-center flex flex-col items-center gap-6">
			<img src="../../assets/perfil-2.png" class="max-w-full mb-4" />
			<p class="text-4xl font-semibold md:text-5xl">How To Play</p>
			<p class="text-2xl md:text-3xl flex items-center justify-center gap-2 flex-wrap">
			Use the keys
			<span class="key">↑</span>
			and
			<span class="key">↓</span>
			to move.
			</p>
		</div>
	</div>

	<!-- BOTÃO START -->
		<button id="start-btn" class="p-4 mb-12 border-2 border-[#1E1B4B] rounded-xl border-spacing-2 bg-green-600 hover:bg-green-700 text-white text-2xl md:text-3xl font-bold transition">
			Start
		</button>

	`;
	app.appendChild(main);

	// Add event listener to Start button to navigate to /game/local using SPA routing
	const startBtn = document.getElementById("start-btn");
	if (startBtn) {
	startBtn.addEventListener("click", () => {
		const query = window.location.search; // Get current query params, e.g. "?foo=bar"
		window.history.pushState({}, '', `/game/online${query}`);
		window.dispatchEvent(new Event('popstate'));
	});
  }
}
