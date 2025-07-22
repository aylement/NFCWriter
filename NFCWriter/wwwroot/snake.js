let gameInterval;
let gameRunning = false;

window.startSnakeGame = function () {
    if (gameRunning) return;

    gameRunning = true;
    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");

    const box = 20;
    let snake = [{ x: 9 * box, y: 10 * box }];
    let food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
    };
    let direction = "RIGHT";

    document.addEventListener("keydown", dirUpdate);

    function dirUpdate(e) {
        if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
        else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
        else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
        else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    }

    window.setDirection = function (dir) {
        if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
        else if (dir === "UP" && direction !== "DOWN") direction = "UP";
        else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
        else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
    };

    window.resetSnakeGame = function () {
        clearInterval(gameInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gameRunning = false;
        window.startSnakeGame();
    };

    function draw() {
        ctx.clearRect(0, 0, 400, 400);

        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? "green" : "lightgreen";
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(food.x, food.y, box, box);

        let headX = snake[0].x;
        let headY = snake[0].y;

        if (direction === "LEFT") headX -= box;
        if (direction === "UP") headY -= box;
        if (direction === "RIGHT") headX += box;
        if (direction === "DOWN") headY += box;

        if (
            headX < 0 ||
            headY < 0 ||
            headX >= 400 ||
            headY >= 400 ||
            collision(headX, headY, snake)
        ) {
            clearInterval(gameInterval);
            gameRunning = false;
            alert("💀 Game Over");
        }

        let newHead = { x: headX, y: headY };

        if (headX === food.x && headY === food.y) {
            food = {
                x: Math.floor(Math.random() * 19 + 1) * box,
                y: Math.floor(Math.random() * 19 + 1) * box,
            };
        } else {
            snake.pop();
        }

        snake.unshift(newHead);
    }

    function collision(x, y, array) {
        return array.some(seg => seg.x === x && seg.y === y);
    }

    gameInterval = setInterval(draw, 200);
};
