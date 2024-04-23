const ship = document.querySelector('#ship');
const bullet = document.querySelector('#bullet');
const asteroidContainer = document.querySelector('#asteroid');
let ship_left = 0;
const move_inter = 10;

let pidInterval;

const asteroidPositions = {
  left: 0,
  top: 0,
};

// Define arrays to store position and setpoint data
let positions = [];
let setpoints = [];

// Example PID controller parameters (you should use your own parameters)
let Kp = 0.6;
let Ki = 0.22;
let Kd = 0.8;

const ctx = document.getElementById('positionChart').getContext('2d');

const positionChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // Remove x-axis labels
    datasets: [
      {
        label: 'Position',
        data: positions,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Setpoint',
        data: setpoints,
        borderColor: 'red',
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        display: false,
      },
      y: {
        title: {
          display: true,
          text: 'Position',
        },
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  },
});

// Update the chart with new data
function updateChart() {
  positionChart.data.labels.push(new Date().toLocaleTimeString()); // Add current time as label
  positionChart.update();
}

window.addEventListener('load', function (e) {
  // Set the initial position of the ship to visually center it
  ship_left =
    (window.innerWidth - ship.offsetWidth) / 2 + ship.offsetWidth / 2;
  ship.style.left = ship_left + 'px';

  // Draw a line or marker on the ship element to visualize its center
  const centerMarker = document.createElement('div');
  centerMarker.style.position = 'absolute';
  centerMarker.style.left = '50%';
  centerMarker.style.top = '50%';
  centerMarker.style.transform = 'translate(-50%, -50%)'; // Center the marker
  centerMarker.style.width = '1px';
  centerMarker.style.height = '20px';
  centerMarker.style.background = 'red';
  ship.appendChild(centerMarker);

  loadAsteroid();
  // Start the PID loop
  setInterval(pidLoop, 100); // Run every 100 milliseconds
});

// Example PID controller variables
let prevError = 0;
let integral = 0;

// Example target position (setpoint)
let targetPosition = 0;

function pidLoop() {
  // Find the closest asteroid to the bottom
  const closestAsteroid = findAsteroidClosestToBottom();

  // If no asteroid is found, set target position to the middle of the screenlet pidInterval;
  targetPosition = closestAsteroid
    ? closestAsteroid.getBoundingClientRect().left +
      closestAsteroid.getBoundingClientRect().width / 2
    : window.innerWidth / 2;

  // Calculate error (difference between target position and current position)
  const currentPosition =
    ship.getBoundingClientRect().left + ship.offsetWidth / 2;
  const error = targetPosition - currentPosition;

  // Update integral and calculate control output
  integral += error;
  const derivative = error - prevError;
  const controlOutput = Kp * error + Ki * integral + Kd * derivative;

  // Update ship_left based on the control output
  ship_left += controlOutput;

  // Limit ship_left to stay within the bounds of the screen
  ship_left = Math.max(
    0,
    Math.min(window.innerWidth - ship.offsetWidth, ship_left)
  );

  // Update ship position
  ship.style.left = ship_left + 'px';

  // Update the chart with new data
  positions.push(ship_left + ship.offsetWidth / 2); // Store ship position
  setpoints.push(targetPosition); // Store setpoint
  updateChart();

  // Update prevError for next iteration
  prevError = error;
}

function fire() {
  const ship_loc = ship.getBoundingClientRect();
  const bullet_left =
    ship_loc.x + ship_loc.width / 2 - bullet.offsetWidth / 2;
  bullet.style.left = bullet_left + 'px';
  bullet.style.display = 'block';
  let bullet_top = ship_loc.top;
  bullet.style.top = bullet_top + 'px';
  const bullet_speed = 10;

  function moveBullet() {
    bullet_top -= bullet_speed;
    bullet.style.top = bullet_top + 'px';

    // Check collision with each asteroid
    const asteroids = document.querySelectorAll('.asteroid');
    asteroids.forEach((asteroid) => {
      if (isCollapsed(bullet, asteroid)) {
        asteroid.style.display = 'none';
        resetAsteroid();
      }
    });

    // Clear interval if bullet goes out of bounds
    if (bullet_top < 0) {
      clearInterval(tid);
      bullet.style.display = 'none';
    }
  }

  const tid = setInterval(moveBullet, 10);
}

function isCollapsed(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function isCollapsed(obj1, obj2) {
  const rect1 = obj1.getBoundingClientRect();
  const rect2 = obj2.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

function loadAsteroid() {
  const at = document.createElement('img');
  at.src = 'rock1.gif';
  at.classList.add('asteroid');
  at.style.width = '100px'; // Adjust size as needed
  at.style.position = 'absolute';
  asteroidPositions.left =
    Math.random() * (window.innerWidth / 3) + window.innerWidth / 3;
  asteroidPositions.top = Math.random() * 200 + 'px'; // Start off screen
  at.style.left = asteroidPositions.left + 'px'; // Adjust left position
  at.style.top = asteroidPositions.top; // Start off screen
  asteroidContainer.appendChild(at);
}

function resetAsteroid() {
  const asteroid = document.querySelector('.asteroid');
  if (asteroid) {
    asteroid.style.display = 'block';
    asteroidPositions.left =
      Math.random() * (window.innerWidth / 3) + window.innerWidth / 3;
    asteroidPositions.top = Math.random() * 200 + 'px';
    asteroid.style.left = asteroidPositions.left + 'px';
    asteroid.style.top = asteroidPositions.top;
  } else {
    loadAsteroid();
  }
}

function findAsteroidClosestToBottom() {
  const asteroids = document.querySelectorAll('.asteroid');
  let closestAsteroid = null;
  let minDistanceToBottom = Number.MAX_SAFE_INTEGER;

  asteroids.forEach((asteroid) => {
    const asteroidRect = asteroid.getBoundingClientRect();
    const distanceToBottom = window.innerHeight - asteroidRect.bottom;
    if (distanceToBottom < minDistanceToBottom) {
      minDistanceToBottom = distanceToBottom;
      closestAsteroid = asteroid;
    }
  });

  // Remove border from previously targeted asteroid
  const previousTarget = document.querySelector('.targeted');
  if (previousTarget) {
    previousTarget.classList.remove('targeted');
  }

  // Add border to the closest asteroid
  if (closestAsteroid) {
    closestAsteroid.classList.add('targeted');
  }

  return closestAsteroid;
}

window.addEventListener('keydown', function (e) {
  console.log(e.key);

  switch (e.key) {
    case ' ':
      fire();
      break;
  }
});
