export function randomElement(list) {
	return list[Math.floor(Math.random() * list.length)];
}

export function randRange(min, max) {
	return Math.random() * (max - min) + min;
}

export function distance(x, y) {
	return Math.sqrt(x * x + y * y)
}

export function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export const Rad2Deg = 360 / (Math.PI * 2);