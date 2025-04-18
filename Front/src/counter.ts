export class Counter {
	private count: number = 0;
	private counterElement: HTMLDivElement;

	constructor() {
	  this.counterElement = document.createElement('div');
	  this.render();
	  this.setupListeners();

	  const app = document.getElementById('app');
	  if (app) {
		app.appendChild(this.counterElement);
	  }
	}

	private increment(): void {
	  this.count++;
	  this.updateDisplay();
	}

	private decrement(): void {
	  this.count--;
	  this.updateDisplay();
	}

	private reset(): void {
	  this.count = 0;
	  this.updateDisplay();
	}

	private updateDisplay(): void {
	  const display = this.counterElement.querySelector('span');
	  if (display) {
		display.textContent = this.count.toString();
	  }
	}

	private render(): void {
	  this.counterElement.className = 'p-4 bg-gray-50 rounded-lg shadow-sm';
	  this.counterElement.innerHTML = `
		<h2 class="text-xl font-bold text-gray-700 mb-4">Contador</h2>
		<div class="flex items-center justify-center space-x-4 mb-4">
		  <button id="decrement" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">-</button>
		  <span class="text-2xl font-bold">${this.count}</span>
		  <button id="increment" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">+</button>
		</div>
		<button id="reset" class="w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">Resetar</button>
	  `;
	}

	private setupListeners(): void {
	  const incrementBtn = this.counterElement.querySelector('#increment');
	  const decrementBtn = this.counterElement.querySelector('#decrement');
	  const resetBtn = this.counterElement.querySelector('#reset');

	  if (incrementBtn) {
		incrementBtn.addEventListener('click', () => this.increment());
	  }

	  if (decrementBtn) {
		decrementBtn.addEventListener('click', () => this.decrement());
	  }

	  if (resetBtn) {
		resetBtn.addEventListener('click', () => this.reset());
	  }
	}
  }