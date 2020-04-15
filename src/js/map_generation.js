import {Game} from "./game";
import {ENEMY_TYPE, LEVEL_SYMBOLS, RABBIT_TYPE, ROLE, STAGE, TILE_TYPE} from "./enums";
import PF from "../../bower_components/pathfinding/pathfinding-browser";
import {copy2dArray} from "./utils/basic_utils";
import {getRandomValue, randomInt, randomShuffle} from "./utils/random_utils";
import {Alligator} from "./classes/enemies/alligator";
import {Rabbit} from "./classes/enemies/rabbit";
import {Torch} from "./classes/equipment/tools/torch";
import {LyingItem} from "./classes/equipment/lying_item";
import {FireGoblet} from "./classes/inanimate_objects/fire_goblet";
import {Bomb} from "./classes/equipment/bag/bomb";
import {SmallHealingPotion} from "./classes/equipment/bag/small_healing_potion";
import {TileElement} from "./classes/tile_elements/tile_element";
import {tileInsideTheBossRoom} from "./map_checks";
import {RustySword} from "./classes/equipment/weapons/rusty_sword";
import {CommonSpriteSheet} from "./loader";

export function generateMap(level) {
    const map = copy2dArray(level);
    for (let i = 0; i < map.length; ++i) {
        for (let j = 0; j < map[0].length; ++j) {
            const mapCell = {
                tileType: TILE_TYPE.NONE,
                tile: null,
                hazard: null,
                entity: null,
                secondaryEntity: null,
                item: null,
                lit: false
            };

            if (map[i][j] === LEVEL_SYMBOLS.ALLIGATOR) {
                //Pairs for paired enemies are generated in the map generation phase. That is how I've decided it to be...
                //Paired enemies have one main enemy and one sub enemy. The main enemy controls both itself and the sub enemy.
                //The sub enemy can move independently only when the main enemy is dead
                let type = getRandomValue(RABBIT_TYPE);
                if (type === RABBIT_TYPE.ENERGY) {
                    //energy type is rarer than others so if we get it we reroll it once again
                    type = getRandomValue(RABBIT_TYPE)
                }
                const rabbit = new Rabbit(j, i, type);
                const alligator = new Alligator(j, i, undefined);
                rabbit.predator = alligator;
                alligator.prey = rabbit;
                mapCell.entity = alligator;
                mapCell.secondaryEntity = rabbit;
            } else if (map[i][j] === LEVEL_SYMBOLS.TORCH) {
                mapCell.item = new LyingItem(j, i, new Torch());
                Game.torchTile = {x: j, y: i};
            } else if (map[i][j] === LEVEL_SYMBOLS.FIRE_GOBLET) {
                mapCell.entity = new FireGoblet(j, i);
            }

            map[i][j] = mapCell;
        }
    }

    for (const obelisk of obeliskTiles) {
        const obeliskEntity = map[obelisk.y][obelisk.x].entity;
        Game.obelisks.push(obeliskEntity);
        if (map[obelisk.y][obelisk.x - 2].tileType === TILE_TYPE.WALL || map[obelisk.y][obelisk.x + 2].tileType === TILE_TYPE.WALL) {
            map[obelisk.y + 1][obelisk.x - 1].entity = obeliskEntity.grail1;
            obeliskEntity.grail1.tilePosition.set(obelisk.x - 1, obelisk.y + 1);
            map[obelisk.y + 1][obelisk.x + 1].entity = obeliskEntity.grail2;
            obeliskEntity.grail2.tilePosition.set(obelisk.x + 1, obelisk.y + 1);
            map[obelisk.y + 2][obelisk.x - 1].entity = obeliskEntity.grail3;
            obeliskEntity.grail3.tilePosition.set(obelisk.x - 1, obelisk.y + 2);
            map[obelisk.y + 2][obelisk.x + 1].entity = obeliskEntity.grail4;
            obeliskEntity.grail4.tilePosition.set(obelisk.x + 1, obelisk.y + 2);
        } else {
            map[obelisk.y][obelisk.x - 1].entity = obeliskEntity.grail1;
            obeliskEntity.grail1.tilePosition.set(obelisk.x - 1, obelisk.y);
            map[obelisk.y][obelisk.x + 1].entity = obeliskEntity.grail2;
            obeliskEntity.grail2.tilePosition.set(obelisk.x + 1, obelisk.y);
            map[obelisk.y][obelisk.x - 2].entity = obeliskEntity.grail3;
            obeliskEntity.grail3.tilePosition.set(obelisk.x - 2, obelisk.y);
            map[obelisk.y][obelisk.x + 2].entity = obeliskEntity.grail4;
            obeliskEntity.grail4.tilePosition.set(obelisk.x + 2, obelisk.y);
        }
        obeliskEntity.placeGrails();
    }

    for (const entry of entries) {
        if (tileInsideTheBossRoom(entry.x, entry.y)) {
            const entrySprite = new TileElement(CommonSpriteSheet["boss_entry.png"], entry.x, entry.y, true);
            Game.bossEntry = {x: entry.x, y: entry.y};
            if (map[entry.y][entry.x - 1].tileType === TILE_TYPE.PATH) entrySprite.angle = 90;
            else if (map[entry.y][entry.x + 1].tileType === TILE_TYPE.PATH) entrySprite.angle = -90;
            else if (map[entry.y - 1][entry.x].tileType === TILE_TYPE.PATH) entrySprite.angle = 180;
            map[entry.y][entry.x].tile = entrySprite;
            if (Game.stage === STAGE.RUINS) map[entry.y][entry.x].tile = null;
        }
    }

    return map;
}

let mapWithWeights;

//0 is walkable, 1 is not
export function calculateDetectionGraph(map) {
    mapWithWeights = [];
    for (let i = 0; i < map.length; ++i) {
        mapWithWeights[i] = [];
        for (let j = 0; j < map[0].length; ++j) {
            if (map[i][j].tileType === TILE_TYPE.VOID || map[i][j].tileType === TILE_TYPE.PATH
                || map[i][j].tileType === TILE_TYPE.WALL || map[i][j].tileType === TILE_TYPE.SUPER_WALL) {
                mapWithWeights[i][j] = 1;
            } else {
                mapWithWeights[i][j] = 0;
            }
        }
    }
    Game.playerDetectionGraph = new PF.Grid(mapWithWeights);
}

export function recalculateTileInDetectionGraph(tileX, tileY) {
    if (Game.map[tileY][tileX].tileType === TILE_TYPE.VOID || Game.map[tileY][tileX].tileType === TILE_TYPE.PATH
        || Game.map[tileY][tileX].tileType === TILE_TYPE.WALL || Game.map[tileY][tileX].tileType === TILE_TYPE.SUPER_WALL) {
        mapWithWeights[tileY][tileX] = 1;
    } else {
        mapWithWeights[tileY][tileX] = 0;
    }
    Game.playerDetectionGraph = new PF.Grid(mapWithWeights); //wait do I need it? I don't know
}

export function assignDrops() {
    distributeDrops(Bomb, randomInt(4, 5));
    distributeDrops(SmallHealingPotion, randomInt(1, 2));

    if (Game.stage === STAGE.RUINS) {
        if (Math.random() < 0.5) {
            distributeDrops(RustySword, 1, ENEMY_TYPE.LIZARD_WARRIOR);
        }
    }
}

function distributeDrops(dropConstructor, amount, enemyType = undefined) {
    randomShuffle(Game.enemies);
    let enemyIndex = 0;
    while (amount > 0) {
        if (enemyIndex >= Game.enemies.length) {
            if (Game.boss) {
                Game.boss.drops.push(new dropConstructor());
                amount--;
            } else break;
        } else {
            const enemy = Game.enemies[enemyIndex];
            if (enemy.drop !== null
                || enemy.boss
                || enemy.role === ROLE.WALL_TRAP
                || enemy.type === ENEMY_TYPE.MUSHROOM
                || enemy.type === ENEMY_TYPE.RABBIT && enemy.predator
                || tileInsideTheBossRoom(enemy.tilePosition.x, enemy.tilePosition.y)
                || (enemyType !== undefined && enemy.type !== enemyType)) {
                enemyIndex++;
            } else {
                enemy.drop = new dropConstructor();
                enemy.energyDrop = 0;
                amount--;
                enemyIndex++;
            }
        }
    }
}