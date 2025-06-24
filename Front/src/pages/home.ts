export default function HomePage(): string {
	return `
<div class="min-h-screen flex-1">
	  <div class="grid grid-cols-2 grid-rows-2 gap-[1cm] h-screen p-[1cm]">
		<!-- Botão 1 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/vector-racket.png" alt="Fast Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg">Remote </span>
		</button>

		<!-- Botão 2 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/pong-players.png" alt="Classic Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg">Local</span>
		</button>

		<!-- Botão 3 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/evilPc.png" alt="One Computer Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg">Player vs CPU</span>
		</button>

		<!-- Botão 4 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/joquempo.png" alt="Another Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg">Joqueimpô</span>
		</button>
	  </div>
	</div>
	`;}
