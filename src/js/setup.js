"use strict";

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
let loader = app.loader;
let resources = app.loader.resources;
loadAll();

function initApplication() {
    let app = new PIXI.Application({resolution: window.devicePixelRatio});
    app.renderer.backgroundColor = 0xBB77BB;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoDensity = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    document.body.appendChild(app.view);
    return app
}

function drawGrid() {
    //let grid = new PIXI.Graphics();
    //for (let y = 0; y < app.view.height; y += GameState.TILESIZE) {
    //    for (let x = 0; x < app.view.width; x += GameState.TILESIZE) {
    //        grid.lineStyle(2, 0xAA66AA);
    //        grid.drawRect(x, y, GameState.TILESIZE, GameState.TILESIZE);
    //    }
    //}
    //app.stage.addChild(grid);
    //return grid;

    let gridTexture = resources["src/images/grid.png"].texture;
    gridTexture.tint = 0x00ff00;
    let grid = new PIXI.TilingSprite(gridTexture, app.view.width * gridTexture.width / GameState.TILESIZE, app.view.height * gridTexture.height / GameState.TILESIZE);
    grid.scale.set(GameState.TILESIZE / gridTexture.width, GameState.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * GameState.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * GameState.TILESIZE / gridTexture.height;
    grid.tint = 0xAA66AA;
    app.stage.addChild(grid);
    return grid;
}

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    GameState.player = new Player(resources["src/images/player.png"].texture, 7, 4);
    GameState.player.place();

    GameState.player2 = new Player(resources["src/images/player2.png"].texture, 12, 4);
    GameState.player2.place();

    GameState.gameMap[GameState.player.tilePosition.y][GameState.player.tilePosition.x] = "p1";
    GameState.gameMap[GameState.player2.tilePosition.y][GameState.player2.tilePosition.x] = "p2";

    app.ticker.add(delta => gameLoop(delta)); // not used now

    const grid = drawGrid();
    drawWalls();
    drawEnemies();
    displayInstructions();
    bindKeys();
    app.stage.addChild(GameState.player);
    app.stage.addChild(GameState.player2);
}

function gameLoop(delta) {

}

function moveEnemies() {
    GameState.turnState = TurnState.ENEMY;
    setTimeout(() => {
        for (const enemy of GameState.enemies) enemy.move()
        GameState.turnState = TurnState.PLAYER;
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
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i);
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
        playerTurn(null, fireball, true)
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        playerTurn(GameState.player2, teleport)
    };

    const rotateKey = keyboard(82);
    rotateKey.press = () => {
        playerTurn(GameState.player, rotateAttack)
    };

    const crossKey = keyboard(67);
    crossKey.press = () => {
        playerTurn(GameState.player2, crossAttack)
    };
}

function bindMovement(player, {upCode, leftCode, downCode, rightCode}) {
    const upKey = keyboard(upCode);
    const leftKey = keyboard(leftCode);
    const downKey = keyboard(downCode);
    const rightKey = keyboard(rightCode);
    upKey.press = () => {
        playerTurn(player, () => movePlayer(player, 0, -1));

    };
    leftKey.press = () => {
        playerTurn(player, () => movePlayer(player, -1, 0));

    };
    downKey.press = () => {
        playerTurn(player, () => movePlayer(player, 0, 1));

    };
    rightKey.press = () => {
        playerTurn(player, () => movePlayer(player, 1, 0));
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function movePlayer(player, tileStepX, tileStepY) {
    if (tileStepX !== 0) {
        if (isNotAWall(player.tilePosition.x + tileStepX, player.tilePosition.y)) {
            player.stepX(tileStepX);
        }
    } else if (tileStepY !== 0) {
        if (isNotAWall(player.tilePosition.x, player.tilePosition.y + tileStepY)) {
            player.stepY(tileStepY);
        }
    }
}

function playerTurn(player, playerMove, bothPlayers = false) {
    if (GameState.turnState === TurnState.PLAYER) {
        if (bothPlayers) {
            GameState.player.cancelAnimation();
            GameState.player2.cancelAnimation();
        } else player.cancelAnimation();
        playerMove();
        moveEnemies();
    }
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