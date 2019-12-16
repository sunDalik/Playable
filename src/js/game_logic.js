import {Game} from "./game"
import {incrementStage} from "./game_changer";
import {initializeLevel} from "./setup"
import {ARMOR_TYPE, EQUIPMENT_TYPE, HAZARD_TYPE, STAGE} from "./enums"
import {drawInteractionKeys, drawMovementKeyBindings, drawStatsForPlayer, redrawSlotContents} from "./drawing/draw_hud";
import {createKissHeartAnimation, showHelpBox} from "./animations";
import {otherPlayer, setTickTimeout, tileDistance} from "./utils/game_utils";
import {updateFollowChain} from "./drawing/draw_dunno";

export function setEnemyTurnTimeout() {
    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTickTimeout(() => {
            enemyTurn();
        }, 4);
    }
}

function enemyTurn() {
    moveEnemies();
    moveBullets();
    updateHazards();
    Game.enemiesTimeout = null;
    Game.afterTurn = true;
    Game.player.afterEnemyTurn();
    Game.player2.afterEnemyTurn();
}

export function moveEnemies() {
    for (const enemy of Game.enemies) {
        if (!enemy.dead && (enemy.visible || enemy.canMoveInvisible)) {
            if (enemy.stun <= 0) {
                const egp = enemy.getGlobalPosition();
                const limit = Game.TILESIZE * 2;
                if (egp.x > -limit && egp.y > -limit && egp.x < Game.app.renderer.screen.width + limit && egp.y < Game.app.renderer.screen.height + limit) {
                    if (enemy.cancellable) {
                        enemy.cancelAnimation();
                    }
                    enemy.move();
                    enemy.cancellable = true;
                    enemy.damageWithHazards();
                }
            } else {
                enemy.stun--;
                enemy.damageWithHazards();
            }
        }
    }
}

function moveBullets() {
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        Game.bullets[i].move();
    }
}

export function updateHazards() {
    for (let i = Game.hazards.length - 1; i >= 0; i--) {
        if (Game.hazards[i].visible)
            Game.hazards[i].updateLifetime();
    }
}

export function playerTurn(player, playerMove, bothPlayers = false) {
    if (((bothPlayers && !Game.player.dead && !Game.player2.dead)
        || (!bothPlayers && !player.dead))) {
        if (Game.enemiesTimeout !== null) {
            Game.app.ticker.remove(Game.enemiesTimeout);
            enemyTurn();
        }

        Game.afterTurn = false;
        if (bothPlayers) {
            if (Game.player.cancellable) Game.player.cancelAnimation();
            if (Game.player2.cancellable) Game.player2.cancelAnimation();
        } else {
            if (player.cancellable) player.cancelAnimation();
        }
        let lastPlayerPos;
        if (player) lastPlayerPos = {x: player.tilePosition.x, y: player.tilePosition.y};

        const moveResult = playerMove();
        if (moveResult !== false) {
            if (player) Game.lastPlayerMoved = player;
            if (player && Game.followMode && tileDistance(player, otherPlayer(player)) === 2) {
                if (otherPlayer(player).cancellable) otherPlayer(player).cancelAnimation();
                otherPlayer(player).step(lastPlayerPos.x - otherPlayer(player).tilePosition.x, lastPlayerPos.y - otherPlayer(player).tilePosition.y);
            } else if (player && Game.followMode && tileDistance(player, otherPlayer(player)) > 2) {
                Game.followMode = false;
                updateFollowChain();
            }
            damagePlayersWithHazards();
            setEnemyTurnTimeout();
            Game.player.cancellable = true;
            Game.player2.cancellable = true;
        }
    }
}

export function damagePlayersWithHazards() {
    damagePlayerWithHazards(Game.player);
    damagePlayerWithHazards(Game.player2);
}

export function damagePlayerWithHazards(player) {
    if (!player.dead) {
        const hazard = Game.map[player.tilePosition.y][player.tilePosition.x].hazard;
        if (hazard) {
            if ((hazard.type === HAZARD_TYPE.POISON || hazard.type === HAZARD_TYPE.DARK_POISON) && player.poisonImmunity <= 0) {
                player.damage(hazard.atk, hazard, false, false);
            } else if ((hazard.type === HAZARD_TYPE.FIRE || hazard.type === HAZARD_TYPE.DARK_FIRE) && player.fireImmunity <= 0) {
                player.damage(hazard.atk, hazard, false, false);
            }
        }

        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (Game.darkTiles[player.tilePosition.y][player.tilePosition.x].dark
                && Game.darkTiles[player.tilePosition.y + 1][player.tilePosition.x].dark
                && Game.darkTiles[player.tilePosition.y - 1][player.tilePosition.x].dark
                && Game.darkTiles[player.tilePosition.y][player.tilePosition.x + 1].dark
                && Game.darkTiles[player.tilePosition.y][player.tilePosition.x - 1].dark)
                player.damage(0.25, null, false, false);
        }
    }
}

export function switchPlayers() {
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y
        && !Game.player.dead && !Game.player2.dead) {
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

export function toggleFollowMode() {
    if (!Game.player.dead && !Game.player2.dead && tileDistance(Game.player, Game.player2) <= 1) {
        Game.followMode = !Game.followMode;
    } else {
        Game.followMode = false;
    }
    updateFollowChain();
    return false;
}

export function checkFollowMode() {
    if (Game.followMode && (tileDistance(Game.player, Game.player2) > 1 || Game.player.dead || Game.player2.dead)) {
        Game.followMode = false;
    }
    updateFollowChain();
}

export function kiss(healAmount = 1) {
    Game.player.heal(healAmount, false);
    Game.player2.heal(healAmount, false);
    createKissHeartAnimation(Game.player.position.x + (Game.player2.position.x - Game.player.position.x) / 2,
        Game.player.position.y + (Game.player2.position.y - Game.player.position.y) / 2);
}

export function swapEquipmentWithPlayer(player, equipment, showHelp = true) {
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
    if (showHelp) showHelpBox(player[slot]);
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
    Game.world.clean();
    Game.tiles = [];
    Game.enemies = [];
    Game.darkTiles = [];
    Game.hazards = [];
    Game.bullets = [];
    Game.otherGraphics = [];
    Game.infiniteAnimations = [];
    Game.obelisks = [];
    incrementStage();
    initializeLevel();
    Game.player.applyNextLevelMethods();
    Game.player2.applyNextLevelMethods();
}