"use strict";

function enemyTurn() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTimeout(() => {
            moveEnemies();
            updateHazards();
            Game.enemiesTimeout = null;
        }, 60);
    }
}

function moveEnemies() {
    for (const enemy of Game.enemies) {
        if (!enemy.dead) {
            if (enemy.stun <= 0) {
                if (enemy.cancellable) {
                    enemy.cancelAnimation();
                }
                enemy.move();
            } else enemy.stun--;
        }
    }
}

function updateHazards() {
    for (let i = 0; i < Game.hazards.length; ++i) {
        const lives = Game.hazards[i].updateLifetime();
        if (!lives) i--; //dead hazards are removed from array, so we don't increment i
    }
}

function playerTurn(player, playerMove, bothPlayers = false) {
    if (/*Game.playerMoved !== player
        &&*/ ((bothPlayers && !Game.player.dead && !Game.player2.dead) || (!bothPlayers && !player.dead))) {
        if (Game.enemiesTimeout !== null) {
            clearTimeout(Game.enemiesTimeout);
            moveEnemies();
            updateHazards();
            Game.enemiesTimeout = null;
        }

        if (bothPlayers) {
            Game.player.cancelAnimation();
            Game.player2.cancelAnimation();
        } else player.cancelAnimation();
        const moveResult = playerMove();
        if (moveResult !== false) {
            damagePlayersWithHazards();
            /*if (Game.playerMoved !== null) {
                Game.playerMoved.setUnmovedTexture();
                Game.playerMoved = null;*/
            enemyTurn();
            /*} else {
                Game.playerMoved = player;
                Game.playerMoved.setMovedTexture();
            }*/
        }
    }
}

function damagePlayersWithHazards() {
    if (Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard !== null && !Game.player.dead) {
        Game.player.damage(Game.map[Game.player.tilePosition.y][Game.player.tilePosition.x].hazard.atk)
    }
    if (Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard !== null && !Game.player2.dead) {
        Game.player2.damage(Game.map[Game.player2.tilePosition.y][Game.player2.tilePosition.x].hazard.atk)
    }
}

function removePlayerFromGameMap(player) {
    if (player === Game.map[player.tilePosition.y][player.tilePosition.x].entity) {
        Game.map[player.tilePosition.y][player.tilePosition.x].entity = Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity;
        Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
    } else if (player === Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity) {
        Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
    }
}

function placePlayerOnGameMap(player) {
    if (Game.map[player.tilePosition.y][player.tilePosition.x].entity !== null && Game.map[player.tilePosition.y][player.tilePosition.x].entity.role === ROLE.PLAYER) {
        if (player === Game.primaryPlayer) {
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = Game.map[player.tilePosition.y][player.tilePosition.x].entity;
            Game.map[player.tilePosition.y][player.tilePosition.x].entity = player;
        } else {
            Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = player;
        }
    } else {
        Game.map[player.tilePosition.y][player.tilePosition.x].entity = player;
    }
}

function switchPlayers() {
    let temp = Game.player2.zIndex;
    Game.player2.zIndex = Game.player.zIndex;
    Game.player.zIndex = temp;
    if (Game.primaryPlayer === Game.player2) {
        Game.primaryPlayer = Game.player;
    } else Game.primaryPlayer = Game.player2;
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x
        && Game.player.tilePosition.y === Game.player2.tilePosition.y) {
        temp = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity = temp;
    }
}

function removeTileFromWorld(tile) {
    removeObjectFromArray(tile, Game.tiles);
    Game.world.removeChild(tile);
}

function swapEquipmentWithPlayer(player, equipment) {
    let swappedEquipment = null;
    if (!equipment) return null;
    switch (equipment.equipmentType) {
        case EQUIPMENT_TYPE.WEAPON:
            swappedEquipment = player.weapon;
            player.weapon = equipment;
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            swappedEquipment = player.secondHand;
            player.secondHand = equipment;
            break;
        case EQUIPMENT_TYPE.HEAD:
            swappedEquipment = player.headwear;
            player.headwear = equipment;
            break;
        case EQUIPMENT_TYPE.ARMOR:
            swappedEquipment = player.armor;
            player.armor = equipment;
            break;
        case EQUIPMENT_TYPE.FOOT:
            swappedEquipment = player.footwear;
            player.footwear = equipment;
            break;
    }
    redrawSlotsForPlayer(player);
    return swappedEquipment
}

function removeEquipmentFromPlayer(player, equipmentType) {
    let removedEquipment;
    switch (equipmentType) {
        case EQUIPMENT_TYPE.WEAPON:
            removedEquipment = player.weapon;
            player.weapon = null;
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            removedEquipment = player.secondHand;
            player.secondHand = null;
            break;
        case EQUIPMENT_TYPE.HEAD:
            removedEquipment = player.headwear;
            player.headwear = null;
            break;
        case EQUIPMENT_TYPE.ARMOR:
            removedEquipment = player.armor;
            player.armor = null;
            break;
        case EQUIPMENT_TYPE.FOOT:
            removedEquipment = player.footwear;
            player.footwear = null;
            break;
    }
    redrawSlotsForPlayer(player);
    return removedEquipment;
}

function gotoNextLevel() {
    cleanGameWorld();
    Game.tiles = [];
    Game.enemies = [];
    Game.semiDarkTiles = [];
    Game.darkTiles = [];
    Game.hazards = [];
    Game.otherGraphics = [];
    Game.infiniteAnimations = [];
    incrementStage();
    setVariablesForStage();
    initializeLevel();
}

function cleanGameWorld() {
    for (const tile of Game.tiles) {
        Game.world.removeChild(tile);
    }
    for (const tile of Game.darkTiles) {
        Game.world.removeChild(tile);
    }
    for (const tile of Game.semiDarkTiles) {
        Game.world.removeChild(tile);
    }
    for (const graphic of Game.otherGraphics) {
        Game.world.removeChild(graphic);
    }
    for (const hazard of Game.hazards) {
        Game.world.removeChild(hazard);
    }
    for (const animation of Game.infiniteAnimations) {
        Game.APP.ticker.remove(animation);
    }
    Game.world.removeChild(Game.grid);
}