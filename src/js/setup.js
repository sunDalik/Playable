//Aliases
let Sprite = PIXI.Sprite;

let player, player2;
let playerState = "none";
const tileSize = 75;
const gameMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

PIXI.utils.skipHello();
let app = new PIXI.Application();
app.renderer.backgroundColor = 0xBB00BB;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoDensity = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);

let grid = new PIXI.Graphics();
for (let y = 0; y < app.view.height; y += tileSize) {
    for (let x = 0; x < app.view.width; x += tileSize) {
        grid.lineStyle(2, 0xAA00AA);
        grid.drawRect(x, y, tileSize, tileSize);
    }
}
app.stage.addChild(grid);

let loader = app.loader;
let resources = app.loader.resources;
loadAll();

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    player = new Player(resources["src/images/player.png"].texture, 7, 4);
    player.scale.set(player.getScale(tileSize).x, player.getScale(tileSize).y);
    player.move(tileSize);
    app.stage.addChild(player);

    player2 = new Player(resources["src/images/player2.png"].texture, 12, 4);
    player2.scale.set(player2.getScale(tileSize).x, player2.getScale(tileSize).y);
    player2.move(tileSize);
    app.stage.addChild(player2);

    app.ticker.add(delta => gameLoop(delta)); // not used now

    drawWalls(gameMap);
    displayInstructions();
    bindKeys();
}

function gameLoop(delta) {

}

function drawWalls(gameMap) {
    for (let i = 0; i < gameMap.length; ++i) {
        for (let j = 0; j < gameMap[0].length; ++j) {
            if (gameMap[i][j] === 1) {
                const wall = new Sprite(resources["src/images/wall.png"].texture);
                wall.position.set(tileSize * j, tileSize * i);
                wall.width = wall.height = tileSize;
                app.stage.addChild(wall);
            }
        }
    }
}

function displayInstructions() {
    let instructions = new PIXI.Text("WASD to move player 1\nArrows to move player 2\nF for linked fireball attack\n" +
        "T to teleport player 2 to player 1\nR for rotate attack", {fontSize: "16px"});
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
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        teleport();
    };

    const rotateKey = keyboard(82);
    rotateKey.press = () => {
        rotateMagic();
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
            player.move(tileSize);
        }
    };
    leftKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x - 1, player.tilePosition.y)) {
            player.tilePosition.x--;
            player.move(tileSize);
        }
    };
    downKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x, player.tilePosition.y + 1)) {
            player.tilePosition.y++;
            player.move(tileSize);
        }
    };
    rightKey.press = () => {
        if (isNotAWall(gameMap, player.tilePosition.x + 1, player.tilePosition.y)) {
            player.tilePosition.x++;
            player.move(tileSize);
        }
    };
    return {upKey: upKey, leftKey: leftKey, downKey: downKey, rightKey: rightKey}
}

function isNotAWall(gameMap, tilePositionX, tilePositionY) {
    if (tilePositionX <= gameMap[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= gameMap.length - 1 && tilePositionY >= 0) {
            if (gameMap[tilePositionY][tilePositionX] !== 1) {
                return true
            }
        }
    }
    return false;
}