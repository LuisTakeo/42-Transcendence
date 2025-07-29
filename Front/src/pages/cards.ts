import { usersService } from "../services/users.service";


export function createAchievementCard(title: string, imgSrc: string, isUnlocked: boolean): string {
	const baseClasses = `
	   bg-[#1E1B4B] rounded-[5px] flex flex-col items-center justify-center p-4 cursor-pointer transition w-full md:w-auto md:flex-1
	`;
	const unlockedClasses = "opacity-100 hover:scale-105";
	const lockedClasses = "opacity-40";

	return `
	  <div class="${baseClasses} ${isUnlocked ? unlockedClasses : lockedClasses} snap-center min-w-[220px]">
		<img src="${imgSrc}" alt="${title}" class="w-auto max-w-[80px] h-auto object-contain" />
		<p class="text-center text-white text-xl mt-4">${title}</p>
		${isUnlocked ? `<p class="text-green-400 mt-2">Achieved!</p>` : ''}
	  </div>
	`;
  }


export async function renderAchievements(userId: number) {
	const RESERVED_USER_IDS = [4, 5];
	if (RESERVED_USER_IDS.includes(userId)) {
	  const container = document.getElementById('achievements-container');
	  if (container) container.innerHTML = `<div class='text-center text-gray-400'>No achievements for this user.</div>`;
	  return;
	}
	try {
	  const responseUserStats = await usersService.getUserStats(userId); // Ajuste conforme seu serviço
	  const userStats = responseUserStats.data;

	  // FAZER VALIDAÇAO AQUI E SE N DER SUCESSO EXIBIR SEM INFORMAÇOES

	  const achievementsHTML = `
		<div class="bg-[#383568] rounded-[5px] w-full flex flex-row flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible gap-4 p-4 snap-x snap-mandatory">
		  ${createAchievementCard("two-factor authentication.", "../../assets/padlock.png", userStats.twoFactorEnabled)}
		  ${createAchievementCard("Make a friend.", "../../assets/friend-big.png", userStats.friendsCount >= 1)}
		  ${createAchievementCard("Win 3 matches.", "../../assets/reward.png", userStats.totalWins >= 3)}
		  ${createAchievementCard("Be among the top ranked.", "../../assets/podio-big.png", userStats.topRanked)}
		  ${createAchievementCard("Make more than 3 friends.", "../../assets/people-big.png", userStats.friendsCount > 3)}
		</div>
	  `;

	  const container = document.getElementById('achievements-container');
	  if (container) container.innerHTML = achievementsHTML;

	} catch (error) {
	  console.error("Erro ao carregar conquistas", error);
	}
}
