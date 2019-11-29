import {Game} from "./game"
import {incrementStage, setVariablesForStage} from "./game_changer";
import {initializeLevel} from "./setup"
import {ARMOR_TYPE, EQUIPMENT_TYPE, FOOTWEAR_TYPE, ROLE, STAGE} from "./enums"
import {otherPlayer, removeObjectFromArray} from "./utils/basic_utils";
import {drawInteractionKeys, drawMovementKeyBindings, drawStatsForPlayer, redrawSlotContents} from "./drawing/draw_hud";
import {createKissHeartAnimation} from "./animations";

export function setEnemyTurnTimeout() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTimeout(() => {
            enemyTurn();
        }, 60);
    }
}

function enemyTurn() {
    moveEnemies();
    //damage enemies with dark hazards
    updateHazards();
    Game.enemiesTimeout = null;
    Game.afterTurn = true;
    Game.player.afterEnemyTurn();
    Game.player2.afterEnemyTurn();
}

export function moveEnemies() {
    for (const enemy of Game.enemies) {
        if (!enemy.dead && enemy.visible) {
            if (enemy.stun <= 0) {
                if (arePlayersInDetectionRadius(enemy)) {
                    if (enemy.cancellable) {
                        enemy.cancelAnimation();
                    }
                    enemy.move();
                    enemy.cancellable = true;
                }
            } else enemy.stun--;
        }
    }
}

//or maybe maybe should instead just check onscreen position? and if they are off screen then they dont move? dunno
function arePlayersInDetectionRadius(enemy) {
    return ((Math.abs(enemy.tilePosition.x - Game.player.tilePosition.x) + Math.abs(enemy.tilePosition.y - Game.player.tilePosition.y) <= enemy.detectionRadius && !Game.player.dead)
        || (Math.abs(enemy.tilePosition.x - Game.player2.tilePosition.x) + Math.abs(enemy.tilePosition.y - Game.player2.tilePosition.y) <= enemy.detectionRadius && !Game.player2.dead));
}

export function updateHazards() {
    for (let i = Game.hazards.length - 1; i >= 0; i--) {
        if (Game.hazards[i].visible)
            Game.hazards[i].updateLifetime();
    }
}

export function playerTurn(player, playerMove, bothPlayers = false) {
    if (Game.playerMoving === null || player === Game.playerMoving) {
        if (((bothPlayers && !Game.player.dead && !Game.player2.dead) || (!bothPlayers && !player.dead && !player.carried))) {
            if (Game.enemiesTimeout !== null) {
                clearTimeout(Game.enemiesTimeout);
                enemyTurn();
            }

            Game.afterTurn = false;
            if (bothPlayers) {
                if (Game.player.cancellable) Game.player.cancelAnimation();
                if (Game.player2.cancellable) Game.player2.cancelAnimation();
            } else {
                if (player.cancellable) player.cancelAnimation();
                if (otherPlayer(player).carried) {
                    if (otherPlayer(player).cancellable) otherPlayer(player).cancelAnimation();
                }
            }
            const moveResult = playerMove();
            if (moveResult !== false) {
                let canMoveFurther = false;
                if (player && player.moved) {
                    player.moved = false;
                    player.currentMovement--;
                    if (player.currentMovement > 0) {
                        canMoveFurther = true;
                        Game.playerMoving = player;
                        otherPlayer(Game.playerMoving).setMovedTexture();
                        damagePlayerWithHazards(Game.playerMoving);
                    }
                }
                if (!canMoveFurther) {
                    if (Game.playerMoving) otherPlayer(Game.playerMoving).setUnmovedTexture();
                    Game.playerMoving = null;
                    damagePlayersWithHazards();
                    setEnemyTurnTimeout();
                }

                Game.player.cancellable = true;
                Game.player2.cancellable = true;
            }
        }
    }
}

export function damagePlayersWithHazards() {
    damagePlayerWithHazards(Game.player);
    damagePlayerWithHazards(Game.player2);
}

export function damagePlayerWithHazards(player) {
    if (!player.dead && !player.carried) {
        const hazard = Game.map[player.tilePosition.y][player.tilePosition.x].hazard;
        if (hazard !== null) {
            if (!(player.footwear && player.footwear.type === FOOTWEAR_TYPE.ANTI_HAZARD)
                && !(player.armor && player.armor.type === ARMOR_TYPE.WINGS)) {
                player.damage(hazard.atk, hazard);
            }
        }
        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (Game.semiDarkTiles[player.tilePosition.y + 1][player.tilePosition.x].visible
                && Game.semiDarkTiles[player.tilePosition.y - 1][player.tilePosition.x].visible
                && Game.semiDarkTiles[player.tilePosition.y][player.tilePosition.x + 1].visible
                && Game.semiDarkTiles[player.tilePosition.y][player.tilePosition.x - 1].visible)
                player.damage(0.25, null, false, false);
        }
    }
}

export function switchPlayers() {
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y
        && !Game.player.dead && !Game.player2.dead && !Game.player.carried && !Game.player2.carried) {
        let temp = Game.player2.zIndex;
        Game.player2.zIndex = Game.player.zIndex;
        Game.player.zIndex = temp;
        if (Game.primaryPlayer === Game.player2) {
            Game.primaryPlayer = Game.player;
        } else Game.primaryPlayer = Game.player2;
        temp = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity = temp;
        drawInteractionKeys();
        if ((Game.player.armor && Game.player.armor.type === ARMOR_TYPE.ELECTRIC)
            || (Game.player2.armor && Game.player2.armor.type === ARMOR_TYPE.ELECTRIC)) return false;
        return true;
    } else return false;
}

export function carryPlayer() {
    if (Game.player.carried === true) {
        Game.player.carried = false;
        Game.player2.extraAtkMul = 1;
        Game.player2.extraDefMul = 1;
        drawStatsForPlayer(Game.player2);
    } else if (Game.player2.carried === true) {
        Game.player2.carried = false;
        Game.player.extraAtkMul = 1;
        Game.player.extraDefMul = 1;
        drawStatsForPlayer(Game.player);
    } else if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y
        && !Game.player.dead && !Game.player2.dead) {
        otherPlayer(Game.primaryPlayer).carried = true;
        Game.primaryPlayer.extraAtkMul = 0.5;
        Game.primaryPlayer.extraDefMul = 0.5;
        drawStatsForPlayer(Game.primaryPlayer);
    } else return false;
    drawMovementKeyBindings();
    drawInteractionKeys();
    if ((Game.player.armor && Game.player.armor.type === ARMOR_TYPE.ELECTRIC)
        || (Game.player2.armor && Game.player2.armor.type === ARMOR_TYPE.ELECTRIC)) return false;
    else return true;
}

export function kiss(healAmount = 1) {
    Game.player.heal(healAmount, false);
    Game.player2.heal(healAmount, false);
    createKissHeartAnimation(Game.player.position.x + (Game.player2.position.x - Game.player.position.x) / 2,
        Game.player.position.y + (Game.player2.position.y - Game.player.position.y) / 2);
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
            if (player.weapon) slot = "secondHand";
            else slot = "weapon";
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
    for (const eq of player.getEquipment()) {
        if (eq && eq.onEquipmentDrop) eq.onEquipmentDrop(player, player[slot]);
    }
    const swappedEquipment = player[slot];
    player[slot] = equipment;
    if (player[slot].onWear) player[slot].onWear(player);
    for (const eq of player.getEquipment()) {
        if (eq && eq.onEquipmentReceive) eq.onEquipmentReceive(player, equipment);
    }
    redrawSlotContents(player, slot);
    return swappedEquipment;
}

export function removeEquipmentFromPlayer(player, equipmentType) {
    let slot;
    switch (equipmentType) {
        case EQUIPMENT_TYPE.WEAPON:
            if (player.secondHand && player.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON) slot = "secondHand";
            else slot = "weapon";
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
    for (const eq of player.getEquipment()) {
        if (eq && eq.onEquipmentDrop) eq.onEquipmentDrop(player, player[slot]);
    }
    const removedEquipment = player[slot];
    player[slot] = null;
    redrawSlotContents(player, slot);
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
    Game.obelisks = [];
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