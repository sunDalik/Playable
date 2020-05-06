import {Game} from "./game";
import {incrementStage} from "./game_changer";
import {initializeLevel} from "./setup";
import {ACHIEVEMENT_ID, EQUIPMENT_TYPE, HAZARD_TYPE, SLOT, STAGE, TILE_TYPE} from "./enums";
import {
    drawInteractionKeys,
    redrawBag,
    redrawKeysAmount,
    redrawSlotContents,
    redrawSpeedRunTime
} from "./drawing/draw_hud";
import {createKissHeartAnimation, fadeOutAndDie, showHelpBox} from "./animations";
import {otherPlayer, setTickTimeout, tileDistance, tileDistanceDiagonal} from "./utils/game_utils";
import {updateChain} from "./drawing/draw_dunno";
import {lightPosition, lightTile} from "./drawing/lighting";
import {removeAllChildrenFromContainer} from "./drawing/draw_utils";
import {HUD} from "./drawing/hud_object";
import {camera} from "./classes/game/camera";
import {get8Directions, getCardinalDirections} from "./utils/map_utils";
import {getPlayerOnTile} from "./map_checks";
import {ITEM_OUTLINE_FILTER} from "./filters";
import {TileElement} from "./classes/tile_elements/tile_element";
import {randomChoice} from "./utils/random_utils";
import {removeObjectFromArray} from "./utils/basic_utils";
import {completeAchievement, completeBeatStageAchievements} from "./achievements";
import {Z_INDEXES} from "./z_indexing";
import {SuperWallTile} from "./classes/draw/super_wall";
import {CommonSpriteSheet} from "./loader";

export function setEnemyTurnTimeout() {
    for (const enemy of Game.enemies) {
        updateIntent(enemy);
    }

    if (Game.enemiesTimeout === null) {
        Game.enemiesTimeout = setTickTimeout(() => {
            enemyTurn();
        }, 6);
    }
}

function enemyTurn() {
    Game.enemiesTimeout = null;
    drawInteractionKeys();
    callDelayedMethods(); //delay isn't perfect yeah
    updateList();
    damagePlayersWithHazards();
    moveEnemies();
    moveBullets();
    updateHazards();
    Game.actionsMade = 0;
    Game.afterTurn = true;
    Game.player.afterEnemyTurn();
    Game.player2.afterEnemyTurn();
    updateInanimates();
    cleanParticles();
}

export function moveEnemies() {
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        if (!enemy.dead && (enemy.visible || enemy.canMoveInvisible)) {
            if (enemy.boss) enemy.stun = 0;
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
            updateIntent(enemy);
        }
    }
}

export function updateIntent(enemy) {
    if (!enemy.dead && enemy.visible) {
        if (enemy.stun > 0) enemy.setStunIcon();
        else enemy.updateIntentIcon();
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

function updateList() {
    for (let i = Game.updateList.length - 1; i >= 0; i--) {
        if (Game.updateList[i].update)
            Game.updateList[i].update();
    }
}

export function openDoors(tileStepX, tileStepY) {
    for (const player of [Game.player, Game.player2]) {
        if (!player.dead) {
            if (Game.map[player.tilePosition.y][player.tilePosition.x].tileType === TILE_TYPE.ENTRY) {
                //todo ?. operator
                if (Game.map[player.tilePosition.y][player.tilePosition.x].tile
                    && Game.map[player.tilePosition.y][player.tilePosition.x].tile.open) {
                    Game.map[player.tilePosition.y][player.tilePosition.x].tile.open(tileStepX, tileStepY);
                }
            }
        }
    }
}

function callDelayedMethods() {
    for (let i = Game.delayList.length - 1; i >= 0; i--) {
        Game.delayList[i]();
    }
    Game.delayList = [];
}

function cleanParticles() {
    const particleLimit = 200;
    let diff = Game.destroyParticles.reduce((acc, val) => acc + val.length, 0) - particleLimit;
    while (diff-- > 0) {
        const particleArray = Game.destroyParticles[0]; //remove oldest particles
        const particle = randomChoice(particleArray);
        removeObjectFromArray(particle, particleArray);
        fadeOutAndDie(particle, true);
        if (particleArray.length === 0) removeObjectFromArray(particleArray, Game.destroyParticles);
        else if (particleArray.length <= 3) {
            removeObjectFromArray(particleArray, Game.destroyParticles);
            Game.destroyParticles.push(particleArray);
        }
    }
}

export function updateInanimates() {
    for (let i = 0; i < Game.inanimates.length; i++) {
        const inanimate = Game.inanimates[i];
        if (inanimate.visible) {
            let playerFound = false;
            for (const dir of getCardinalDirections()) {
                if (getPlayerOnTile(inanimate.tilePosition.x + dir.x, inanimate.tilePosition.y + dir.y) !== null) {
                    inanimate.filters = [ITEM_OUTLINE_FILTER];
                    playerFound = true;
                    break;
                }
            }
            if (!playerFound) inanimate.filters = [];
            if (inanimate.onUpdate) inanimate.onUpdate();
        }
    }
}

export function playerTurn(player, playerMove, bothPlayers = false) {
    if (Game.unplayable || Game.paused) return false;
    if (((bothPlayers && !Game.player.dead && !Game.player2.dead)
        || (!bothPlayers && !player.dead))) {
        if (Game.enemiesTimeout !== null
            && (bothPlayers || player === Game.lastPlayerMoved || Game.actionsMade >= 2)) {
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
            Game.actionsMade++;
            if (bothPlayers) Game.actionsMade++;
            if (player && Game.followMode && tileDistance(player, otherPlayer(player)) === 2) {
                if (otherPlayer(player).cancellable) otherPlayer(player).cancelAnimation();
                otherPlayer(player).step(lastPlayerPos.x - otherPlayer(player).tilePosition.x, lastPlayerPos.y - otherPlayer(player).tilePosition.y);
            }

            if (player && Game.followMode && tileDistance(player, otherPlayer(player)) >= 2) {
                Game.followMode = false;
                drawInteractionKeys();
                updateChain();
            }
            setEnemyTurnTimeout();
            Game.player.cancellable = true;
            Game.player2.cancellable = true;
            if (Game.time === 0) {
                Game.app.ticker.remove(speedrunTimer);
                Game.app.ticker.add(speedrunTimer);
            }
        }
    }
}

export function speedrunTimer() {
    if (!Game.paused && !Game.unplayable && !(Game.player.dead && Game.player2.dead)) {
        Game.time += Game.app.ticker.elapsedMS;
        redrawSpeedRunTime();
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

        if (!otherPlayer(player).dead) {
            if (tileDistanceDiagonal(Game.player, Game.player2) > Game.chainLength) {
                player.damage(0.25, Game.limitChain, false, false);
            }
        }
    }
}

export function switchPlayers() {
    if (Game.player.tilePosition.x === Game.player2.tilePosition.x && Game.player.tilePosition.y === Game.player2.tilePosition.y
        && !Game.player.dead && !Game.player2.dead) {
        Game.primaryPlayer = Game.primaryPlayer === Game.player2 ? Game.player : Game.player2;
        Game.primaryPlayer.setOwnZIndex(Z_INDEXES.PLAYER_PRIMARY);
        otherPlayer(Game.primaryPlayer).setOwnZIndex(Z_INDEXES.PLAYER);
        let temp = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].entity = Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity;
        Game.map[Game.player.tilePosition.y][Game.player2.tilePosition.x].secondaryEntity = temp;
        drawInteractionKeys();
        return true;
    } else return false;
}

export function toggleFollowMode() {
    if (!Game.player.dead && !Game.player2.dead && tileDistance(Game.player, Game.player2) <= 1) {
        Game.followMode = !Game.followMode;
    } else {
        Game.followMode = false;
    }
    drawInteractionKeys();
    updateChain();
    return false;
}

export function checkFollowMode() {
    if (Game.followMode && (tileDistance(Game.player, Game.player2) > 1 || Game.player.dead || Game.player2.dead)) {
        Game.followMode = false;
        drawInteractionKeys();
    }
    updateChain();
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
            if (player.weapon) slot = SLOT.EXTRA;
            else slot = SLOT.WEAPON;
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            slot = SLOT.EXTRA;
            break;
        case EQUIPMENT_TYPE.HEAD:
            slot = SLOT.HEADWEAR;
            break;
        case EQUIPMENT_TYPE.ARMOR:
            slot = SLOT.ARMOR;
            break;
        case EQUIPMENT_TYPE.FOOT:
            slot = SLOT.FOOTWEAR;
            break;
        case EQUIPMENT_TYPE.BAG_ITEM:
            if (player.bag && player.bag.type === equipment.type) {
                player.bag.amount += equipment.amount;
                redrawBag(player);
                return null;
            } else {
                const swappedItem = player.bag;
                player.bag = equipment;
                if (showHelp) showHelpBox(player.bag);
                redrawBag(player);
                return swappedItem;
            }

        //todo: remove this and implement passive item mechanic
        case EQUIPMENT_TYPE.ONE_TIME:
            if (equipment.useItem) equipment.useItem(player);
            if (showHelp) showHelpBox(equipment);
            return null;
        case EQUIPMENT_TYPE.KEY:
            Game.keysAmount++;
            redrawKeysAmount();
            if (showHelp) showHelpBox(equipment);
            return null;
    }
    if (!slot) return equipment;
    if (player[slot] && player[slot].nonremoveable) return equipment;
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
            if (player.secondHand && player.secondHand.equipmentType === EQUIPMENT_TYPE.WEAPON) slot = SLOT.EXTRA;
            else slot = SLOT.WEAPON;
            break;
        case EQUIPMENT_TYPE.TOOL:
        case EQUIPMENT_TYPE.SHIELD:
            slot = SLOT.EXTRA;
            break;
        case EQUIPMENT_TYPE.HEAD:
            slot = SLOT.HEADWEAR;
            break;
        case EQUIPMENT_TYPE.ARMOR:
            slot = SLOT.ARMOR;
            break;
        case EQUIPMENT_TYPE.FOOT:
            slot = SLOT.FOOTWEAR;
            break;
    }
    if (!slot) return null;
    if (player[slot] && player[slot].nonremoveable) return null;
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
    cleanGameState();
    completeBeatStageAchievements(Game.stage);
    incrementStage();
    initializeLevel();
    Game.player.applyNextLevelMethods();
    Game.player2.applyNextLevelMethods();
}

export function cleanGameState() {
    Game.enemies = [];
    Game.savedTiles = [];
    Game.darkTiles = [];
    Game.hazards = [];
    Game.inanimates = [];
    Game.updateList = [];
    Game.delayList = [];
    Game.bullets = [];
    Game.infiniteAnimations = [];
    Game.obelisks = [];
    Game.endRoomBoundaries = [];
    Game.boss = null;
    Game.bossFight = false;
    if (Game.itemHelp) {
        HUD.removeChild(Game.itemHelp);
        Game.itemHelp = null;
    }
    removeAllChildrenFromContainer(HUD.bossHealth);
    Game.destroyParticles = [];
}

export function activateBossMode(player) {
    for (let x = Game.endRoomBoundaries[0].x; x <= Game.endRoomBoundaries[1].x; x++) {
        Game.world.addAndSaveTile(new SuperWallTile(x, Game.endRoomBoundaries[0].y - 1), TILE_TYPE.SUPER_WALL);
        Game.world.addAndSaveTile(new SuperWallTile(x, Game.endRoomBoundaries[1].y + 1), TILE_TYPE.SUPER_WALL);
    }
    for (let y = Game.endRoomBoundaries[0].y; y <= Game.endRoomBoundaries[1].y; y++) {
        Game.world.addAndSaveTile(new SuperWallTile(Game.endRoomBoundaries[0].x - 1, y), TILE_TYPE.SUPER_WALL);
        Game.world.addAndSaveTile(new SuperWallTile(Game.endRoomBoundaries[1].x + 1, y), TILE_TYPE.SUPER_WALL);
    }

    if (!otherPlayer(player).dead) {
        otherPlayer(player).step(player.tilePosition.x - otherPlayer(player).tilePosition.x, player.tilePosition.y - otherPlayer(player).tilePosition.y);
    }

    for (let y = Game.endRoomBoundaries[0].y; y <= Game.endRoomBoundaries[1].y; y++) {
        for (let x = Game.endRoomBoundaries[0].x; x <= Game.endRoomBoundaries[1].x; x++) {
            lightTile(x, y);
        }
    }

    Game.boss.redrawHealth();
    Game.bossFight = true;
    Game.bossNoDamage = true;

    if (Game.boss.onBossModeActivate) {
        Game.boss.onBossModeActivate();
    }
}

export function deactivateBossMode() {
    for (const savedTile of Game.savedTiles) {
        Game.world.removeTile(savedTile.x, savedTile.y, null, false);
        Game.world.addTile(savedTile.tile, savedTile.tileType, savedTile.x, savedTile.y);
        if (savedTile.tile && Game.map[savedTile.y][savedTile.x].lit) savedTile.tile.visible = true;
    }
    Game.bossFight = false;
    if (Game.bossNoDamage) completeAchievement(ACHIEVEMENT_ID.BEAT_ANY_BOSS_NO_DAMAGE);

    Game.world.removeTile(Game.bossExit.x, Game.bossExit.y, null, false);
    const exitTile = new TileElement(CommonSpriteSheet["exit_text.png"], Game.bossExit.x, Game.bossExit.y, true);
    Game.world.addTile(exitTile, TILE_TYPE.EXIT);

    for (const dir of get8Directions()) {
        if (Game.map[Game.bossExit.y + dir.y][Game.bossExit.x + dir.x].tileType !== TILE_TYPE.SUPER_WALL) {
            Game.world.removeTile(Game.bossExit.x + dir.x, Game.bossExit.y + dir.y);
        }
    }

    lightPosition(Game.bossExit);
    camera.moveToCenter(15);
}