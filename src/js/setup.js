let player, player2;
const tileSize = 75;
const gameMap = [
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

let enemies = [];

PIXI.utils.skipHello();
const app = initApplication();
const grid = drawGrid();
let loader = app.loader;
let resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application();
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
    for (let y = 0; y < app.view.height; y += tileSize) {
        for (let x = 0; x < app.view.width; x += tileSize) {
            grid.lineStyle(2, 0xAA00AA);
            grid.drawRect(x, y, tileSize, tileSize);
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
    player = new Player(resources["src/images/player.png"].texture, 7, 4);
    player.scale.set(player.getScale(tileSize).x, player.getScale(tileSize).y);
    player.place(tileSize);
    app.stage.addChild(player);

    player2 = new Player(resources["src/images/player2.png"].texture, 12, 4);
    player2.scale.set(player2.getScale(tileSize).x, player2.getScale(tileSize).y);
    player2.place(tileSize);
    app.stage.addChild(player2);

    gameMap[player.tilePosition.y][player.tilePosition.x] = "p1";
    gameMap[player2.tilePosition.y][player2.tilePosition.x] = "p2";

    app.ticker.add(delta => gameLoop(delta)); // not used now

    drawWalls(gameMap);
    drawEnemies(gameMap);
    displayInstructions();
    bindKeys();
}

function gameLoop(delta) {

}

function moveEnemies() {
    setTimeout(() => {
        for (const enemy of enemies) enemy.move(gameMap)
    }, 50);
}


function drawWalls(gameMap) {
    for (let i = 0; i < gameMap.length; ++i) {
        for (let j = 0; j < gameMap[0].length; ++j) {
            if (gameMap[i][j] === "w") {
                let wall = new PIXI.Sprite(resources["src/images/wall.png"].texture);
                wall.position.set(tileSize * j, tileSize * i);
                wall.width = wall.height = tileSize;
                app.stage.addChild(wall);
            }
        }
    }
}

function drawEnemies(gameMap) {
    for (let i = 0; i < gameMap.length; ++i) {
        for (let j = 0; j < gameMap[0].length; ++j) {
            let enemy = null;
            if (gameMap[i][j] === "r") {
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i)
            }
            if (enemy !== null) {
                addEnemyToStage(enemy);
                enemies.push(enemy);
            }
        }
    }
}

function addEnemyToStage(enemy) {
    enemy.place(tileSize);
    enemy.scale.set(enemy.getScale(tileSize).x, enemy.getScale(tileSize).y);
    app.stage.addChild(enemy);
}

function attackTile(gameMap, attackPositionX, attackPositionY) {
    if (["r"].includes(gameMap[attackPositionY][attackPositionX])) {
        for (const enemy of enemies) {
            if (!enemy.isDead() && enemy.tilePosition.x === attackPositionX && enemy.tilePosition.y === attackPositionY) {
                enemy.damage(100);
                if (enemy.isDead()) {
                    gameMap[enemy.tilePosition.y][enemy.tilePosition.x] = "";
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
    bindMovement(player, {upCode: 87, leftCode: 65, downCode: 83, rightCode: 68});
    bindMovement(player2, {upCode: 38, leftCode: 37, downCode: 40, rightCode: 39});

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
        if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y - 1)) {
            player.tilePosition.y--;
            player.place(tileSize);
            moveEnemies();
        }
    };
    leftKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            //player.tilePosition.x--;
            player.step(-1);
            //player.place(tileSize);
            moveEnemies();
        }
    };
    downKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player.tilePosition.y++;
            player.place(tileSize);
            moveEnemies();
        }
    };
    rightKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            //player.tilePosition.x++;
            player.step(1);
            //player.place(tileSize);
            moveEnemies();
        }
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function isNotAWall(gameMap, tilePositionX, tilePositionY) {
    if (tilePositionX <= gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= gameMap.length - 1 && tilePositionY >= 0) {
            if (gameMap[tilePositionY][tilePositionX] !== "w") {
                return true
            }
        }
    }
    return false;
}