"use strict";

function drawTiles() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            if (Game.map[i][j].tile !== null) {
                Game.world.addChild(Game.map[i][j].tile);
                Game.tiles.push(Game.map[i][j].tile);
            }
        }
    }
}

function drawVoids() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            if (Game.map[i][j].tileType === TILE_TYPE.VOID) {
                const voidTile = new VoidTile(j, i);
                voidTile.zIndex = 999;
                Game.world.addChild(voidTile);
                Game.tiles.push(voidTile);
            }
        }
    }
}

function createDarkness() {
    for (let i = 0; i < Game.map.length; ++i) {
        Game.darkTiles[i] = [];
        for (let j = 0; j < Game.map[0].length; ++j) {
            Game.darkTiles[i][j] = null;
        }
    }

    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            const voidTile = new VoidTile(j, i);
            voidTile.zIndex = 10;
            Game.world.addChild(voidTile);
            Game.tiles.push(voidTile);
            Game.darkTiles[i][j] = voidTile;
        }
    }

    if (Game.stage === STAGE.DARK_TUNNEL) {
        for (let i = 0; i < Game.map.length; ++i) {
            Game.semiDarkTiles[i] = [];
            for (let j = 0; j < Game.map[0].length; ++j) {
                Game.semiDarkTiles[i][j] = null;
            }
        }

        for (let i = 0; i < Game.map.length; ++i) {
            for (let j = 0; j < Game.map[0].length; ++j) {
                const voidTile = new VoidTile(j, i);
                voidTile.zIndex = 9;
                voidTile.alpha = 0.85;
                Game.world.addChild(voidTile);
                Game.tiles.push(voidTile);
                Game.semiDarkTiles[i][j] = voidTile;
            }
        }
    }
}

function drawEntities() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            const entity = Game.map[i][j].entity;
            if (entity !== null) {
                Game.world.addChild(entity);
                Game.tiles.push(entity);
                if (entity.role === ROLE.ENEMY) {
                    Game.enemies.push(entity);
                }
            }
        }
    }
}

function drawHUD() {
    drawHealth();
    drawSlots();
}

function drawHealth() {
    redrawHealthForPlayer(Game.player);
    redrawHealthForPlayer(Game.player2);
}

function drawSlots() {
    redrawSlotsForPlayer(Game.player);
    redrawSlotsForPlayer(Game.player2);
}

function redrawHealthForPlayer(player) {
    const container = player === Game.player ? Game.hearts1 : Game.hearts2;
    removeAllChildrenFromContainer(container);
    const heartSize = 45;
    const heartRowOffset = 0;
    const heartColOffset = 5;
    const heartYOffset = 20;
    const heartXOffset = player === Game.player ? 50 : Game.APP.renderer.screen.width - 50 - (heartSize + heartColOffset) * 5 + heartColOffset;
    const healthArray = getHealthArray(player);
    for (let i = 0; i < healthArray.length; ++i) {
        const heart = new PIXI.Sprite(getHeartTexture(healthArray[i]));
        heart.width = heartSize;
        heart.height = heartSize;
        heart.position.y = heartYOffset + (heartRowOffset + heartSize) * Math.floor(i / 5);
        heart.position.x = heartXOffset + (i % 5) * (heartColOffset + heartSize);
        container.addChild(heart);
    }
}

function getHealthArray(entity) {
    let health = [];
    for (let i = 0; i < entity.maxHealth; ++i) {
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

function getHeartTexture(heartValue) {
    switch (heartValue) {
        case 1:
            return Game.resources["src/images/HUD/heart_full.png"].texture;
        case 0.75:
            return Game.resources["src/images/HUD/heart_75.png"].texture;
        case 0.5:
            return Game.resources["src/images/HUD/heart_half.png"].texture;
        case 0.25:
            return Game.resources["src/images/HUD/heart_25.png"].texture;
        case 0:
            return Game.resources["src/images/HUD/heart_empty.png"].texture;
        default:
            return Game.resources["src/images/void.png"].texture;
    }
}

function getHeartsBottomLineForPlayer(player) {
    const heartYOffset = 20;
    const heartRowOffset = 0;
    const heartSize = 45;
    return heartYOffset + (heartRowOffset + heartSize) * Math.ceil(player.maxHealth / 5)
}

function redrawSlotsForPlayer(player) {
    const container = player === Game.player ? Game.slots1 : Game.slots2;
    removeAllChildrenFromContainer(container);
    const slotSize = 70;
    const slotsRowOffset = 10;
    const slotsColOffset = 10;
    const slotsYOffset = getHeartsBottomLineForPlayer(player) + 15;
    const slotsXOffset = player === Game.player ? 20 : Game.APP.renderer.screen.width - 20 - (slotSize + slotsColOffset) * 4 + slotsColOffset;
    const slotsEquipmentOffset = player === Game.player ? slotsXOffset : Game.APP.renderer.screen.width - 20 - slotSize;
    const slotsSecondRowXOffset = player === Game.player ? slotsXOffset : Game.APP.renderer.screen.width - 20 - (slotSize + slotsColOffset) * 2 + slotsColOffset;
    const weaponSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_weapon.png"].texture);
    const secondHandSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_second_hand.png"].texture);
    const magicSlot1 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot2 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot3 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const magicSlot4 = new PIXI.Sprite(Game.resources["src/images/HUD/slot_magic.png"].texture);
    const headSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_head.png"].texture);
    const armorSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_armor.png"].texture);
    const feetSlot = new PIXI.Sprite(Game.resources["src/images/HUD/slot_feet.png"].texture);
    const topRowSlots = [magicSlot1, magicSlot2, magicSlot3, magicSlot4];
    const secondRowSlots = [weaponSlot, secondHandSlot];
    const columnSlots = [headSlot, armorSlot, feetSlot];

    const itemMargin = 15;
    for (let i = 0; i < topRowSlots.length; ++i) {
        topRowSlots[i].position.y = slotsYOffset;
        topRowSlots[i].position.x = slotsXOffset + (slotSize + slotsColOffset) * i;
        topRowSlots[i].width = slotSize;
        topRowSlots[i].height = slotSize;
        container.addChild(topRowSlots[i]);
        switch (topRowSlots[i]) {
            case magicSlot1:
                if (player.magic1 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic1.texture);
                    drawMagicUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic1);
                }
                break;
            case magicSlot2:
                if (player.magic2 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic2.texture);
                    drawMagicUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic2);
                }
                break;
            case magicSlot3:
                if (player.magic3 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic3.texture);
                    drawMagicUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic3);
                }
                break;
            case magicSlot4:
                if (player.magic4 !== null) {
                    drawEquipment(topRowSlots[i].position.x + itemMargin / 2, topRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.magic4.texture);
                    drawMagicUses(topRowSlots[i].position.x + topRowSlots[i].width, topRowSlots[i].position.y, container, player.magic4);
                }
                break;
        }
    }
    for (let i = 0; i < secondRowSlots.length; ++i) {
        secondRowSlots[i].position.y = slotsYOffset + slotSize + slotsRowOffset;
        secondRowSlots[i].position.x = slotsSecondRowXOffset + (slotSize + slotsColOffset) * i;
        secondRowSlots[i].width = slotSize;
        secondRowSlots[i].height = slotSize;
        container.addChild(secondRowSlots[i]);
        switch (secondRowSlots[i]) {
            case weaponSlot:
                if (player.weapon !== null) drawEquipment(secondRowSlots[i].position.x + itemMargin / 2, secondRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.weapon.texture);
                break;
            case secondHandSlot:
                if (player.secondHand !== null) drawEquipment(secondRowSlots[i].position.x + itemMargin / 2, secondRowSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.secondHand.texture);
                break;
        }
    }
    if (player === Game.player) drawStatsForPlayer(secondRowSlots[1].position.x + secondRowSlots[1].width + 20, secondRowSlots[1].position.y + secondRowSlots[1].height / 2, container, player);
    else drawStatsForPlayer(secondRowSlots[0].position.x - 10, secondRowSlots[0].position.y + secondRowSlots[0].height / 2, container, player);
    for (let i = 0; i < columnSlots.length; ++i) {
        columnSlots[i].position.y = slotsYOffset + (slotSize + slotsRowOffset) * (i + 2);
        columnSlots[i].position.x = slotsEquipmentOffset;
        columnSlots[i].width = slotSize;
        columnSlots[i].height = slotSize;
        container.addChild(columnSlots[i]);
        switch (columnSlots[i]) {
            case headSlot:
                if (player.headwear !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.headwear.texture);
                break;
            case armorSlot:
                if (player.armor !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.armor.texture);
                break;
            case feetSlot:
                if (player.footwear !== null) drawEquipment(columnSlots[i].position.x + itemMargin / 2, columnSlots[i].position.y + itemMargin / 2, slotSize - itemMargin, container, player.footwear.texture);
                break;
        }
    }

    function drawEquipment(posX, posY, size, container, texture) {
        const sprite = new PIXI.Sprite(texture);
        sprite.position.set(posX, posY);
        sprite.width = size;
        sprite.height = size;
        sprite.zIndex = -1;
        container.addChild(sprite);
    }

    function drawMagicUses(rightPosX, topPosY, container, magic) {
        const fontSize = 16;
        const text = new PIXI.Text(magic.uses + "/" + magic.maxUses, {
            fontSize: fontSize,
            fill: 0xffffff,
            fontWeight: "bold",
            stroke: 0x000000,
            strokeThickness: 2
        });
        text.position.set(rightPosX - text.width, topPosY);
        container.addChild(text);
    }

    function drawStatsForPlayer(posX, posY, container, player) {
        const fontSize = 16;
        const text = new PIXI.Text(`ATK = ${player.getAtkBaseWithWeapon(player.weapon)} * ${player.atkMul} = ${player.getAtkWithWeapon(player.weapon)}\n\nDEF = ${player.getDefBase()} * ${player.defMul} = ${player.getDef()}`, {
            fontSize: fontSize,
            fill: 0xffffff,
            fontWeight: "bold",
            stroke: 0x000000,
            strokeThickness: 2
        });
        if (player === Game.player) text.position.set(posX, posY - text.height / 2);
        else text.position.set(posX - text.width, posY - text.height / 2);
        container.addChild(text);
    }
}

function drawGrid() {
    let gridTexture = Game.resources["src/images/grid.png"].texture;
    let grid = new PIXI.TilingSprite(gridTexture, Game.map[0].length * gridTexture.width, Game.map.length * gridTexture.height);
    grid.scale.set(Game.TILESIZE / gridTexture.width, Game.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * Game.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * Game.TILESIZE / gridTexture.height;
    grid.tint = decrementEachDigitInHex(Game.BGColor);
    grid.zIndex = -2;
    Game.world.addChild(grid);
    return grid;
}

function drawOther() {
    let gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(Game.BGColor);
    gameWorldBG.drawRect(10, 10, Game.world.width - 20, Game.world.height - 20);
    gameWorldBG.zIndex = -3;
    //to hide grid on world borders
    const gridBorderWidth = -2 * Game.TILESIZE / Game.resources["src/images/grid.png"].texture.width;
    let blackOutline = new PIXI.Graphics();
    blackOutline.lineStyle(3, 0x000000);
    blackOutline.drawRect(gridBorderWidth, gridBorderWidth, Game.world.width, Game.world.height);
    blackOutline.endFill();
    Game.world.addChild(gameWorldBG);
    Game.world.addChild(blackOutline);
    Game.otherGraphics.push(gameWorldBG);
    Game.otherGraphics.push(blackOutline);
}

function redrawTiles() {
    Game.world.removeChild(Game.grid);
    Game.grid = drawGrid();
    for (const graphic of Game.otherGraphics) {
        Game.world.removeChild(graphic);
    }
    Game.otherGraphics = [];

    for (const enemy of Game.enemies) {
        if (!enemy.dead) enemy.redrawHealth();
    }

    for (const tile of Game.tiles) {
        tile.fitToTile();
        tile.place();
    }

    for (const hazard of Game.hazards) {
        hazard.fitToTile();
        hazard.place();
    }

    drawOther();
    centerCamera();
}

let litAreas = [];
let litDTAreas = [];

function lightPlayerPosition(player) {
    litAreas = [];
    let pathDist = 5;
    let roomDist = 9;
    if (Game.stage === STAGE.DARK_TUNNEL) {
        pathDist = 2;
        roomDist = 2;
    }
    const px = player.tilePosition.x;
    const py = player.tilePosition.y;
    if (Game.map[py][px].tileType === TILE_TYPE.PATH) {
        lightWorld(px, py, true, pathDist);
    } else if (Game.map[py][px].tileType === TILE_TYPE.NONE) {
        lightWorld(px, py, false, roomDist);
    } else if (Game.map[py][px].tileType === TILE_TYPE.ENTRY) {
        if ((Game.map[py + 1][px].tileType === TILE_TYPE.PATH && !Game.map[py + 1][px].lit)
            || (Game.map[py - 1][px].tileType === TILE_TYPE.PATH && !Game.map[py - 1][px].lit)
            || (Game.map[py][px + 1].tileType === TILE_TYPE.PATH && !Game.map[py][px + 1].lit)
            || (Game.map[py][px - 1].tileType === TILE_TYPE.PATH && !Game.map[py][px - 1].lit)) {
            lightWorld(px, py, true, pathDist);
        } else {
            lightWorld(px, py, false, roomDist);
        }
    }

    //later you will change that if so it checks if player has torch
    if (Game.stage === STAGE.DARK_TUNNEL && player === Game.player) {
        for (const tile of litDTAreas) {
            Game.semiDarkTiles[tile.y][tile.x].visible = true;
        }
        litDTAreas = [];
        lightWorldDTSpecial(px, py, 2);
    }
}

//lightPaths == true -> light paths until we encounter none else light nones until we encounter path
function lightWorld(tileX, tileY, lightPaths, distance = 8, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].tileType === TILE_TYPE.ENTRY
            || (lightPaths && Game.map[tileY][tileX].tileType === TILE_TYPE.PATH)
            || ((!lightPaths && Game.map[tileY][tileX].tileType === TILE_TYPE.NONE) || Game.map[tileY][tileX].tileType === TILE_TYPE.EXIT)) {
            if (!Game.map[tileY][tileX].lit) {
                Game.world.removeChild(Game.darkTiles[tileY][tileX]);
                Game.map[tileY][tileX].lit = true;
            }

            litAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, 0);
                lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, 0);
                lightWorld(tileX, tileY + 1, lightPaths, distance - 1, 0, -1);
                lightWorld(tileX, tileY - 1, lightPaths, distance - 1, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorld(tileX, tileY - 1, lightPaths, distance - 1, sourceDirX, 1);
                    if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorld(tileX, tileY + 1, lightPaths, distance - 1, sourceDirX, -1);
                }
                if (!litAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorld(tileX, tileY - sourceDirY, lightPaths, distance - 1, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!litAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorld(tileX - 1, tileY, lightPaths, distance - 1, 1, sourceDirY);
                    if (!litAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorld(tileX + 1, tileY, lightPaths, distance - 1, -1, sourceDirY);
                }
                if (!litAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorld(tileX - sourceDirX, tileY, lightPaths, distance - 1, sourceDirX, sourceDirY);
            }

            //light diagonal walls
            if (!Game.map[tileY + 1][tileX + 1].lit && (Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY + 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX - 1].lit && (Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY - 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY + 1][tileX - 1].lit && (Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.WALL || Game.map[tileY + 1][tileX - 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX - 1, tileY + 1, lightPaths, distance - 1);
            }
            if (!Game.map[tileY - 1][tileX + 1].lit && (Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.WALL || Game.map[tileY - 1][tileX + 1].tileType === TILE_TYPE.SUPER_WALL)) {
                lightWorld(tileX + 1, tileY - 1, lightPaths, distance - 1);
            }

        } else if (Game.map[tileY][tileX].tileType === TILE_TYPE.WALL || Game.map[tileY][tileX].tileType === TILE_TYPE.SUPER_WALL) {
            if (!Game.map[tileY][tileX].lit) {
                Game.world.removeChild(Game.darkTiles[tileY][tileX]);
                Game.map[tileY][tileX].lit = true;
            }
        }
    }
}

function lightWorldDTSpecial(tileX, tileY, distance = 3, sourceDirX = 0, sourceDirY = 0) {
    if (distance > -1) {
        if (Game.map[tileY][tileX].lit) {
            Game.semiDarkTiles[tileY][tileX].visible = false;
            litDTAreas.push({x: tileX, y: tileY});
            if (sourceDirX === 0 && sourceDirY === 0) {
                lightWorldDTSpecial(tileX + 1, tileY, distance - 1, -1, 0);
                lightWorldDTSpecial(tileX - 1, tileY, distance - 1, 1, 0);
                lightWorldDTSpecial(tileX, tileY + 1, distance - 1, 0, -1);
                lightWorldDTSpecial(tileX, tileY - 1, distance - 1, 0, 1);
            } else {
                if (sourceDirY === 0) {
                    if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY - 1)) lightWorldDTSpecial(tileX, tileY - 1, distance - 1, sourceDirX, 1);
                    if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY + 1)) lightWorldDTSpecial(tileX, tileY + 1, distance - 1, sourceDirX, -1);
                }
                if (!litDTAreas.some(tile => tile.x === tileX && tile.y === tileY - sourceDirY)) lightWorldDTSpecial(tileX, tileY - sourceDirY, distance - 1, sourceDirX, sourceDirY);
                if (sourceDirX === 0) {
                    if (!litDTAreas.some(tile => tile.x === tileX - 1 && tile.y === tileY)) lightWorldDTSpecial(tileX - 1, tileY, distance - 1, 1, sourceDirY);
                    if (!litDTAreas.some(tile => tile.x === tileX + 1 && tile.y === tileY)) lightWorldDTSpecial(tileX + 1, tileY, distance - 1, -1, sourceDirY);
                }
                if (!litDTAreas.some(tile => tile.x === tileX - sourceDirX && tile.y === tileY)) lightWorldDTSpecial(tileX - sourceDirX, tileY, distance - 1, sourceDirX, sourceDirY);
            }
        } else if (Game.map[tileY][tileX].tileType === TILE_TYPE.WALL || Game.map[tileY][tileX].tileType === TILE_TYPE.SUPER_WALL) {
            Game.semiDarkTiles[tileY][tileX].visible = false;
        }
    }
}