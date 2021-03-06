import {Game} from "./game";
import {incrementStage, regenerateWeaponPool} from "./game_changer";
import {initializeLevel, stageBeaten} from "./setup";
import {
    ACHIEVEMENT_ID,
    EQUIPMENT_ID,
    EQUIPMENT_TYPE,
    HAZARD_TYPE,
    INANIMATE_TYPE,
    ROLE,
    SLOT,
    STAGE,
    TILE_TYPE
} from "./enums/enums";
import {
    drawInteractionKeys,
    redrawBag,
    redrawKeysAmount,
    redrawSlotContents,
    setTimerRunning
} from "./drawing/draw_hud";
import {animateFrames, createKissHeartAnimation, fadeOutAndDie, shakeScreen, showHelpBox} from "./animations";
import {otherPlayer, setTickTimeout, tileDistance, tileDistanceDiagonal} from "./utils/game_utils";
import {updateChain} from "./drawing/draw_dunno";
import {lightPlayerPosition, lightPosition, lightTile} from "./drawing/lighting";
import {removeAllChildrenFromContainer} from "./drawing/draw_utils";
import {HUD} from "./drawing/hud_object";
import {camera} from "./classes/game/camera";
import {get8Directions, getCardinalDirections} from "./utils/map_utils";
import {
    getPlayerOnTile,
    isAnyWall,
    isDiggable,
    isEnemy,
    isEntity,
    isInanimate,
    isNotAWall,
    isObelisk,
    isWallTrap
} from "./map_checks";
import {CURSED_FILTER, DIVINE_FILTER, ITEM_OUTLINE_FILTER, NIGHTMARE_FILTER_1, NIGHTMARE_FILTER_2} from "./filters";
import {TileElement} from "./classes/tile_elements/tile_element";
import {randomChoice, randomShuffle} from "./utils/random_utils";
import {removeObjectFromArray} from "./utils/basic_utils";
import {beatStage, completeAchievement, completeAchievementForEquippingAllItems} from "./achievements";
import {getZIndexForLayer, Z_INDEXES} from "./z_indexing";
import {SuperWallTile} from "./classes/draw/super_wall";
import {CommonSpriteSheet} from "./loader";
import {LyingItem} from "./classes/equipment/lying_item";
import * as PIXI from "pixi.js";
import {DAMAGE_TYPE} from "./enums/damage_type";
import {ENCHANTMENT_TYPE} from "./enums/enchantments";
import {animateHUDBump, animateHUDWeaponLink} from "./drawing/hud_animations";

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
    Game.player.beforeEnemyTurn();
    Game.player2.beforeEnemyTurn();
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
    Game.turns++;
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
        //we might destroy a particle that is still being animated so to prevent exceptions we should remove this animation
        if (particle.animation) Game.app.ticker.remove(particle.animation);
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
            setTimerRunning(true);
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
                player.damage(hazard.atk, hazard, false, false, true);
            } else if ((hazard.type === HAZARD_TYPE.FIRE || hazard.type === HAZARD_TYPE.DARK_FIRE) && player.fireImmunity <= 0) {
                player.damage(hazard.atk, hazard, false, false, true);
            }
        }

        if (Game.stage === STAGE.DARK_TUNNEL) {
            if (Game.darkTiles[player.tilePosition.y][player.tilePosition.x].visible
                && Game.darkTiles[player.tilePosition.y][player.tilePosition.x].alpha >= Game.darkTiles[player.tilePosition.y][player.tilePosition.x].semiAlpha) {
                const darkness = new TileElement(PIXI.Texture.WHITE, player.tilePosition.x, player.tilePosition.y, true);
                darkness.tint = 0x000000;
                darkness.name = "Darkness";
                player.damage(0.25, darkness, false, false, false);
            }
        }

        if (!otherPlayer(player).dead) {
            if (tileDistanceDiagonal(Game.player, Game.player2) > Game.chainLength) {
                player.damage(0.25, Game.limitChain, false, false, false);
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
            if (player[SLOT.WEAPON] && !(player[SLOT.EXTRA] && player[SLOT.EXTRA].nonremoveable)) slot = SLOT.EXTRA;
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
        case EQUIPMENT_TYPE.ACCESSORY:
            slot = SLOT.ACCESSORY;
            break;
        case EQUIPMENT_TYPE.BAG_ITEM:
            if (player.bag && player.bag.id === equipment.id) {
                player.bag.amount += equipment.amount;
                redrawBag(player);
                animateHUDBump(player, SLOT.BAG);
                return null;
            } else {
                const swappedItem = player.bag;
                player.bag = equipment;
                redrawSlotContents(player, SLOT.BAG); //???
                animateHUDBump(player, SLOT.BAG);
                if (showHelp) showHelpBox(player.bag);
                return swappedItem;
            }

        case EQUIPMENT_TYPE.ONE_TIME:
            if (equipment.useItem) equipment.useItem(player);
            if (showHelp) showHelpBox(equipment);
            player.consumedItems.push(equipment);
            return null;
        case EQUIPMENT_TYPE.KEY:
            addKeys(1);
            if (showHelp) showHelpBox(equipment);
            return null;
    }
    if (!slot) return equipment;
    if (player[slot]) {
        // torch is the only item that can override cursed items
        if (player[slot].nonremoveable && equipment.id !== EQUIPMENT_ID.TORCH) return equipment;
        if (player[slot].onTakeOff) player[slot].onTakeOff(player);
        for (const eq of player.getEquipment()) {
            if (eq && eq.onEquipmentDrop) eq.onEquipmentDrop(player, player[slot]);
        }
        if (player[slot].nonremoveable && equipment.id === EQUIPMENT_ID.TORCH) player[slot] = null;
    }
    const swappedEquipment = player[slot];
    player[slot] = equipment;
    if (player[slot].onWear) player[slot].onWear(player);
    for (const eq of player.getEquipment()) {
        if (eq && eq.onEquipmentReceive) eq.onEquipmentReceive(player, equipment);
    }
    redrawSlotContents(player, slot);
    animateHUDBump(player, slot);
    if ((slot === SLOT.WEAPON || slot === SLOT.EXTRA)
        && player[SLOT.WEAPON] && player[SLOT.EXTRA] &&
        player[slot].equipmentType === EQUIPMENT_TYPE.WEAPON
        && player[SLOT.WEAPON].id === player[SLOT.EXTRA].id) {
        animateHUDWeaponLink(player);
    }
    if (showHelp) showHelpBox(player[slot]);
    if (equipment.enchantment && equipment.enchantment !== ENCHANTMENT_TYPE.NONE) completeAchievement(ACHIEVEMENT_ID.FIND_ENCHANTED_ITEM);
    completeAchievementForEquippingAllItems();
    return swappedEquipment;
}

export function addKeys(keyAmount) {
    Game.keysAmount += keyAmount;
    redrawKeysAmount();
}

export function removeEquipmentFromPlayer(player, equipmentType, slotName = null) {
    let slot;
    if (slotName) slot = slotName;
    else {
        switch (equipmentType) {
            case EQUIPMENT_TYPE.WEAPON:
                if (player[SLOT.EXTRA] && player[SLOT.EXTRA].equipmentType === EQUIPMENT_TYPE.WEAPON && !player[SLOT.EXTRA].nonremoveable) slot = SLOT.EXTRA;
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
            case EQUIPMENT_TYPE.ACCESSORY:
                slot = SLOT.ACCESSORY;
                break;
            case EQUIPMENT_TYPE.BAG_ITEM:
                slot = SLOT.BAG;
                break;
        }
    }
    if (!slot || !player[slot]) return null;
    if (player[slot].nonremoveable) return null;
    if (player[slot].onTakeOff) player[slot].onTakeOff(player);
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
    returnShopItems();
    cleanGameState();
    beatStage(Game.stage);
    incrementStage();
    regenerateWeaponPool();
    initializeLevel();
    Game.player.applyNextLevelMethods();
    Game.player2.applyNextLevelMethods();
}

export function cleanGameState() {
    Game.enemies = [];
    Game.burrowedEnemies = [];
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

function returnShopItems() {
    for (const inanimate of Game.inanimates) {
        if (inanimate.type === INANIMATE_TYPE.SHOP_STAND && !inanimate.bought
            && inanimate.contentsType !== EQUIPMENT_TYPE.WEAPON && inanimate.contentsType !== EQUIPMENT_TYPE.BAG_ITEM) {
            Game.chestItemPool.push(inanimate.contents.constructor);
        }
    }
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

    if (Game.boss.onBossModeActivate) Game.boss.onBossModeActivate();
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
        const tile = {x: Game.bossExit.x + dir.x, y: Game.bossExit.y + dir.y};
        if (tile.x > 0 && tile.x < Game.map[0].length - 1 && tile.y > 0 && tile.y < Game.map.length - 1) {
            Game.world.removeTile(tile.x, tile.y);
        }
    }

    lightPosition(Game.bossExit);
    camera.moveToCenter(15);
}

export function dropItem(item, tilePosX, tilePosY) {
    //todo stack bag items of the same type?? (also keys)
    const freeSpaceSearch = (tileX, tileY) => {
        class Tile {
            constructor(x, y, sourceDirX, sourceDirY) {
                this.x = x;
                this.y = y;
                this.sourceDirX = sourceDirX;
                this.sourceDirY = sourceDirY;
            }
        }

        let currentTiles = [new Tile(tileX, tileY, 0, 0)];
        const badTiles = [];

        // stop searching if 12 tiles away. This is to prevent infinite recursion
        for (let i = 0; i < 12; i++) {
            const newTiles = [];

            for (const tile of currentTiles) {
                if (badTiles.some(t => t.x === tile.x && t.y === tile.y)) continue;
                badTiles.push(tile);
                if (isAnyWall(tile.x, tile.y)) continue;

                if (isNotAWall(tile.x, tile.y) && !isInanimate(tile.x, tile.y) && Game.map[tile.y][tile.x].item === null) {
                    return {x: tile.x, y: tile.y};
                } else {
                    if (tile.sourceDirX === 0 && tile.sourceDirY === 0) {
                        newTiles.push(new Tile(tile.x + 1, tile.y, -1, 0));
                        newTiles.push(new Tile(tile.x - 1, tile.y, 1, 0));
                        newTiles.push(new Tile(tile.x, tile.y + 1, 0, -1));
                        newTiles.push(new Tile(tile.x, tile.y - 1, 0, 1));
                    } else {
                        if (tile.sourceDirY === 0) {
                            newTiles.push(new Tile(tile.x, tile.y - 1, tile.sourceDirX, 1));
                            newTiles.push(new Tile(tile.x, tile.y + 1, tile.sourceDirX, -1));
                        } else {
                            newTiles.push(new Tile(tile.x, tile.y - tile.sourceDirY, tile.sourceDirX, tile.sourceDirY));
                        }
                        if (tile.sourceDirX === 0) {
                            newTiles.push(new Tile(tile.x - 1, tile.y, 1, tile.sourceDirY));
                            newTiles.push(new Tile(tile.x + 1, tile.y, -1, tile.sourceDirY));
                        } else {
                            newTiles.push(new Tile(tile.x - tile.sourceDirX, tile.y, tile.sourceDirX, tile.sourceDirY));
                        }
                    }
                }
            }

            currentTiles = randomShuffle(newTiles);
        }

        return null;
    };


    const freeSpace = freeSpaceSearch(tilePosX, tilePosY);
    if (freeSpace) {
        const lyingItem = new LyingItem(freeSpace.x, freeSpace.y, item);
        Game.map[freeSpace.y][freeSpace.x].item = lyingItem;
        Game.world.addChild(lyingItem);
        return lyingItem;
    }
}

export function explode(tilePosX, tilePosY, enemyDamage = 3, playerDamage = 1) {
    const ExplosionSpriteSheet0 = Game.loader.resources["src/textures/explosion_animation-0.json"].textures;
    const ExplosionSpriteSheet1 = Game.loader.resources["src/textures/explosion_animation-1.json"].textures;
    const frames = [ExplosionSpriteSheet0["explosion_00.png"], ExplosionSpriteSheet0["explosion_0.png"],
        ExplosionSpriteSheet0["explosion_1.png"], ExplosionSpriteSheet0["explosion_2.png"],
        ExplosionSpriteSheet1["explosion_3.png"], ExplosionSpriteSheet1["explosion_4.png"],
        ExplosionSpriteSheet1["explosion_5.png"], ExplosionSpriteSheet1["explosion_6.png"]];

    const explosion = new TileElement(frames[0], tilePosX, tilePosY, true);
    explosion.setScaleModifier(3.2);
    explosion.name = "Explosion";
    explosion.angle = randomChoice([0, 90, 180, 270]);
    explosion.zIndex = getZIndexForLayer(tilePosY + 1) + Z_INDEXES.ENEMY + 1;
    Game.world.addChild(explosion);
    animateFrames(explosion, frames, 12, () => {
        Game.world.removeChild(explosion);
        explosion.texture = randomChoice(frames);
    });

    for (const dir of get8Directions().concat({x: 0, y: 0})) {
        const posX = tilePosX + dir.x;
        const posY = tilePosY + dir.y;
        if (isEnemy(posX, posY)) {
            Game.map[posY][posX].entity.damage(explosion, enemyDamage, 0, 0, DAMAGE_TYPE.HAZARDAL);
        }
        if (isWallTrap(posX, posY)) {
            Game.map[posY][posX].entity.die(explosion);
        }
        if (isDiggable(posX, posY)) {
            Game.world.removeTile(posX, posY);
        }
        /*
        //doors explosion
        //the world isnt ready for it however
        if (Game.map[posY][posX].tile && Game.map[posY][posX].tile.door2) {
            const tile = Game.map[posY][posX].tile;
            Game.world.removeTile(posX, posY);
            runDestroyAnimation(tile.door2);
            Game.world.removeChild(tile.door2);
        }
         */
        if (isObelisk(posX, posY)) {
            Game.map[posY][posX].entity.destroy();
        } else if (isEntity(posX, posY, ROLE.INANIMATE, INANIMATE_TYPE.CHEST)) {
            Game.map[posY][posX].entity.explode();
        }
        if (Game.map[posY][posX].hazard) {
            Game.map[posY][posX].hazard.removeFromWorld();
        }
        for (let i = Game.bullets.length - 1; i >= 0; i--) {
            if (Game.bullets[i].tilePosition.x === posX && Game.bullets[i].tilePosition.y === posY) {
                Game.bullets[i].die();
            }
        }
        const player = getPlayerOnTile(posX, posY);
        if (player && player.bombImmunity <= 0) {
            player.damage(playerDamage, explosion, false, true);
        }
        shakeScreen(10, 5);
    }
    if (!Game.player.dead) lightPlayerPosition(Game.player);
    if (!Game.player2.dead) lightPlayerPosition(Game.player2);
}

export function applyEnchantment(item, enchantmentType) {
    if (item.enchantment !== ENCHANTMENT_TYPE.NONE) return;
    item.enchantment = enchantmentType;

    // add enchantment's prefix to the item's name
    // If item's name starts with 'The', then put prefix between 'The' and the rest of the name
    if (item.name.split(" ")[0].toLowerCase() === "the") {
        item.name = `The ${enchantmentType.prefix} ${item.name.split(" ").slice(1).join(" ")}`;
    } else {
        item.name = `${enchantmentType.prefix} ${item.name}`;
    }
    switch (enchantmentType) {
        case ENCHANTMENT_TYPE.DIVINE:
            item.atk += 0.5;
            break;
        case ENCHANTMENT_TYPE.CURSED:
            item.nonremoveable = true;
            break;
    }
}

export function removeEnchantment(item) {
    if (item.enchantment === ENCHANTMENT_TYPE.NONE) return;
    item.name = item.name.replace(item.enchantment.prefix + " ", "");
    switch (item.enchantment) {
        case ENCHANTMENT_TYPE.DIVINE:
            item.atk -= 0.5;
            break;
        case ENCHANTMENT_TYPE.CURSED:
            item.nonremoveable = false;
            break;
        case ENCHANTMENT_TYPE.NIGHTMARE:
            const killedMinions = item.minions.filter(m => m.temporary === true);
            for (const minion of killedMinions) {
                minion.deactivate();
                removeObjectFromArray(minion, item.minions);
            }
            break;
    }

    item.enchantment = ENCHANTMENT_TYPE.NONE;
}

//todo put color info into enchantment enum?
export function getItemLabelColor(item) {
    if (item.enchantment === ENCHANTMENT_TYPE.DIVINE) return 0x5ff0f0;
    else if (item.enchantment === ENCHANTMENT_TYPE.CURSED) return 0xea4155;
    else if (item.enchantment === ENCHANTMENT_TYPE.NIGHTMARE) return 0x7b77a8;
    else return item.rarity.color;
}

export function randomlyEnchantItem(item) {
    if (!item) return;
    if (stageBeaten(STAGE.FLOODED_CAVE) < 1) return; // you need to beat the first level at least once to unlock enchantments
    if (Math.random() < 0.018) {
        const possibleEnchantments = [];
        if ([EQUIPMENT_TYPE.WEAPON, EQUIPMENT_TYPE.ACCESSORY, EQUIPMENT_TYPE.HEAD, EQUIPMENT_TYPE.ARMOR, EQUIPMENT_TYPE.FOOT, EQUIPMENT_TYPE.SHIELD].includes(item.equipmentType)) {
            possibleEnchantments.push(ENCHANTMENT_TYPE.CURSED);
        }
        if (item.equipmentType === EQUIPMENT_TYPE.WEAPON && !item.isMinionStaff) {
            possibleEnchantments.push(ENCHANTMENT_TYPE.DIVINE);
            possibleEnchantments.push(ENCHANTMENT_TYPE.NIGHTMARE);
        }

        if (possibleEnchantments.length !== 0) applyEnchantment(item, randomChoice(possibleEnchantments));
    }
}

export function getEnchantmentFilters(enchantmentType) {
    switch (enchantmentType) {
        case ENCHANTMENT_TYPE.DIVINE:
            return [ITEM_OUTLINE_FILTER, DIVINE_FILTER];
        case ENCHANTMENT_TYPE.CURSED:
            return [CURSED_FILTER];
        case ENCHANTMENT_TYPE.NIGHTMARE:
            return [NIGHTMARE_FILTER_1, NIGHTMARE_FILTER_2];
        default:
            return [];
    }
}