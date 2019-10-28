"use strict";

function drawWalls() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j].wall === true) {
                let wallTile = new WallTile(j, i);
                GameState.gameWorld.addChild(wallTile);
                GameState.tiles.push(wallTile);
            }
        }
    }
}

function drawVoids() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j].void === true) {
                let voidTile = new VoidTile(j, i);
                voidTile.zIndex = 999;
                GameState.gameWorld.addChild(voidTile);
                GameState.tiles.push(voidTile);
            }
        }
    }
}

function drawEnemies() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            const entity = GameState.gameMap[i][j].entity;
            if (entity !== null && entity.role === ROLE.ENEMY) {
                GameState.gameWorld.addChild(entity);
                GameState.enemies.push(entity);
                GameState.tiles.push(entity);
            }
        }
    }
}

function displayInstructions() {
    let instructions = new PIXI.Text("WASD to move player 1\nArrows to move player 2\nF for linked fireball attack\n" +
        "T to teleport player 2 to player 1\nR for rotate attack\nC for cross attack\nCtrl to switch z-index", {fontSize: "16px"});
    let rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(10, 10, instructions.width + 20, instructions.height + 20);
    rect.alpha = 0.85;
    instructions.position.set(20, 20);
    GameState.HUD.addChild(rect);
    GameState.HUD.addChild(instructions);
}

function drawGrid() {
    let gridTexture = GameState.resources["src/images/grid.png"].texture;
    let grid = new PIXI.TilingSprite(gridTexture, GameState.gameMap[0].length * gridTexture.width, GameState.gameMap.length * gridTexture.height);
    grid.scale.set(GameState.TILESIZE / gridTexture.width, GameState.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * GameState.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * GameState.TILESIZE / gridTexture.height;
    grid.tint = 0x9abec0;
    grid.zIndex = -1;
    GameState.gameWorld.addChild(grid);
    return grid;
}

function drawOther() {
    let gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(0xabcfd1);
    gameWorldBG.drawRect(10, 10, GameState.gameWorld.width - 20, GameState.gameWorld.height - 20);
    gameWorldBG.zIndex = -2;
    //to hide grid on gameWorld borders
    const gridBorderWidth = -2 * GameState.TILESIZE / GameState.resources["src/images/grid.png"].texture.width;
    let blackOutline = new PIXI.Graphics();
    blackOutline.lineStyle(3, 0x000000);
    blackOutline.drawRect(gridBorderWidth, gridBorderWidth, GameState.gameWorld.width, GameState.gameWorld.height);
    blackOutline.endFill();
    GameState.gameWorld.addChild(gameWorldBG);
    GameState.gameWorld.addChild(blackOutline);
    GameState.otherGraphics.push(gameWorldBG);
    GameState.otherGraphics.push(blackOutline);
}

//bug with player jumps
function redrawTiles() {
    GameState.gameWorld.removeChild(GameState.grid);
    GameState.grid = drawGrid();
    for (const graphic of GameState.otherGraphics) {
        GameState.gameWorld.removeChild(graphic);
    }
    GameState.otherGraphics = [];

    for (const tile of GameState.tiles) {
        tile.fitToTile();
        tile.place();
    }

    drawOther();
    centerCamera();
}