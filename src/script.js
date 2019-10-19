//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache;

let player, player2;
const tileSize = 75;

//Creating app
let app = new Application();
app.renderer.backgroundColor = 0xBB00BB;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);

//Adding sprites to stage
loader
    .add("src/images/player.png")
    .add("src/images/player2.png")
    .add("src/images/fire.png")
    .on("progress", loadProgressHandler)
    .load(setup);

let gameMap = new PIXI.Graphics();
for (let y = 0; y < app.view.height; y += tileSize) {
    for (let x = 0; x < app.view.width; x += tileSize) {
        gameMap.lineStyle(1, 0x000000);
        gameMap.drawRect(x, y, tileSize, tileSize);
    }
}
app.stage.addChild(gameMap);

function loadProgressHandler(loader, resource) {
    console.log("Loading resource: " + resource.url);
    console.log("Progress: " + loader.progress + "%");
}

function setup() {
    player = new Sprite(resources["src/images/player.png"].texture);
    app.stage.addChild(player);
    player.scale.set(tileSize / player.width - 0.25, tileSize / player.height - 0.25);
    player.position.set(tileSize * 6 + (tileSize - player.width) / 2, tileSize * 4 + (tileSize - player.height) / 2);
    player2 = new Sprite(resources["src/images/player2.png"].texture);
    app.stage.addChild(player2);
    player2.scale.set(tileSize / player2.width - 0.25, tileSize / player2.height - 0.25);
    player2.position.set(tileSize * 9 + (tileSize - player2.width) / 2, tileSize * 4 + (tileSize - player2.height) / 2);
    app.ticker.add(delta => gameLoop(delta));

    let instructions = new PIXI.Text("WASD to move player 1\nArrows to move player 2\nF for linked fireball attack");
    let rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(30, 30, instructions.width + 20, instructions.height + 20);
    instructions.position.set(40, 40);
    app.stage.addChild(rect);
    app.stage.addChild(instructions);

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
    }
}

function gameLoop(delta) {

}

function fireball() {
    let fire = new Sprite(resources["src/images/fire.png"].texture);
    const fireHeight = tileSize * 0.4;
    fire.position.set(player.x + player.width / 2, player.y + player.height / 2 - fireHeight / 2);
    fire.width = Math.sqrt((player2.x - player.x) ** 2 + (player.y - player2.y) ** 2);
    fire.height = fireHeight;
    app.stage.addChild(fire);
    fire.rotation = Math.atan((player2.y - player.y) / (player2.x - player.x));
    if ((player2.x - player.x) < 0) {
        fire.rotation += Math.PI;
    }
    const disappearTime = 300;
    let delay = 40;
    const interval = setInterval(() => {
        if (delay <= 0) {
            fire.alpha -= 0.01;
        }
        delay--;
    }, disappearTime / 100);
    setTimeout(() => {
        app.stage.removeChild(fire);
        clearInterval(interval);
    }, disappearTime)
}

function keyboard(code) {
    let key = {
        code: code,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined
    };

    key.downHandler = event => {
        if (event.which === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    key.upHandler = event => {
        if (event.which === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}