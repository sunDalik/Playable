//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.utils.TextureCache;

let triangle;
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
    triangle = new Sprite(resources["src/images/player.png"].texture);
    app.stage.addChild(triangle);
    triangle.scale.set(tileSize / triangle.width - 0.25, tileSize / triangle.height - 0.25);
    triangle.position.set(tileSize * 6 + (tileSize - triangle.width)/2, tileSize * 4 + (tileSize - triangle.height)/2);
    app.ticker.add(delta => gameLoop(delta));
    const wKey = keyboard(87);
    const aKey = keyboard(65);
    const sKey = keyboard(83);
    const dKey = keyboard(68);

    wKey.press = () => {
        triangle.y -= tileSize;
    };
    aKey.press = () => {
        triangle.x -= tileSize;
    };
    sKey.press = () => {
        triangle.y += tileSize;
    };
    dKey.press = () => {
        triangle.x += tileSize;
    };
}

function gameLoop(delta) {

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
        console.log(event);
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