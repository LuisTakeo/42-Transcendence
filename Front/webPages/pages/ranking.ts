
export default function RankingPage(): string {
	return `
	<div class="flex items-center justify-center min-h-screen bg-[#1E1B4B]">
	  <div class="w-[90%] max-w-6xl bg-[#1E1B4B] text-white font-spartan mt-20">
		<h1 class="text-5xl mb-10 text-center font-bold">Ranking</h1>
		<div class="overflow-x-auto rounded-lg shadow-lg">
		  <table class="min-w-full text-left text-2xl">
			<thead class="bg-[#5B539C] text-white">
			  <tr>
				<th scope="col" class="px-6 py-4">Posição</th>
				<th scope="col" class="px-6 py-4">Usuário</th>
				<th scope="col" class="px-6 py-4">Partidas</th>
				<th scope="col" class="px-6 py-4">Vitórias</th>
				<th scope="col" class="px-6 py-4">Opções</th>
			  </tr>
			</thead>
			<tbody>
			  ${renderTableRows()}
			</tbody>
		  </table>
		</div>
	  </div>
	</div>
	`;
  }