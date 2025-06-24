export default function HomePage(): string {
	return `
<div class="min-h-screen flex-1 p-10">
	  <div class="grid grid-cols-2 grid-rows-2 gap-8 h-full">
		<!-- Botão 1 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden">
		  <img src="../../assets/vector-racket.png" alt="Fast Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-2xl font-bold">Fast Game</span>
		</button>

		<!-- Botão 2 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden">
		  <img src="../../assets/pong-players.png" alt="Classic Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-2xl font-bold">Classic Game</span>
		</button>

		<!-- Botão 3 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden">
		  <img src="../../assets/pong-racket.png" alt="One Computer Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-2xl font-bold">One Computer Game</span>
		</button>

		<!-- Botão 4 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden">
		  <img src="../../assets/joquempo.png" alt="Another Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <span class="relative z-10 text-white text-2xl font-bold">Another Game</span>
		</button>
	  </div>
	</div>
	`;}
