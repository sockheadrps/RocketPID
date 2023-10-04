const ship = document.querySelector("#ship");
const bullet = document.querySelector("#bullet");
const asteroid = document.querySelector("#asteroid");
let ship_left = 0;
let bullet_top = 500;
const move_inter = 10;

window.addEventListener("load", function (e) {
	loadAsteroids();
});

window.addEventListener("click", function (e) {
	fire();
});

window.addEventListener("mousemove", function (e) {
	ship_left = e.x;
	ship.style.left = ship_left + "px";
});

window.addEventListener("keydown", function (e) {
	console.log(e.key);

	switch (e.key) {
		case "ArrowLeft":
			ship_left = ship_left - move_inter;
			ship.style.left = ship_left + "px";
			break;
		case "ArrowRight":
			ship_left = ship_left + move_inter;
			ship.style.left = ship_left + "px";
			break;
		case " ": // space bar == fire
			fire();
			break;
	}
});

function fire() {
	const ship_loc = ship.getBoundingClientRect();
	bullet.style.left = 20 + ship_loc.x + ship_loc.width / 2 + "px";
	bullet.style.display = "block";
	bullet_top = ship_loc.top;
	bullet.style.top = bullet_top + "px";
	let tid = setInterval(function () {
		bullet_top = bullet_top - 10;
		bullet.style.top = bullet_top + "px";

		// check collition
		if (isCollapsed(bullet, asteroid)) {
			asteroid.style.display = "none";
		}

		setTimeout(function () {
			clearInterval(tid);
		}, 900);
	}, 10);
}

function isCollapsed(obj1, obj2) {
	let object_1 = obj1.getBoundingClientRect();
	let object_2 = obj2.getBoundingClientRect();
	let collide = false;
	if (
		object_1.left < object_2.left + object_2.width &&
		object_1.left + object_1.width > object_2.left &&
		object_1.top < object_2.top + object_2.height &&
		object_1.top + object_1.height > object_2.top
	) {
		collide = true;
	}

	return collide;
}

function loadAsteroids() {
	for (i = 0; i < 2; i++) {
		let at = document.createElement("img");
		at.src = "rock1.gif";
		at.style.width = "300px";
		at.style.left = "300px";
		asteroid.appendChild(at);
	}
}
