"use strict";

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
            } else if (GameState.gameMap[i][j] === "rb") {
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i);
            } else if (GameState.gameMap[i][j] === "s") {
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i);
            } else if (GameState.gameMap[i][j] === "sb") {
                enemy = new Roller(resources["src/images/enemies/roller.png"].texture, j, i);
            }
            if (enemy !== null) {
                addEnemyToStage(enemy);
                GameState.enemies.push(enemy);
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
    let grid = new PIXI.TilingSprite(gridTexture, app.view.width * gridTexture.width / GameState.TILESIZE, app.view.height * gridTexture.height / GameState.TILESIZE);
    grid.scale.set(GameState.TILESIZE / gridTexture.width, GameState.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * GameState.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * GameState.TILESIZE / gridTexture.height;
    grid.tint = 0x9abec0;
    app.stage.addChild(grid);
    return grid;
}
