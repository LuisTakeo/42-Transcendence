export default function HowToPlay(): void {
	const app = document.getElementById("app");
  	if (!app) return;

	app.innerHTML = ""; // Clear existing content

	const main = document.createElement("main");
	main.className = "min-h-screen flex flex-col justify-center items-center  overflow-hidden mt-4 gap-4";
	main.innerHTML =`
	<div class="flex flex-wrap justify-center gap-8 items-stretch max-w-6xl w-full px-6 py-10">
		<!-- PLAYER 1 -->
		<div class="flex-1 min-w-[280px] max-w-[400px] bg-[#1E1B4B] p-8 rounded text-white text-center flex flex-col justify-center">
			<p class="text-4xl md:text-5xl mb-4">Player on the left</p>
			<p class="text-3xl md:text-3xl flex items-center justify-center gap-2 flex-wrap">
				Use the keys 
				<span class="key">W</span>
				and 
				<span class="key">S</span>
				to move.
			</p>
		</div>

		<!-- PLAYER 2 -->
		<div class="flex-1 min-w-[280px] max-w-[400px] bg-[#1E1B4B] p-8 rounded text-white text-center flex flex-col justify-center">
			<p class="text-4xl md:text-5xl mb-4">Player on the right</p>
			<p class="text-3xl md:text-3xl flex items-center justify-center gap-2 flex-wrap">
				Use the arrows 
				<span class="key">↑</span>
				and 
				<span class="key">↓</span>
				to move.
			</p>
		</div>
	</div>

	<!-- BOTÃO START -->
	<div class="mt-6 mb-8">
		<button class="p-6 bg-green-600 hover:bg-green-700 text-white text-2xl md:text-3xl font-bold py-4 px-10 rounded transition">
			Start
		</button>
	</div>

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
	body {
		overflow:hidden;
	}
	</style>

	`;
	app.appendChild(main);

}