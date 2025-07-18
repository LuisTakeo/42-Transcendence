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
		<button class="p-4 mb-12 border-2 border-[#1E1B4B] rounded-xl border-spacing-2 bg-green-600 hover:bg-green-700 text-white text-2xl md:text-3xl font-bold transition">
			Start
		</button>

	<style>
	.key {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		margin: 0 0.2rem;
		border-radius: 0.25rem;
		background-color: #ffffff22;
		border: 1px solid #ffffff66;
		font-weight: bold;
		font-family: monospace;
	} 
	</style>

	`;
	app.appendChild(main);

}