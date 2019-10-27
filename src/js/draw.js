"use strict";

function drawWalls() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j].wall === true) {
                let wall = new PIXI.Sprite(GameState.resources["src/images/wall.png"].texture);
                wall.position.set(GameState.TILESIZE * j, GameState.TILESIZE * i);
                wall.width = wall.height = GameState.TILESIZE;
                GameState.gameWorld.addChild(wall);
            }
        }
    }
}

function drawVoids() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j].void === true) {
                let voidTile = new PIXI.Sprite(GameState.resources["src/images/void.png"].texture);
                voidTile.position.set(GameState.TILESIZE * j, GameState.TILESIZE * i);
                voidTile.width = voidTile.height = GameState.TILESIZE;
                voidTile.zIndex = 999;
                GameState.gameWorld.addChild(voidTile);
            }
        }
    }
}

function drawEnemies() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            const entity = GameState.gameMap[i][j].entity;
            if (entity !== null && entity.role === ROLE.ENEMY) {
                addEnemyToStage(entity);
                GameState.enemies.push(entity);
            }
        }
    }
}

function addEnemyToStage(enemy) {
    enemy.place();
    GameState.gameWorld.addChild(enemy);
}

function displayInstructions() {
    let instructions = new PIXI.Text("WASD to move player 1\nArrows to move player 2\nF for linked fireball attack\n" +
        "T to teleport player 2 to player 1\nR for rotate attack\nC for cross attack\nCtrl to switch z-index", {fontSize: "16px"});
    let rect = new PIXI.Graphics();
    rect.beginFill(0xFFFFFF);
    rect.drawRect(10, 10, instructions.width + 20, instructions.height + 20);
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
    GameState.gameWorld.addChild(grid);
    return grid;
}
