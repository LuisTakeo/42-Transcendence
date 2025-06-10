export default function LoginPage(): string {
	return `
	<div class="flex items-center justify-between h-screen bg-[#1E1B4B]">
	  <!-- Lado esquerdo – texto e botões -->
	  <div class="w-1/2 p-8 flex flex-col justify-center items-center">
		<div class="text-center mb-6">
		  <h1 class="text-3xl text-white font-bold font-spartan mb-4">
			Can you hang the pong?
		  </h1>
		  <p class="text-xl text-white font-spartan mb-8">
			Let's have some fun
		  </p>
		</div>

		<button
		  class="w-[300px] flex items-center justify-center gap-2 px-6 py-3
				 bg-[#383568] text-xl text-white border-2 border-transparent
				 rounded-[5px] shadow-md transition duration-200 ease-in-out
				 hover:scale-105 hover:border-white mb-4">
		  Sign&nbsp;In&nbsp;with&nbsp;Google
		  <img src="../../assets/google-logo.png" alt="Google icon" class="w-5 h-5" />
		</button>

		<button
		  class="w-[300px] flex items-center justify-center gap-2 px-6 py-3
				 bg-[#383568] text-xl text-white border-2 border-transparent
				 rounded-[5px] shadow-md transition duration-200 ease-in-out
				 hover:scale-105 hover:border-white">
		  Sign&nbsp;In&nbsp;with&nbsp;Intra
		  <img src="../../assets/42.png" alt="42 icon" class="w-7 h-5" />
		</button>
	  </div>

	  <!-- Lado direito – imagem -->
	  <div class="w-1/2 h-full">
		<img src="../../assets/player-female.png"
			 alt="Jogadora de Pong"
			 class="w-full h-full object-cover" />
	  </div>
	</div>
	`;
  }
