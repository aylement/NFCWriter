(function () {
    let canvas, ctx;
    let bird, gravity, velocity, pipes;
    let frameCount, score, running;
    let lift = -10; // default jump strength

    // Slider labels for fun
    const liftNames = {
        6: "Tiny hop 🐣",
        7: "Small jump 🐤",
        8: "Bouncy 🐥",
        9: "Up we go! 🕊️",
        10: "Normal 🐦",
        11: "Strong flap 💨",
        12: "Power jump 🚀",
        13: "Sky high ☁️",
        14: "Insane jump 🌪️"
    };

    // Initialize everything
    function init() {
        canvas = document.getElementById("flappyCanvas");
        if (!canvas) return;
        ctx = canvas.getContext("2d");

        reset();

        // Tap/click anywhere on canvas to flap
        canvas.addEventListener("click", flap);
        canvas.addEventListener("touchstart", (e) => { e.preventDefault(); flap(); });

        // Attach slider if it exists
        const liftSlider = document.getElementById("liftSlider");
        if (liftSlider) {
            liftSlider.addEventListener("input", (e) => {
                lift = -parseInt(e.target.value);
                const lbl = document.getElementById("liftLabel");
                if (lbl) lbl.textContent = liftNames[parseInt(e.target.value)] || e.target.value;
            });
        }

        console.log("Flappy initialized");
    }

    // Reset game state and auto-start
    function reset() {
        bird = { x: 50, y: 150, radius: 12 };
        gravity = 0.6;
        velocity = 0;
        pipes = [];
        frameCount = 0;
        score = 0;
        running = true;

        draw();
        requestAnimationFrame(gameLoop);
    }

    // Flap function
    function flap() {
        velocity += lift;
    }

    // Main game loop
    function gameLoop() {
        if (!running) {
            drawGameOver();
            return;
        }

        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Update bird and pipes
    function update() {
        velocity += gravity;
        bird.y += velocity;

        // Ground hit
        if (bird.y + bird.radius > canvas.height) running = false;

        // Spawn pipes
        if (frameCount % 90 === 0) {
            let gap = 120;
            let top = Math.random() * (canvas.height - gap - 50) + 20;
            pipes.push({ x: canvas.width, top, bottom: top + gap, width: 40 });
        }

        // Move pipes + collision
        for (let i = pipes.length - 1; i >= 0; i--) {
            let p = pipes[i];
            p.x -= 2;

            if (bird.x + bird.radius > p.x &&
                bird.x - bird.radius < p.x + p.width &&
                (bird.y - bird.radius < p.top || bird.y + bird.radius > p.bottom)) {
                running = false;
            }

            if (p.x + p.width < 0) {
                pipes.splice(i, 1);
                score++;
            }
        }

        frameCount++;
    }

    // Draw everything
    function draw() {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bird
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pipes
        ctx.fillStyle = "green";
        for (let p of pipes) {
            ctx.fillRect(p.x, 0, p.width, p.top);
            ctx.fillRect(p.x, p.bottom, p.width, canvas.height - p.bottom);
        }

        // Score
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 10, 25);

        // Prompt if not running
        if (!running) {
            ctx.font = "18px Arial";
            ctx.fillText("Press Reset or Tap to Flap", canvas.width / 2 - 100, canvas.height / 2);
        }
    }

    // Game over overlay
    function drawGameOver() {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px Arial";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText("Press Reset to try again", canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = "left";
    }

    // Expose functions to Blazor
    window.flappy = { init, start: reset, reset };

    // Auto-init on DOM load
    document.addEventListener("DOMContentLoaded", init);
})();