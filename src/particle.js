import { distance, Rad2Deg, randomElement, randRange } from "./helpers";

export class ParticleGroup {
	centerX = 0;
	centerY = 0;
	// Gravity
	G = 1000; // m/s^2
	drag = 0.001;
	noiseFactor = 0.1;
	// Visual
	amount = 10;
	dead = false;

	particles = [];

	colors = [
		"#ff4500", // OrangeRed
		"#ff6347", // Tomato
		"#ff7f50", // Coral
		"#ff8c00", // DarkOrange
		"#ff5722", // Flame Red
		"#ff6f00", // Vivid Orange
		"#e65100", // Burnt Orange
		"#f4511e", // Dark Flame Orange
		"#ff3d00", // Fiery Red
		"#ff3300", // Firebrick
		"#d32f2f", // Fire Red
		"#c62828", // Dark Fire Red
		"#e53935", // Spark Red
		"#f44336", // Bright Red
		"#e64a19", // Flame Ember
		"#ff0000", // Pure Red
		"#b71c1c", // Dark Ember Red
		"#ffccbc", // Ember Glow
		"#ffab91", // Soft Ember Orange
		"#ffc107", // Amber
		"#ff9800", // Deep Flame Orange
		"#fb8c00", // Heatwave Orange
		"#f57c00", // Burnt Flame
		"#ffb74d", // Spark Ember
		"#ffa726", // Bright Ember
		"#ffcc80", // Soft Spark Orange
		"#ff7043", // Ember Flame
		"#ff5722", // Hot Ember
		"#ff9e80", // Glowing Ember
		"#e65100", // Deep Flame Orange
	];

	constructor(x, y, amount) {
		this.centerX = x;
		this.centerY = y;
		this.amount = amount;

		for (let i = 0; i < amount; i++) {
			this.particles.push(
				new Particle(
					this.centerX + randRange(-5, 5),
					this.centerY + randRange(-5, 5),
					randomElement(this.colors)
				)
			);
		}
	}

	render = (ctx, dt) => {
		let sumX = 0;
		let sumY = 0;
		let groupDead = 0; // If this stays 0 for all particles this group is dead.
		for (const particle of this.particles) {
			/// ----- Particle movemenet -----
			// 1. Quadratic Drag applied to both x and y velocities
			particle.dx = particle.dx * (1 - this.drag * Math.abs(particle.dx) * dt);
			particle.dy = particle.dy * (1 - this.drag * Math.abs(particle.dy) * dt);

			// Apply gravity to vertical velocity
			particle.dy = particle.dy + this.G * dt;

			// 3. Add Random Noise to velocities for more natural movement
			particle.dx += (Math.random() - 0.5) * this.noiseFactor;
			particle.dy += (Math.random() - 0.5) * this.noiseFactor;
			
			// 4. Update movement of particle
			particle.x += particle.dx * dt;
			particle.y += particle.dy * dt;

			/// ----- Particle lifetime -----
			particle.life -= dt * 3; // faster death
			if (particle.life > 0) {
				// Fade out by reducing opacity over time
				particle.opacity = particle.life / 5;
				groupDead += 1; // Add one if this particle is alive
			} else {
				particle.opacity = 0;  // Particle is dead (fully transparent)
			}

			/// ----- Particle rendering -----

			// Calculate velocity angle
			let angle = Math.atan2(particle.dy, particle.dx);
			
			ctx.save();
			// Move to object position
			ctx.translate(particle.x, particle.y);

			// Rotate the canvas to match the object's velocity direction
			ctx.rotate(angle);
			
			ctx.globalAlpha = particle.opacity;
			ctx.fillStyle = particle.color;
			ctx.fillRect(
				particle.x - this.centerX,
				particle.y - this.centerY,
				particle.width,
				particle.height,
			);

			ctx.restore();


			// Calculate center of mass.
			sumX += particle.x;
			sumY += particle.y;
		}

		if (groupDead < 1) {
			this.dead = true;
		}

		// Calculate center off mass.
		this.centerX = sumX / this.amount;
		this.centerY = sumY / this.amount;

		// Reset global alpha
		ctx.globalAlpha = 1;
	};
}

class Particle {
	x = 0;
	y = 0;
	dx = 0;
	dy = 0;
	width = 0;
	height = 0;
	life = 5;
	dead = false;
	opacity = 1;
	color = "";

	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;

		this.dx = randRange(-99, 99);
		this.dy = randRange(-20, 76);

		this.width = 7 + Math.random();
		this.height = 1 + Math.random();
	}
}
