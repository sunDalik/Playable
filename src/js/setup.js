//Aliases
let Sprite = PIXI.Sprite;

let player, player2;
const tileSize = 75;
const walls = [
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

//Creating app
let app = new PIXI.Application();
app.renderer.backgroundColor = 0xBB00BB;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);

//Adding sprites to stage
let loader = app.loader;
let resources = app.loader.resources;
loader
    .add("src/images/player.png")
    .add("src/images/player2.png")
    .add("src/images/fire.png")
    .add("src/images/wall.png")
    .on("progress", loadProgressHandler)
    .load(setup);

let grid = new PIXI.Graphics();
for (let y = 0; y < app.view.height; y += tileSize) {
    for (let x = 0; x < app.view.width; x += tileSize) {
        grid.lineStyle(2, 0xAA00AA);
        grid.drawRect(x, y, tileSize, tileSize);
    }
}
app.stage.addChild(grid);

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    player = new Player(resources["src/images/player.png"].texture, 7, 4);
    player.scale.set(player.getScale(tileSize).x, player.getScale(tileSize).y);
    player.position.set(player.getPosition(tileSize).x, player.getPosition(tileSize).y);
    app.stage.addChild(player);

    player2 = new Player(resources["src/images/player2.png"].texture, 12, 4);
    player2.scale.set(player2.getScale(tileSize).x, player2.getScale(tileSize).y);
    player2.position.set(player2.getPosition(tileSize).x, player2.getPosition(tileSize).y);
    app.stage.addChild(player2);

    app.ticker.add(delta => gameLoop(delta));
    createWalls(walls);
    displayInstructions();
    bindKeys();
}

function gameLoop(delta) {

}

function createWalls(walls) {
    for (let i = 0; i < walls.length; ++i) {
        for (let j = 0; j < walls[0].length; ++j) {
            if (walls[i][j] === 1) {
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
        "T to teleport player 2 to player 1", {fontSize: "16px"});
    let rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(30, 30, instructions.width + 20, instructions.height + 20);
    instructions.position.set(40, 40);
    app.stage.addChild(rect);
    app.stage.addChild(instructions);
}

function bindKeys() {
    const wKey = keyboard(87);
    const aKey = keyboard(65);
    const sKey = keyboard(83);
    const dKey = keyboard(68);
    wKey.press = () => {
        if (isMovementPossible(walls, player.tilePosition.x, player.tilePosition.y - 1)) {
            player.tilePosition.y--;
            player.move(tileSize);
        }
    };
    aKey.press = () => {
        if (isMovementPossible(walls, player.tilePosition.x - 1, player.tilePosition.y)) {
            player.tilePosition.x--;
            player.move(tileSize);
        }
    };
    sKey.press = () => {
        if (isMovementPossible(walls, player.tilePosition.x, player.tilePosition.y + 1)) {
            player.tilePosition.y++;
            player.move(tileSize);
        }
    };
    dKey.press = () => {
        if (isMovementPossible(walls, player.tilePosition.x + 1, player.tilePosition.y)) {
            player.tilePosition.x++;
            player.move(tileSize);
        }
    };

    const upKey = keyboard(38);
    const leftKey = keyboard(37);
    const downKey = keyboard(40);
    const rightKey = keyboard(39);
    upKey.press = () => {
        if (isMovementPossible(walls, player2.tilePosition.x, player2.tilePosition.y - 1)) {
            player2.tilePosition.y--;
            player2.move(tileSize);
        }
    };
    leftKey.press = () => {
        if (isMovementPossible(walls, player2.tilePosition.x - 1, player2.tilePosition.y)) {
            player2.tilePosition.x--;
            player2.move(tileSize);
        }
    };
    downKey.press = () => {
        if (isMovementPossible(walls, player2.tilePosition.x, player2.tilePosition.y + 1)) {
            player2.tilePosition.y++;
            player2.move(tileSize);
        }
    };
    rightKey.press = () => {
        if (isMovementPossible(walls, player2.tilePosition.x + 1, player2.tilePosition.y)) {
            player2.tilePosition.x++;
            player2.move(tileSize);
        }
    };

    const fireKey = keyboard(70);
    fireKey.press = () => {
        fireball();
    };

    const teleportKey = keyboard(84);
    teleportKey.press = () => {
        teleport();
    };
}

function isMovementPossible(walls, tilePositionX, tilePositionY) {
    if (tilePositionX <= walls[0].length - 1 && tilePositionX >= 0) {
        if (tilePositionY <= walls.length - 1 && tilePositionY >= 0) {
            if (walls[tilePositionY][tilePositionX] !== 1) {
                return true
            }
        }
    }
    return false;
}