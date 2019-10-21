GameState.TILESIZE = 75;
GameState.gameMap = [
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "r", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "w", "w", "", ""],
    ["", "", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "w", "", ""],
    ["", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "w", "", "", "", "", "", "", "", "", "", "", "", "", "", "r", "w", "", ""],
    ["", "", "", "", "", "", "", "w", "", "w", "", "", "", "", "", "", "w", "w", "", ""],
    ["", "", "", "", "", "", "", "", "w", "", "", "", "", "", "", "", "r", "", "", ""]];

GameState.enemies = [];
PIXI.utils.skipHello();
const app = initApplication();
const grid = drawGrid();
let loader = app.loader;
let resources = app.loader.resources;
loadAll();
console.log(GameState.getTS());

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.backgroundColor = 0xBB00BB;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

function drawGrid() {
    let grid = new PIXI.Graphics();
    for (let y = 0; y < app.view.height; y += GameState.TILESIZE) {
        for (let x = 0; x < app.view.width; x += GameState.TILESIZE) {
            grid.lineStyle(2, 0xAA00AA);
            grid.drawRect(x, y, GameState.TILESIZE, GameState.TILESIZE);
        }
    }
    app.stage.addChild(grid);
    return grid;
}

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    GameState.player = new Player(resources["src/images/player.png"].texture, 7, 4);
    GameState.player.scale.set(GameState.player.getScale(GameState.TILESIZE).x, GameState.player.getScale(GameState.TILESIZE).y);
    GameState.player.place();
    app.stage.addChild(GameState.player);

    GameState.player2 = new Player(resources["src/images/player2.png"].texture, 12, 4);
    GameState.player2.scale.set(GameState.player2.getScale(GameState.TILESIZE).x, GameState.player2.getScale(GameState.TILESIZE).y);
    GameState.player2.place();
    app.stage.addChild(GameState.player2);

    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x] = "p1";
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x] = "p2";

    app.ticker.add(delta => gameLoop(delta)); // not used now

    drawWalls();
    drawEnemies();
    displayInstructions();
    bindKeys();
}

function gameLoop(delta) {

}

function moveEnemies() {
    setTimeout(() => {
        for (const enemy of GameState.enemies) enemy.move()
    }, 50);
}


function drawWalls() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j] === "w") {
                let wall = new PIXI.Sprite(resources["src/images/wall.png"].texture);
                wall.position.set(GameState.TILESIZE * j, GameState.TILESIZE * i);
                wall.width = wall.height = GameState.TILESIZE;
                app.stage.addChild(wall);
            }
        }
    }
}

function drawEnemies() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            let enemy = null;
            if (GameState.gameMap[i][j] === "r") {
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i)
            }
            if (enemy !== null) {
                addEnemyToStage(enemy);
                GameState.enemies.push(enemy);
            }
        }
    }
}

function addEnemyToStage(enemy) {
    enemy.place();
    enemy.scale.set(enemy.getScale(GameState.TILESIZE).x, enemy.getScale(GameState.TILESIZE).y);
    app.stage.addChild(enemy);
}

function attackTile(attackPositionX, attackPositionY) {
    if (["r"].includes(GameState.gameMap[attackPositionY][attackPositionX])) {
        for (const enemy of GameState.enemies) {
            if (!enemy.isDead() && enemy.tilePosition.x === attackPositionX && enemy.tilePosition.y === attackPositionY) {
                enemy.damage(100);
                if (enemy.isDead()) {
                    GameState.gameMap[enemy.tilePosition.y][enemy.tilePosition.x] = "";
                    enemy.visible = false;
                    break;
                }
            }
        }
    }
}

function displayInstructions() {
    let instructions = new PIXI.Text("WASD to move player 1\nArrows to move player 2\nF for linked fireball attack\n" +
        "T to teleport player 2 to player 1\nR for rotate attack\nC for cross attack", {fontSize: "16px"});
    let rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(30, 30, instructions.width + 20, instructions.height + 20);
    instructions.position.set(40, 40);
    app.stage.addChild(rect);
    app.stage.addChild(instructions);
}

function bindKeys() {
    bindMovement(GameState.player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68});
    bindMovement(GameState.player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39});

    const fireKey = keyboard(70);
    fireKey.press = () => {
        fireball();
        moveEnemies();
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        teleport();
        moveEnemies();
    };

    const rotateKey = keyboard(82);
    rotateKey.press = () => {
        rotateAttack();
        moveEnemies();
    };

    const crossKey = keyboard(67);
    crossKey.press = () => {
        crossAttack();
        moveEnemies();
    };
}

function bindMovement(player, {upCode, leftCode, downCode, rightCode}) {
    const upKey = keyboard(upCode);
    const leftKey = keyboard(leftCode);
    const downKey = keyboard(downCode);
    const rightKey = keyboard(rightCode);
    upKey.press = () => {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y - 1)) {
            //player.tilePosition.y--;
            player.stepY(-1);
            //player.place();
            moveEnemies();
        }
    };
    leftKey.press = () => {
        if (isNotAWall(player.tilePosition.x - 1, player.tilePosition.y)) {
            //player.tilePosition.x--;
            player.stepX(-1);
            //player.place();
            moveEnemies();
        }
    };
    downKey.press = () => {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y + 1)) {
            //player.tilePosition.y++;
            player.stepY(1);
            //player.place();
            moveEnemies();
        }
    };
    rightKey.press = () => {
        if (isNotAWall(player.tilePosition.x + 1, player.tilePosition.y)) {
            //player.tilePosition.x++;
            player.stepX(1);
            //player.place();
            moveEnemies();
        }
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function isNotAWall(tilePositionX, tilePositionY) {
    if (tilePositionX <= GameState.gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= GameState.gameMap.length - 1 && tilePositionY >= 0) {
            if (GameState.gameMap[tilePositionY][tilePositionX] !== "w") {
                return true
            }
        }
    }
    return false;
}