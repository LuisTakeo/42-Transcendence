import "./editField.ts";
import "./twoFactor.ts";

export default function SettingsPage(): string {
	return `
	<main class="flex min-h-screen p-10">
	  <div class="flex w-full gap-8">

		<!-- Caixa 1 -->
		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] p-6 ">
		  <div class="w-36 h-36 rounded-full overflow-hidden bg-white mt-6 mb-2 mx-auto relative group">
			<img id="profile-pic" src="../../assets/minecraft.jpg" alt="Usuário"
			  class="object-cover w-full h-full" />

			<div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
			  <button id="change-pic-btn" class="text-white font-semibold text-lg px-3 py-1 bg-[#4A4580] rounded hover:bg-[#5C5599]">
				Edit photo
			  </button>
			</div>

			<input id="file-input" type="file" accept="image/*" class="hidden" />
		  </div>

		  <div class="w-full mb-2 p-6">
			<label class="block text-lg mb-1">Name</label>
			<div class="flex items-center gap-2">
			  <input id="nameInput" type="text" value="Beatriz Mota"
				class="w-full px-4 py-2 rounded-[5px] bg-[#383568] text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500"
				disabled />

			  <button data-id="nameInput"
				class="edit-btn w-10 h-10 p-1 bg-[#4A4580] rounded-[5px] hover:bg-[#5C5599] transition flex items-center justify-center">
				<img src="../../assets/lapis.png" alt="Editar" class="w-6 h-6" />
			  </button>
			</div>
		  </div>

		  <div class="w-full mb-2 p-6">
			<label class="block text-lg mb-1">Username</label>
			<div class="flex items-center gap-2">
			  <input id="usernameInput" type="text" value="Bellatrix"
				class="w-full px-4 py-2 rounded-[5px] bg-[#383568] text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-500"
				disabled />

			  <button data-id="usernameInput"
				class="edit-btn w-10 h-10 p-1 bg-[#4A4580] rounded-[5px] hover:bg-[#5C5599] transition flex items-center justify-center">
				<img src="../../assets/lapis.png" alt="Editar" class="w-6 h-6" />
			  </button>
			</div>
		  </div>

		  <div id="two-factor-section" class="bg-[#1E1B4B] p-6 rounded-lg w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Security</h2>

			<div id="2fa-status" class="mb-4 text-lg text-gray-300">
			  Two-factor authentication is not enabled.
			</div>

			<button id="activate-2fa-btn"
			  class="bg-[#383568] hover:bg-[#4a4480] transition px-4 py-2 rounded-md text-white font-medium shadow-sm hover:shadow-lg">
			  Enable two-factor authentication
			</button>

			<div id="2fa-input-section" class="mt-4 hidden">
			  <label for="2fa-code" class="block mb-2 text-lg">Enter the code you received:</label>
			  <input
				type="text"
				id="2fa-code"
				class="w-full px-3 py-2 rounded-md bg-gray-100 text-black focus:outline-none"
				placeholder="123456"
			  />
			  <button id="confirm-2fa-btn"
				class="mt-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-md text-white font-medium">
				Confirm
			  </button>
			</div>
		  </div>
		</div>

		<!-- Caixa 2 -->
		<div class="flex-1 bg-[#1E1B4B] rounded-[5px] p-12">
		  <h1 class="text-5xl text-white font-bold flex justify-center mb-6">Friends</h1>

		  <div class="space-y-2">
			<div class="flex items-center justify-between bg-[#383568] p-4 rounded-lg">
			  <img src="../../assets/minecraft.jpg" alt="Amigo" class="w-12 h-12 rounded-full object-cover" />
			  <span class="text-white text-lg mx-4 flex-1">amiga_1</span>
			  <button class="text-red-400 hover:text-red-600 text-xl">&#10006;</button>
			</div>

			<div class="flex items-center justify-between bg-[#383568] p-4 rounded-lg">
			  <img src="../../assets/minecraft.jpg" alt="Amigo" class="w-12 h-12 rounded-full object-cover" />
			  <span class="text-white text-lg mx-4 flex-1">amiga_2</span>
			  <button class="text-red-400 hover:text-red-600 text-xl">&#10006;</button>
			</div>
		  </div>
		</div>

	  </div>
	</main>
	`;
  }
