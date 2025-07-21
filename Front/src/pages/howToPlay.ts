import "../style.css";

export default function HowToPlay(): void {
	const app = document.getElementById("app");
  	if (!app) return;

	app.innerHTML = ""; // Clear existing content

	const main = document.createElement("main");
	main.className = "min-h-screen flex flex-col justify-center items-center mt-0 gap-2";
	main.innerHTML =`
	<div class="flex flex-wrap justify-center gap-10 items-stretch max-w-7xl w-full px-4 py-10 mx-auto">
		<!-- PLAYER 1 -->
		<div class="flex-1 min-w-[320px] max-w-[480px] bg-[#1E1B4B] p-10 rounded-2xl text-white  w-full text-center flex flex-col items-center gap-6">
			<img src="../../assets/perfil-1.png" class="max-w-full mb-4" />
			<p class="text-4xl font-semibold md:text-5xl">Player on the left</p>
			<p class="text-2xl md:text-3xl flex items-center justify-center gap-2 flex-wrap">
			Use the keys
			<span class="key">W</span>
			and
			<span class="key">S</span>
			to move.
			</p>
		</div>

		<!-- PLAYER 2 -->
		<div class="flex-1 min-w-[320px] max-w-[480px] bg-[#1E1B4B] p-10 rounded-2xl text-white text-center flex flex-col items-center gap-6">
			<img src="../../assets/perfil-2.png" class="max-w-full mb-4" />
			<p class="text-4xl font-semibold md:text-5xl">Player on the right</p>
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
			window.history.pushState({}, '', '/game/local');
			window.dispatchEvent(new Event('popstate'));
		});
	}
}
