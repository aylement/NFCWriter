let gameRunning = false;
let paused = false;
let snake, food, direction, nextDirection;
const box = 20;
let lastMoveTime = 0;
let currentSpeed = 100;

const speedNames = {
    50: "Fast as lightning ⚡",
    100: "Zoomy 🐍",
    150: "Ssslightly speedy 🐢💨",
    200: "Kinda slow 😴",
    250: "Turtle pace 🐢🐢",
    300: "Molasses 🫠",
    350: "Snail trail 🐌",
    400: "Slow as heck ❄️"
};

window.startSnakeGame = function () {
    if (gameRunning) return;
    gameRunning = true;

    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");

    // Initialize game state
    snake = [{ x: 9 * box, y: 10 * box }];
    food = { x: Math.floor(Math.random() * 19 + 1) * box, y: Math.floor(Math.random() * 19 + 1) * box };
    direction = "RIGHT";
    nextDirection = "RIGHT";

    // Keyboard controls
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
        else if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
        else if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
        else if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
    });

    // Touch controls
    const setDirection = dir => {
        if (dir === "LEFT" && direction !== "RIGHT") nextDirection = "LEFT";
        else if (dir === "UP" && direction !== "DOWN") nextDirection = "UP";
        else if (dir === "RIGHT" && direction !== "LEFT") nextDirection = "RIGHT";
        else if (dir === "DOWN" && direction !== "UP") nextDirection = "DOWN";
    };

    document.getElementById("btnUp").addEventListener("click", () => setDirection("UP"));
    document.getElementById("btnLeft").addEventListener("click", () => setDirection("LEFT"));
    document.getElementById("btnRight").addEventListener("click", () => setDirection("RIGHT"));
    document.getElementById("btnDown").addEventListener("click", () => setDirection("DOWN"));

    // Reset game
    window.resetSnakeGame = function () {
        paused = false;
        lastMoveTime = Date.now();
        gameRunning = true;
        snake = [{ x: 9 * box, y: 10 * box }];
        food = { x: Math.floor(Math.random() * 19 + 1) * box, y: Math.floor(Math.random() * 19 + 1) * box };
        direction = "RIGHT";
        nextDirection = "RIGHT";
    };
};

// Global draw function with single-interval logic
window.draw = function () {
    if (!gameRunning || paused) return;

    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");
    const now = Date.now();

    if (now - lastMoveTime < currentSpeed) return; // only move according to speed
    lastMoveTime = now;

    direction = nextDirection;
    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "UP") headY -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "DOWN") headY += box;

    // Collision
    if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height || snake.some(seg => seg.x === headX && seg.y === headY)) {
        gameRunning = false;
        alert("💀 Game Over");
        return;
    }

    const newHead = { x: headX, y: headY };

    // Eat food
    if (headX === food.x && headY === food.y) {
        food = { x: Math.floor(Math.random() * 19 + 1) * box, y: Math.floor(Math.random() * 19 + 1) * box };
    } else {
        snake.pop();
    }

    snake.unshift(newHead);

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "lightgreen";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);
};

// Pause toggle
window.togglePause = function () {
    if (!gameRunning) return;

    paused = !paused;

    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");

    if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
};

// Speed slider
window.updateSpeed = function (value) {
    currentSpeed = parseInt(value);
    document.getElementById("speedLabel").textContent = speedNames[currentSpeed] || `${currentSpeed}ms`;
};

// Single interval game loop
setInterval(() => {
    window.draw();
}, 20); // 20ms base interval for smooth checks