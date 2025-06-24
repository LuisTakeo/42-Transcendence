type RankingUser = {
  position: number;
  username: string;
  matches: number;
  wins: number;
};

const rankingData: RankingUser[] = [
  { position: 1, username: "bda-mota", matches: 10, wins: 5 },
  { position: 2, username: "beatz.mota", matches: 10, wins: 3 },
  { position: 3, username: "texugo", matches: 8, wins: 2 },
];

function renderRows(): string {
  return rankingData
    .map(
      (u) => `
      <tr class="bg-[#2D2856]">
        <td class="px-6 py-4">${u.position}.</td>
        <td class="px-6 py-4">${u.username}</td>
        <td class="px-6 py-4">${u.matches}</td>
        <td class="px-6 py-4">${u.wins}</td>
        <td class="px-6 py-4">
          <div class="flex gap-6 justify-center">
            <button><img src="../../assets/add-friend.png" alt="add friend" class="w-8 h-8"/></button>
            <button><img src="../../assets/remove-user.png" alt="remove friend" class="w-8 h-8"/></button>
            <button><img src="../../assets/arrow.png" alt="go to user profile" class="w-8 h-8"/></button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

export default function RankingPage(): string {
  return `
  <main class="ml-24 p-4 md:p-4 lg:p-10 flex justify-center items-center min-h-screen">
    <div class="w-full md:p-2 lg:p-12 bg-[#1E1B4B] rounded-lg p-8">
      <h1 class="text-5xl font-bold mb-6 text-center">Ranking</h1>
      <div class="w-full max-w-3xl mx-auto mt-10">
        <table class="w-full text-center text-white rounded-lg overflow-hidden">
          <thead class="bg-[#3B3567] text-2xl uppercase">
            <tr>
              <th class="px-6 py-3">Pos</th>
              <th class="px-6 py-3">User</th>
              <th class="px-6 py-3">Matches</th>
              <th class="px-6 py-3">Wins</th>
              <th class="px-6 py-3">Options</th>
            </tr>
          </thead>
          <tbody class="text-2xl">
            ${renderRows()}
          </tbody>
        </table>
      </div>
    </div>
  </main>`;
}
