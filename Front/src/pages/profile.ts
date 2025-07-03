export default function ProfilePage(): string {
	return `
	<main class=" p-4 box-border min-h-screen flex flex-col gap-2 container mx-auto">
	  <div class="flex flex-col md:flex-row gap-10 w-full p-8">
		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] min-h-[350px] flex flex-col items-center justify-center">
		  <div class="w-36 h-36 rounded-full overflow-hidden bg-white mt-6 mb-6">
			<img src="../../assets/minecraft.jpg" alt="Usuário" class="object-cover w-full h-full" />
		  </div>
		  <p class="text-white text-2xl font-semibold mb-4">username</p>
		  
		  <div class="flex flex-wrap items-center justify-center text-white gap-5 text-center">
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/battle.png" alt="battle icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">10</p>
				<p class="text-lg sm:text-2xl">battles</p>
			</div>
			<div class="text-4xl sm:text-6xl font-light px-2 select-none">|</div>
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/win.png" alt="win icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">5</p>
				<p class="text-lg sm:text-2xl">wins</p>
			</div>
			<div class="text-4xl sm:text-6xl font-light px-2 select-none">|</div>
			<div class="flex flex-col items-center space-y-1 min-w-[80px]">
				<img src="../../assets/percent.png" alt="win rate icon" class="mx-auto w-6 sm:w-8 h-6 sm:h-8 mb-2" />
				<p class="text-2xl sm:text-4xl font-bold">6</p>
				<p class="text-lg sm:text-2xl whitespace-nowrap">win‑rate</p>
			</div>
			</div>

		</div>

		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] min-h-[350px] p-4 flex flex-col">
		  <h1 class="text-4xl font-bold text-center p-2">Battles</h1>
		  <div class="max-h-[40vh] md:max-h-none overflow-y-auto md:overflow-visible p-2"">
			<table class="w-full border-separate border-spacing-y-4">
			  <tbody>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 4 x 0 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
				<tr class="bg-[#383568] text-xl md:text-2xl rounded-[5px] ">
				  <td class="py-4 px-3 text-center rounded-[5px]">
					nome de usuario 0 x 3 nome oponente
				  </td>
				</tr>
			  </tbody>
			</table>
		  </div>
		</div>
	  </div>

	  
	  <div class="flex flex-col w-full p-6 bg-[#383568] max-h-[70vh] rounded-[5px]">
		<div class="bg-[#383568] rounded-[5px] w-full flex flex-wrap gap-4 p-2 overflow-auto max-h-[60vh]">
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/padlock.png" alt="padlock" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">two-factor authentication.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/friend-big.png" alt="people" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Make a friend.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/reward.png" alt="reward" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Win 3 matches.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/podio-big.png" alt="rank" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Be among the top ranked.</p>
			</div>
			<div class="bg-[#1E1B4B] flex-1 basis-[200px] max-w-[300px] h-[200px] rounded-[5px] flex flex-col items-center justify-center p-4">
			<img src="../../assets/people-big.png" alt="people" class="w-24 h-auto object-contain" />
			<p class="text-center text-white text-xl sm:text-2xl mt-4">Make more than 3 friends.</p>
			</div>
		</div>
	  </div>

	</main>
	`;
  }
