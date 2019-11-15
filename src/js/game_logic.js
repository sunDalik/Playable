import {Game} from "./game"
import {incrementStage, setVariablesForStage} from "./game_changer";
import {initializeLevel} from "./setup"
import {ROLE, EQUIPMENT_TYPE, FOOTWEAR_TYPE} from "./enums"
import {removeObjectFromArray} from "./utils/basic_utils";
import {drawHealth} from "./drawing/draw_hud";

export function setEnemyTurnTimeout() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTimeout(() => {
            enemyTurn();
        }, 60);
    }
}

function enemyTurn() {
    moveEnemies();
    updateHazards();
    Game.enemiesTimeout = null;
    Game.player.afterEnemyTurn();
    Game.player2.afterEnemyTurn();
}

export function moveEnemies() {
    for (const enemy of Game.enemies) {
        if (!enemy.dead) {
            if (enemy.stun <= 0) {
                if (arePlayersInDetectionRadius(enemy)) {
                    if (enemy.cancellable) {
                        enemy.cancelAnimation();
                    }
                    enemy.move();
                }
            } else enemy.stun--;
        }
    }
}

function arePlayersInDetectionRadius(enemy) {
    return Math.abs(enemy.tilePosition.x - Game.player.tilePosition.x) + Math.abs(enemy.tilePosition.y - Game.player.tilePosition.y) <= enemy.detectionRadius
        || Math.abs(enemy.tilePosition.x - Game.player2.tilePosition.x) + Math.abs(enemy.tilePosition.y - Game.player2.tilePosition.y) <= enemy.detectionRadius;
}

export function updateHazards() {
    for (let i = Game.hazards.length - 1; i >= 0; i--) {
        Game.hazards[i].updateLifetime();
    }
}

export function playerTurn(player, playerMove, bothPlayers = false) {
    if (/*Game.playerMoved !== player
        &&*/ ((bothPlayers && !Game.player.dead && !Game.player2.dead) || (!bothPlayers && !player.dead))) {
        if (Game.enemiesTimeout !== null) {
            clearTimeout(Game.enemiesTimeout);
            enemyTurn();
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
            setEnemyTurnTimeout();
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
    const hazard = Game.map[player.tilePosition.y][player.tilePosition.x].hazard;
    if (hazard !== null && !player.dead) {
        if (!(player.footwear && player.footwear.type === FOOTWEAR_TYPE.ANTI_HAZARD)) {
            player.damage(hazard.atk, hazard);
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
    return swappedEquipment;
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