import {Game} from "./game"
import {incrementStage, setVariablesForStage} from "./game_changer";
import {initializeLevel} from "./setup"
import {ROLE, EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "./enums"
import {removeObjectFromArray} from "./utils";
import {redrawSlotsForPlayer} from "./draw";

export function enemyTurn() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTimeout(() => {
            moveEnemies();
            updateHazards();
            Game.enemiesTimeout = null;
        }, 60);
    }
}

export function moveEnemies() {
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

export function updateHazards() {
    for (let i = 0; i < Game.hazards.length; ++i) {
        const lives = Game.hazards[i].updateLifetime();
        if (!lives) i--; //dead hazards are removed from array, so we don't increment i
    }
}

export function playerTurn(player, playerMove, bothPlayers = false) {
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

export function damagePlayersWithHazards() {
    damagePlayerWithHazards(Game.player);
    damagePlayerWithHazards(Game.player2);
}

//should change later when there will be more hazards
export function damagePlayerWithHazards(player) {
    if (Game.map[player.tilePosition.y][player.tilePosition.x].hazard !== null && !player.dead) {
        if (!(player.footwear && player.footwear.type === FOOTWEAR_TYPE.ANTI_HAZARD)) {
            player.damage(Game.map[player.tilePosition.y][player.tilePosition.x].hazard.atk)
        }
    }
}

export function removePlayerFromGameMap(player) {
    if (player === Game.map[player.tilePosition.y][player.tilePosition.x].entity) {
        Game.map[player.tilePosition.y][player.tilePosition.x].entity = Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity;
        Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
    } else if (player === Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity) {
        Game.map[player.tilePosition.y][player.tilePosition.x].secondaryEntity = null;
    }
}

export function placePlayerOnGameMap(player) {
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

export function switchPlayers() {
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

export function removeTileFromWorld(tile) {
    removeObjectFromArray(tile, Game.tiles);
    Game.world.removeChild(tile);
}

export function swapEquipmentWithPlayer(player, equipment) {
    if (!equipment) return null;
    let slot;
    switch (equipment.equipmentType) {
        case EQUIPMENT_TYPE.WEAPON:
            slot = "weapon";
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            slot = "secondHand";
            break;
        case EQUIPMENT_TYPE.HEAD:
            slot = "headwear";
            break;
        case EQUIPMENT_TYPE.ARMOR:
            slot = "armor";
            break;
        case EQUIPMENT_TYPE.FOOT:
            slot = "footwear";
            break;
    }
    if (!slot) return null;
    if (player[slot] && player[slot].onTakeOff) player[slot].onTakeOff(player);
    const swappedEquipment = player[slot];
    player[slot] = equipment;
    if (player[slot].onWear) player[slot].onWear(player);
    redrawSlotsForPlayer(player);
    return swappedEquipment
}

export function removeEquipmentFromPlayer(player, equipmentType) {
    let slot;
    switch (equipmentType) {
        case EQUIPMENT_TYPE.WEAPON:
            slot = "weapon";
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            slot = "secondHand";
            break;
        case EQUIPMENT_TYPE.HEAD:
            slot = "headwear";
            break;
        case EQUIPMENT_TYPE.ARMOR:
            slot = "armor";
            break;
        case EQUIPMENT_TYPE.FOOT:
            slot = "footwear";
            break;
    }
    if (!slot) return null;
    if (player[slot] && player[slot].onTakeOff) player[slot].onTakeOff(player);
    const removedEquipment = player[slot];
    player[slot] = null;
    redrawSlotsForPlayer(player);
    return removedEquipment;
}

export function gotoNextLevel() {
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
    Game.player.applyNextLevelMethods();
    Game.player2.applyNextLevelMethods();
}

export function cleanGameWorld() {
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