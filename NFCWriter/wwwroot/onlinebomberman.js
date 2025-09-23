// bomberman.js
window.bomberman = (function () {
    const tileSize = 40;
    const rows = 9;
    const cols = 9;
    let canvas, ctx;
    let bombs = [];
    let map = [];
    let running = true;

    // Players: dictionary { playerId: {row, col, color} }
    let players = {};

    // Current player ID
    let myId = "player-" + Math.floor(Math.random() * 10000);

    // SignalR connection
    let connection;

    const EMPTY = 0;
    const WALL = 1;
    const BLOCK = 2;

    async function init(serverUrl) {
        canvas = document.getElementById("bomberCanvas");
        if (!canvas) return;
        ctx = canvas.getContext("2d");

        // Set canvas size to match tile grid
        canvas.width = cols * tileSize;
        canvas.height = rows * tileSize;

        createMap();
        draw();

        running = true;
        requestAnimationFrame(gameLoop);

        // Init local player
        players[myId] = { row: 1, col: 1, color: "yellow" };

        // Setup SignalR
        connection = new signalR.HubConnectionBuilder()
            .withUrl(serverUrl + "/gamehub")
            .withAutomaticReconnect()
            .build();

        // Listen for other players
        connection.on("PlayerJoined", id => {
            if (!players[id]) {
                players[id] = { row: rows - 2, col: cols - 2, color: "red" };
            }
        });

        connection.on("PlayerLeft", id => {
            delete players[id];
        });

        connection.on("ReceiveMove", (id, dir) => {
            if (players[id]) applyMove(players[id], dir);
        });

        connection.on("BombPlaced", (id, row, col) => {
            bombs.push({ row, col, timer: 60 });
        });

        await connection.start();
        await connection.invoke("JoinGame", myId);

        // Keyboard input
        document.addEventListener("keydown", handleKey);

        // Touch buttons
        ["Up", "Down", "Left", "Right", "Bomb"].forEach(id => {
            const btn = document.getElementById("btn" + id);
            if (btn) {
                btn.addEventListener("touchstart", e => { e.preventDefault(); handleTouch(id); });
            }
        });
    }

    function createMap() {
        // Initialize empty map
        map = Array(rows).fill(0).map(() => Array(cols).fill(EMPTY));

        // Outer walls
        for (let r = 0; r < rows; r++) {
            map[r][0] = WALL;
            map[r][cols - 1] = WALL;
        }
        for (let c = 0; c < cols; c++) {
            map[0][c] = WALL;
            map[rows - 1][c] = WALL;
        }

        // Inner fixed walls (symmetric grid)
        for (let r = 2; r < rows - 1; r += 2) {
            for (let c = 2; c < cols - 1; c += 2) {
                map[r][c] = WALL;
            }
        }

        // Random destructible blocks
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (map[r][c] === EMPTY && Math.random() < 0.2) {
                    if (!(r <= 2 && c <= 2)) {
                        map[r][c] = BLOCK;
                    }
                }
            }
        }
    }

    function handleKey(e) {
        if (!running) return;
        if (e.key === "ArrowUp") move("UP");
        if (e.key === "ArrowDown") move("DOWN");
        if (e.key === "ArrowLeft") move("LEFT");
        if (e.key === "ArrowRight") move("RIGHT");
        if (e.key === " ") placeBomb();
    }

    function handleTouch(id) {
        if (!running) return;
        if (id === "Up") move("UP");
        if (id === "Down") move("DOWN");
        if (id === "Left") move("LEFT");
        if (id === "Right") move("RIGHT");
        if (id === "Bomb") placeBomb();
    }

    async function move(dir) {
        const me = players[myId];
        if (!me) return;

        if (applyMove(me, dir)) {
            draw();
            if (connection) {
                await connection.invoke("SendMove", myId, dir);
            }
        }
    }

    function applyMove(player, dir) {
        let newRow = player.row;
        let newCol = player.col;
        if (dir === "UP") newRow--;
        if (dir === "DOWN") newRow++;
        if (dir === "LEFT") newCol--;
        if (dir === "RIGHT") newCol++;

        if (map[newRow][newCol] === EMPTY) {
            player.row = newRow;
            player.col = newCol;
            return true;
        }
        return false;
    }

    async function placeBomb() {
        const me = players[myId];
        if (!me) return;

        if (bombs.some(b => b.row === me.row && b.col === me.col)) return;
        bombs.push({ row: me.row, col: me.col, timer: 60 });

        if (connection) {
            await connection.invoke("PlaceBomb", myId, me.row, me.col);
        }
    }

    function update() {
        for (let i = bombs.length - 1; i >= 0; i--) {
            bombs[i].timer--;
            if (bombs[i].timer <= 0) {
                explode(bombs[i]);
                bombs.splice(i, 1);
            }
        }
    }

    function explode(bomb) {
        const dirs = [
            { dr: 0, dc: 0 },
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }
        ];
        for (let d of dirs) {
            const r = bomb.row + d.dr;
            const c = bomb.col + d.dc;
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                if (map[r][c] === BLOCK) map[r][c] = EMPTY;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.fillStyle = map[r][c] === WALL ? "gray" :
                    map[r][c] === BLOCK ? "brown" : "lightblue";
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }

        // Bombs
        ctx.fillStyle = "black";
        bombs.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.col * tileSize + tileSize / 2, b.row * tileSize + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Players
        Object.values(players).forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.col * tileSize + 5, p.row * tileSize + 5, tileSize - 10, tileSize - 10);
        });
    }

    function gameLoop() {
        if (!running) return;
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    return {
        init,
        reset: () => {
            players = {};
            players[myId] = { row: 1, col: 1, color: "yellow" };
            bombs = [];
            createMap();
            draw();
            running = true;
            requestAnimationFrame(gameLoop);
        },
        remoteMove: (direction) => { move(direction); },
        remoteBomb: () => { placeBomb(); }
    };
})();