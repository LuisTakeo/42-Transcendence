// PongGame.ts
export class PongGame {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private ball: { x: number; y: number; dx: number; dy: number; radius: number };
	private paddleHeight = 80;
	private paddleWidth = 10;
	private playerY = 0;
	private enemyY = 0;
	private playerScore = 0;
	private enemyScore = 0;

	constructor(canvas: HTMLCanvasElement) {
	  this.canvas = canvas;
	  const context = canvas.getContext("2d");
	  if (!context) throw new Error("Canvas context not supported.");
	  this.context = context;

	  this.ball = {
		x: canvas.width / 2,
		y: canvas.height / 2,
		dx: 4,
		dy: 4,
		radius: 7,
	  };

	  this.reset();
	}

	public update(): void {
	  this.ball.x += this.ball.dx;
	  this.ball.y += this.ball.dy;

	  // Rebate no topo ou fundo
	  if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
		this.ball.dy *= -1;
	  }

	  // Rebate nas raquetes
	  if (
		this.ball.x - this.ball.radius <= this.paddleWidth &&
		this.ball.y > this.playerY &&
		this.ball.y < this.playerY + this.paddleHeight
	  ) {
		this.ball.dx *= -1;
	  }

	  if (
		this.ball.x + this.ball.radius >= this.canvas.width - this.paddleWidth &&
		this.ball.y > this.enemyY &&
		this.ball.y < this.enemyY + this.paddleHeight
	  ) {
		this.ball.dx *= -1;
	  }

	  // Pontuação
	  if (this.ball.x < 0) {
		this.enemyScore++;
		this.reset();
	  } else if (this.ball.x > this.canvas.width) {
		this.playerScore++;
		this.reset();
	  }

	  // Inimigo simples (segue a bola)
	  this.enemyY += (this.ball.y - this.enemyY - this.paddleHeight / 2) * 0.05;
	}

	public draw(): void {
	  const ctx = this.context;
	  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	  // Bola
	  ctx.beginPath();
	  ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
	  ctx.fill();

	  // Raquetes
	  ctx.fillRect(0, this.playerY, this.paddleWidth, this.paddleHeight); // player
	  ctx.fillRect(this.canvas.width - this.paddleWidth, this.enemyY, this.paddleWidth, this.paddleHeight); // enemy

	  // Score
	  ctx.font = "20px Arial";
	  ctx.fillText(`${this.playerScore} : ${this.enemyScore}`, this.canvas.width / 2 - 20, 20);
	}

	public movePlayer(dy: number): void {
	  this.playerY += dy;
	  this.playerY = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.playerY));
	}

	private reset(): void {
	  this.ball.x = this.canvas.width / 2;
	  this.ball.y = this.canvas.height / 2;
	  this.ball.dx *= -1;
	}
}
