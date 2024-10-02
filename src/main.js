import { distance } from "./helpers";
import { ParticleGroup } from "./particle";

const canvas = document.getElementById("snek");
const ctx = canvas.getContext("2d");
const width = 500;
const height = 500;
const ratio = window.devicePixelRatio;
const EXPEREMENTALSIZECHANGE = false;


let lastTime = new Date().getTime();
let currentTime = 0;
let delta = 0;
let isGameRunning = true;
let aliveParticles = [];

// Snake stuff
const snake = {
	x: 20,
	y: 20,
	dx: 0,
	dy: 0,
	speed: 2.5, // must add to even number
	size: 20,
	tail: 0,
	history: [],
	color: "#2878fa",
};

const food = {
	x: 0,
	y: 0,
	size: 20,
	eaten: true,
	color: "#eb3d34",
	sprite: new Image(),
};

const player = {
	keyQueue: "None",
	lastMove: "None",
	queueChanged: false,
	score: 0,
};

function reset() {
	if (isGameRunning == true) return;

	snake.history = [];
	snake.tail = 0;
	snake.x = 20;
	snake.y = 20,
	snake.dx = 0;
	snake.dy = 0;


	food.eaten = true;
	player.score = 0;
	player.keyQueue = "None"
	player.lastMove = "None"
	player.queueChanged = false;
	isGameRunning = true;
	aliveParticles = [];
}

function init() {
	canvas.width = width * ratio;
	canvas.height = height * ratio;
	ctx.scale(ratio, ratio);

	food.sprite.src =
		"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4fc3574e-d2ff-4d56-8d76-66e08422a5c5/dfxqw0x-3d877eef-cdcc-4d38-9b19-066b37530e77.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzRmYzM1NzRlLWQyZmYtNGQ1Ni04ZDc2LTY2ZTA4NDIyYTVjNVwvZGZ4cXcweC0zZDg3N2VlZi1jZGNjLTRkMzgtOWIxOS0wNjZiMzc1MzBlNzcucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0._5oaER-dOeVxnmMV-BX8ve1m_JV3He35hWEaaQ9gZDA";

	window.addEventListener(
		"keydown",
		(e) => {
			let key = e.key;

			player.keyQueue = key;
			player.queueChanged = true;
		},
		false
	);

	gameLoop();
}

function gameLoop() {
	const internalGameLoop = () => {
		if (isGameRunning == false) return;

		requestAnimationFrame(internalGameLoop);

		// Calculate DeltaTime
		currentTime = new Date().getTime();
		delta = (currentTime - lastTime) / 1000;

		// Handle queued input and change snake velocity
		handleInput();

		// Spawn food if it has been eaten
		spawnNewFood();

		// Update snake history (tail)
		if (snake.history.length < snake.tail) {
			snake.history.push([snake.x, snake.y, snake.dx, snake.dy]);
		} else {
			snake.history.shift();
		}

		// Add velocity to snake position
		snake.x += snake.dx * snake.speed;
		snake.y += snake.dy * snake.speed;

		// Keep snake within canvas bounds.
		let touchedBorder = false;
		[snake.x, snake.y, touchedBorder] = keepWithinBounds(snake.x, snake.y);

		// If snake touches border: game over.
		if (touchedBorder) gameOver();

		// If snake touches itself: game over,
		if (snakeCollidesWithTail() == true) gameOver();

		// Check if snake ate food
		if (snakeCollidesWithFood() == true) {
			food.eaten = true;
			snake.tail += 5; // to account for the tail not actually being 1 grid size big
			aliveParticles.push(new ParticleGroup(food.x, food.y, 45));
			player.score += 1;
		}

		// Render current frame
		render();

		lastTime = currentTime;
	};

	requestAnimationFrame(internalGameLoop);
}

function gameOver() {
	isGameRunning = false;
	console.log("Kill yourself. NOW!!!");
	reset();
}

function render() {
	// Clear screen
	ctx.fillStyle = "#757575";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Define two shades of green
	const lightGreen = "#b2ff66"; // light green color
	const darkGreen = "#99e65b"; // darker green color

	// Loop over the canvas and fill each grid cell with alternating colors
	for (let row = 0; row < height / snake.size; row++) {
		for (let col = 0; col < width / snake.size; col++) {
			// Calculate the x and y position for each grid cell
			const x = col * snake.size;
			const y = row * snake.size;

			// Alternate between light and dark green
			if ((row + col) % 2 === 0) {
				ctx.fillStyle = lightGreen; // even cells
			} else {
				ctx.fillStyle = darkGreen; // odd cells
			}

			// Draw the rectangle (grid cell)
			ctx.fillRect(x, y, snake.size, snake.size);
		}
	}

	// Draw food
	ctx.drawImage(food.sprite, food.x, food.y, food.size, food.size);

	// Draw head
	ctx.fillStyle = snake.color;
	ctx.fillRect(snake.x, snake.y, snake.size, snake.size);

	// Draw tail
	for (const [idx, tailBox] of snake.history.slice().reverse().entries()) {
		if (EXPEREMENTALSIZECHANGE == true) {
			let sizeChange = 0;
			if (snake.history.length > 15) {
				sizeChange = Math.min(0.08 * idx, snake.size * 0.8);
			}

			// Horizontal movement
			if (Math.abs(tailBox[2]) == 1) {
				ctx.fillRect(
					tailBox[0],
					tailBox[1] + sizeChange / 2,
					snake.size - sizeChange,
					snake.size - sizeChange
				);
			}

			// Vertical movement
			if (Math.abs(tailBox[3]) == 1) {
				ctx.fillRect(
					tailBox[0] + sizeChange / 2,
					tailBox[1],
					snake.size - sizeChange,
					snake.size - sizeChange
				);
			}
			continue;
		}

		ctx.fillRect(tailBox[0], tailBox[1], snake.size, snake.size);
	}

	for (const [idx, particleGroup] of aliveParticles.entries()) {
		if (particleGroup.dead == true) {
			aliveParticles.splice(idx, 1);
		}

		particleGroup.render(ctx, delta);
	}
}

function handleInput() {
	if (snake.y % snake.size == 0) {
		switch (player.keyQueue) {
			case "ArrowLeft": {
				if (player.lastMove == "ArrowRight") break;

				snake.dy = 0;
				snake.dx = -1;
				player.queueChanged = false;
				break;
			}
			case "ArrowRight": {
				if (player.lastMove == "ArrowLeft") break;

				snake.dy = 0;
				snake.dx = 1;
				player.queueChanged = false;
				break;
			}
		}

		if (player.queueChanged == false) player.lastMove = player.keyQueue;
	}

	if (snake.x % snake.size == 0) {
		switch (player.keyQueue) {
			case "ArrowUp": {
				if (player.lastMove === "ArrowDown") break;

				snake.dy = -1;
				snake.dx = 0;
				player.queueChanged = false;
				break;
			}
			case "ArrowDown": {
				if (player.lastMove === "ArrowUp") break;

				snake.dy = 1;
				snake.dx = 0;
				player.queueChanged = false;
				break;
			}
		}

		if (player.queueChanged == false) player.lastMove = player.keyQueue;
	}
}

function spawnNewFood() {
	if (food.eaten) {
		let invalid = false;
		while (true) {
			food.x = Math.random() * width;
			food.y = Math.random() * height;

			food.x = Math.floor(food.x / food.size) * food.size;
			food.y = Math.floor(food.y / food.size) * food.size;

			for (const tail of snake.history) {
				if (tail[0] == food.x && tail[1] == food.y) {
					invalid = true;
					break;
				} else {
					invalid = false;
				}
			}

			if (invalid == false) break;
		}
		food.eaten = false;
	}
}

function snakeCollidesWithFood() {
	if (distance(snake.x - food.x, snake.y - food.y) < 10) {
		return true;
	} else {
		return false;
	}
}

function keepWithinBounds(x, y) {
	let boundedX = Math.max(Math.min(x, width - snake.size), 0);
	let boundedY = Math.max(Math.min(y, height - snake.size), 0);

	let touchedBorderX = x > width - snake.size || x < 0;
	let touchedBorderY = y > height - snake.size || y < 0;

	let touchedBorder = touchedBorderX || touchedBorderY;

	return [boundedX, boundedY, touchedBorder];
}

function snakeCollidesWithTail() {
	for (const tail of snake.history) {
		let dist = distance(Math.abs(snake.x - tail[0]), Math.abs(snake.y - tail[1]));
		if (dist < 1) {
			return true;
		}
	}

	return false;
}

init();
