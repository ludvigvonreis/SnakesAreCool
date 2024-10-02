export function randomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

export function randRange(min, max) {
	return Math.random() * (max - min) + min;
}

export function distance(x, y) {
	return Math.sqrt(x * x + y * y)
}

export const Rad2Deg = 360 / (Math.PI * 2);