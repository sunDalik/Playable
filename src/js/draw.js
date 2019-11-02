"use strict";

function drawWalls() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            if (GameState.gameMap[i][j].tileType === TILE_TYPE.WALL) {
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
            if (GameState.gameMap[i][j].tileType === TILE_TYPE.VOID) {
                let voidTile = new VoidTile(j, i);
                voidTile.zIndex = 999;
                GameState.gameWorld.addChild(voidTile);
                GameState.tiles.push(voidTile);
            }
        }
    }
}

function createDarkness() {
    for (let i = 0; i < GameState.gameMap.length; ++i) {
        GameState.darkTiles[i] = [];
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            GameState.darkTiles[i][j] = null;
        }
    }

    for (let i = 0; i < GameState.gameMap.length; ++i) {
        for (let j = 0; j < GameState.gameMap[0].length; ++j) {
            let voidTile = new VoidTile(j, i);
            voidTile.zIndex = 999;
            GameState.gameWorld.addChild(voidTile);
            GameState.tiles.push(voidTile);
            GameState.darkTiles[i][j] = voidTile;
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

function drawHUD() {
    removeAllChildrenFromContainer(GameState.HEARTS1);
    removeAllChildrenFromContainer(GameState.HEARTS2);
    drawHealth();
}

function drawHealth() {
    redrawHealthForPlayer(GameState.player);
    redrawHealthForPlayer(GameState.player2);
}

function redrawHealthForPlayer(player) {
    const container = player === GameState.player ? GameState.HEARTS1 : GameState.HEARTS2;
    removeAllChildrenFromContainer(container);
    const heartXOffset = player === GameState.player ? 50 : GameState.APP.renderer.screen.width - 350;
    const heartYOffset = 20;
    const heartRowOffset = 0;
    const heartColOffset = 5;
    const heartSize = 45;
    const healthArray = getHealthArray(player);
    for (let i = 0; i < healthArray.length; ++i) {
        let heart;
        switch (healthArray[i]) {
            case 1:
                heart = new PIXI.Sprite(GameState.resources["src/images/HUD/heart_full.png"].texture);
                break;

            case 0.75:
                heart = new PIXI.Sprite(GameState.resources["src/images/HUD/heart_75.png"].texture);
                break;

            case 0.5:
                heart = new PIXI.Sprite(GameState.resources["src/images/HUD/heart_half.png"].texture);
                break;

            case 0.25:
                heart = new PIXI.Sprite(GameState.resources["src/images/HUD/heart_25.png"].texture);
                break;

            case 0:
                heart = new PIXI.Sprite(GameState.resources["src/images/HUD/heart_empty.png"].texture);
                break;

            default:
                heart = new PIXI.Sprite(GameState.resources["src/images/void.png"].texture);
                break;
        }
        heart.width = heartSize;
        heart.height = heartSize;
        heart.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.floor(i / 5);
        heart.position.x = heartXOffset + (i % 5) * (heartColOffset + heartSize);
        container.addChild(heart);
    }
}

function getHealthArray(entity) {
    let health = [];
    for (let i = 0; i < entity.maxhealth; ++i) {
        if (i === Math.trunc(entity.health) && entity.health > 0) {
            health[i] = Number((entity.health - Math.trunc(entity.health)).toFixed(2));
        } else {
            if (i + 1 <= entity.health) {
                health[i] = 1;
            } else {
                health[i] = 0;
            }
        }
    }
    return health;
}

function drawGrid() {
    let gridTexture = GameState.resources["src/images/grid.png"].texture;
    let grid = new PIXI.TilingSprite(gridTexture, GameState.gameMap[0].length * gridTexture.width, GameState.gameMap.length * gridTexture.height);
    grid.scale.set(GameState.TILESIZE / gridTexture.width, GameState.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * GameState.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * GameState.TILESIZE / gridTexture.height;
    grid.tint = 0x9abec0;
    grid.zIndex = -2;
    GameState.gameWorld.addChild(grid);
    return grid;
}

function drawOther() {
    let gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(0xabcfd1);
    gameWorldBG.drawRect(10, 10, GameState.gameWorld.width - 20, GameState.gameWorld.height - 20);
    gameWorldBG.zIndex = -3;
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

    for (const hazard of GameState.hazards) {
        hazard.fitToTile();
        hazard.place();
    }

    drawOther();
    centerCamera();
}

function lightPlayerPosition(player) {
    const px = player.tilePosition.x;
    const py = player.tilePosition.y;
    if (GameState.gameMap[py][px].tileType === TILE_TYPE.PATH) {
        lightWorld(px, py, true);
    } else if (GameState.gameMap[py][px].tileType === TILE_TYPE.NONE) {
        lightWorld(px, py, false);
    } else if (GameState.gameMap[py][px].tileType === TILE_TYPE.ENTRY) {
        if ((GameState.gameMap[py + 1][px].tileType === TILE_TYPE.PATH && !GameState.gameMap[py + 1][px].lit)
            || (GameState.gameMap[py - 1][px].tileType === TILE_TYPE.PATH && !GameState.gameMap[py - 1][px].lit)
            || (GameState.gameMap[py][px + 1].tileType === TILE_TYPE.PATH && !GameState.gameMap[py][px + 1].lit)
            || (GameState.gameMap[py][px - 1].tileType === TILE_TYPE.PATH && !GameState.gameMap[py][px - 1].lit)) {
            lightWorld(px, py, true);
        } else lightWorld(px, py, false);
    }
}

//lightPaths == true -> light paths until we encounter none else light nones until we encounter path
function lightWorld(tileX, tileY, lightPaths, distance = 8, litAreas = []) {
    if (distance > -1) {
        if (GameState.gameMap[tileY][tileX].tileType === TILE_TYPE.ENTRY
            || (lightPaths && GameState.gameMap[tileY][tileX].tileType === TILE_TYPE.PATH)
            || (!lightPaths && GameState.gameMap[tileY][tileX].tileType === TILE_TYPE.NONE)) {
            if (!GameState.gameMap[tileY][tileX].lit) {
                GameState.gameWorld.removeChild(GameState.darkTiles[tileY][tileX]);
                GameState.gameMap[tileY][tileX].lit = true;
                if (GameState.gameMap[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL) lightWorld(tileX + 1, tileY + 1, lightPaths, distance);
                if (GameState.gameMap[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL) lightWorld(tileX - 1, tileY - 1, lightPaths, distance);
                if (GameState.gameMap[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL) lightWorld(tileX - 1, tileY + 1, lightPaths, distance);
                if (GameState.gameMap[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL) lightWorld(tileX + 1, tileY - 1, lightPaths, distance);
            }
            if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY)) {
                litAreas.push({x: tileX, y: tileY});
            }
            if (litAreas.some(tile => !(tile.x === tileX + 1 && tile.y === tileY))) lightWorld(tileX + 1, tileY, lightPaths, distance - 1, litAreas);
            if (litAreas.some(tile => !(tile.x === tileX - 1 && tile.y === tileY))) lightWorld(tileX - 1, tileY, lightPaths, distance - 1, litAreas);
            if (litAreas.some(tile => !(tile.x === tileX && tile.y === tileY + 1))) lightWorld(tileX, tileY + 1, lightPaths, distance - 1, litAreas);
            if (litAreas.some(tile => !(tile.x === tileX && tile.y === tileY - 1))) lightWorld(tileX, tileY - 1, lightPaths, distance - 1, litAreas);
        } else if (GameState.gameMap[tileY][tileX].tileType === TILE_TYPE.WALL) {
            GameState.gameWorld.removeChild(GameState.darkTiles[tileY][tileX]);
            GameState.gameMap[tileY][tileX].lit = true;
        }
    }
}