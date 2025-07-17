import { userService } from '../services/user.service.ts';

export default function HomePage(): string {
	return `
	<div class="min-h-screen flex-1">
	  <div class="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 h-auto min-h-screen">
		<!-- Botão 1 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/raquet.png" alt="Fast Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <div class="absolute inset-0 bg-[#1E1B4B] opacity-10 hover:opacity-70 transition duration-00"></div>  
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg pointer-events-none">Remote </span>
		</button>

		<!-- Botão 2 -->
		<button id="how-to-play" class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/pong-players-happy.png" alt="Classic Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <div class="absolute inset-0 bg-[#1E1B4B] opacity-10 hover:opacity-70 transition duration-300"></div>  
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg pointer-events-none">Local</span>
		</button>

		<!-- Botão 3 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/evilPc.png" alt="One Computer Game" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <div class="absolute inset-0 bg-[#1E1B4B] opacity-10 hover:opacity-70 transition duration-300"></div>  
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg pointer-events-none">Player vs CPU</span>
		</button>

		<!-- Botão 4 -->
		<button class="h-full relative flex flex-col items-center justify-center
		  bg-[#1E1B4B] hover:bg-[#4A4180] rounded-[5px]
		  transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
		  <img src="../../assets/tournament-league-cut.png" alt="league" class="absolute inset-0 w-full h-full object-cover opacity-60" />
		  <div class="absolute inset-0 bg-[#1E1B4B] opacity-10 hover:opacity-70 transition duration-300"> </div>
		  <span class="relative z-10 text-white text-4xl font-bold drop-shadow-lg pointer-events-none">Tournament</span>
		</button>
	  </div>
	</div>
	`;
}

// Initialize home page with user data
export async function initializeHomePage(): Promise<void> {
  // Check authentication and get user
  const user = await userService.requireAuth();
  if (!user) {
    return; // User will be redirected to login
  }

  // The home page doesn't need any special initialization
  // User data will be handled by the sidebar or other components
}
