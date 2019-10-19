//Aliases
let Sprite = PIXI.Sprite;

let player, player2;
const tileSize = 75;

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
    .on("progress", loadProgressHandler)
    .load(setup);

let grid = new PIXI.Graphics();
for (let y = 0; y < app.view.height; y += tileSize) {
    for (let x = 0; x < app.view.width; x += tileSize) {
        grid.lineStyle(1, 0x000000);
        grid.drawRect(x, y, tileSize, tileSize);
    }
}
app.stage.addChild(grid);

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    player = new Sprite(resources["src/images/player.png"].texture);
    player.scale.set(tileSize / player.width - 0.25, tileSize / player.height - 0.25);
    player.position.set(tileSize * 6 + (tileSize - player.width) / 2, tileSize * 4 + (tileSize - player.height) / 2);
    app.stage.addChild(player);

    player2 = new Sprite(resources["src/images/player2.png"].texture);
    player2.scale.set(tileSize / player2.width - 0.25, tileSize / player2.height - 0.25);
    player2.position.set(tileSize * 9 + (tileSize - player2.width) / 2, tileSize * 4 + (tileSize - player2.height) / 2);
    app.stage.addChild(player2);

    app.ticker.add(delta => gameLoop(delta));
    displayInstructions();
    bindKeys();
}

function gameLoop(delta) {

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
        player.y -= tileSize;
    };
    aKey.press = () => {
        player.x -= tileSize;
    };
    sKey.press = () => {
        player.y += tileSize;
    };
    dKey.press = () => {
        player.x += tileSize;
    };

    const upKey = keyboard(38);
    const leftKey = keyboard(37);
    const downKey = keyboard(40);
    const rightKey = keyboard(39);
    upKey.press = () => {
        player2.y -= tileSize;
    };
    leftKey.press = () => {
        player2.x -= tileSize;
    };
    downKey.press = () => {
        player2.y += tileSize;
    };
    rightKey.press = () => {
        player2.x += tileSize;
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