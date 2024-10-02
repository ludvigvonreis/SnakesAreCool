export class GameState {
	// High scores
	score = 0;
	highScore = 0;

	// HTML Elements
	scoreText;
	highScoreText;
	modalScoreText;
	modalHighScoreText;
	restartButton;

	// Game state
	isGamePaused = true;
	isGameOver = false;
	isMenuVisible = true;
	shouldReset = false;

	constructor(
		scoreTextID,
		highScoreTextID,
		restartButtonID,
		modalScoreID,
		modalhighScoreID,
		modalID,
	) {
		this.score = 0;
		this.highScore = 0;
		this.loadHighScore();

		this.scoreText = document.getElementById(scoreTextID);
		this.highScoreText = document.getElementById(highScoreTextID);
		this.restartButton = document.getElementById(restartButtonID);
		this.modalScoreText = document.getElementById(modalScoreID);
		this.modalHighScoreText = document.getElementById(modalhighScoreID);
		this.modal = document.getElementById(modalID);

		this.restartButton.addEventListener("click", this.resetButton);

		this.updateUI();
	}

	loadHighScore = () => {
		// TODO: Fetch highscores from local storage and maybe a database.
	};

	updateUI = () => {
		this.scoreText.textContent = `🍎 ${this.score}`;
		this.highScoreText.textContent = `👑 ${this.highScore}`;
		this.modalScoreText.textContent = `🍎  ${this.score}`;
		this.modalHighScoreText.textContent = `👑 ${this.highScore}`;

		// show modal if menu should be visible
		this.modal.style.visibility = this.isMenuVisible ? "visible" : "hidden";
	};

	tick = () => {
		// Set higscore to current score if its bigger than the score
		this.highScore = Math.max(this.highScore, this.score);

		this.updateUI();
	};

	reset = () => {
		this.score = 0;
		this.shouldReset = false;
	};

	resetButton = () => {
		this.shouldReset = true;
		this.isGameOver = false;
		this.isGamePaused = false;
		this.isMenuVisible = false;
	}

	onGameOver = () => {
		this.isGameOver = true;
		this.isMenuVisible = true;
	}
}
