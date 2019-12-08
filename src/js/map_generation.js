import {Game} from "./game";
import {MAP_SYMBOLS, RABBIT_TYPE, TILE_TYPE} from "./enums";
import PF from "../../bower_components/pathfinding/pathfinding-browser";
import {FullTileElement} from "./classes/tile_elements/full_tile_element";
import {copy2dArray} from "./utils/basic_utils";
import {getRandomChestDrop, getRandomSpell, getRandomValue, getRandomWeapon} from "./utils/random_utils";
import {Roller} from "./classes/enemies/roller";
import {RedRoller} from "./classes/enemies/roller_red";
import {Snail} from "./classes/enemies/snail";
import {SpikySnail} from "./classes/enemies/snail_spiky";
import {Star} from "./classes/enemies/star";
import {RedStar} from "./classes/enemies/star_red";
import {Spider} from "./classes/enemies/spider";
import {GraySpider} from "./classes/enemies/spider_gray";
import {Eel} from "./classes/enemies/eel";
import {DarkEel} from "./classes/enemies/eel_dark";
import {PoisonEel} from "./classes/enemies/eel_poison";
import {Statue} from "./classes/inanimate_objects/statue";
import {Chest} from "./classes/inanimate_objects/chest";
import {Obelisk} from "./classes/inanimate_objects/obelisk";
import {RedSpider} from "./classes/enemies/spider_red";
import {GreenSpider} from "./classes/enemies/spider_green";
import {KingFireFrog} from "./classes/enemies/frog_king_fire";
import {KingFrog} from "./classes/enemies/frog_king";
import {FireFrog} from "./classes/enemies/frog_fire";
import {Frog} from "./classes/enemies/frog";
import {Mushroom} from "./classes/enemies/mushroom";
import {SmallMushroom} from "./classes/enemies/mushroom_small";
import {Alligator} from "./classes/enemies/alligator";
import {Rabbit} from "./classes/enemies/rabbit";
import {Torch} from "./classes/equipment/tools/torch";
import {LyingItem} from "./classes/equipment/lying_item";

export function generateMap(level) {
    let map = copy2dArray(level);
    let obeliskTiles = [];
    for (let i = 0; i < map.length; ++i) {
        for (let j = 0; j < map[0].length; ++j) {
            let mapCell = {
                tileType: TILE_TYPE.NONE,
                tile: null,
                hazard: null,
                entity: null,
                secondaryEntity: null,
                item: null,
                lit: false
            };
            if (map[i][j] === MAP_SYMBOLS.WALL) {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new FullTileElement(Game.resources["src/images/wall.png"].texture, j, i);
            } else if (map[i][j] === MAP_SYMBOLS.SUPER_WALL) {
                mapCell.tileType = TILE_TYPE.SUPER_WALL;
                mapCell.tile = new FullTileElement(Game.resources["src/images/super_wall.png"].texture, j, i);
            } else if (map[i][j] === MAP_SYMBOLS.VOID) {
                mapCell.tileType = TILE_TYPE.VOID;
            } else if (map[i][j] === MAP_SYMBOLS.ENTRY) {
                mapCell.tileType = TILE_TYPE.ENTRY;
            } else if (map[i][j] === MAP_SYMBOLS.PATH) {
                mapCell.tileType = TILE_TYPE.PATH;
            } else if (map[i][j] === MAP_SYMBOLS.EXIT) {
                mapCell.tileType = TILE_TYPE.EXIT;
                mapCell.tile = new FullTileElement(Game.resources["src/images/exit.png"].texture, j, i);
            }

            if (map[i][j] === MAP_SYMBOLS.ROLLER) mapCell.entity = new Roller(j, i);
            else if (map[i][j] === MAP_SYMBOLS.ROLLER_RED) mapCell.entity = new RedRoller(j, i);
            else if (map[i][j] === MAP_SYMBOLS.STAR) mapCell.entity = new Star(j, i);
            else if (map[i][j] === MAP_SYMBOLS.STAR_RED) mapCell.entity = new RedStar(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SPIDER) mapCell.entity = new Spider(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SPIDER_GRAY) mapCell.entity = new GraySpider(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SPIDER_RED) mapCell.entity = new RedSpider(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SPIDER_GREEN) mapCell.entity = new GreenSpider(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SNAIL) mapCell.entity = new Snail(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SNAIL_SPIKY) mapCell.entity = new SpikySnail(j, i);
            else if (map[i][j] === MAP_SYMBOLS.EEL) mapCell.entity = new Eel(j, i);
            else if (map[i][j] === MAP_SYMBOLS.EEL_DARK) mapCell.entity = new DarkEel(j, i);
            else if (map[i][j] === MAP_SYMBOLS.EEL_POISON) mapCell.entity = new PoisonEel(j, i);
            else if (map[i][j] === MAP_SYMBOLS.FROG) mapCell.entity = new Frog(j, i);
            else if (map[i][j] === MAP_SYMBOLS.FROG_FIRE) mapCell.entity = new FireFrog(j, i);
            else if (map[i][j] === MAP_SYMBOLS.FROG_KING) mapCell.entity = new KingFrog(j, i);
            else if (map[i][j] === MAP_SYMBOLS.FROG_KING_FIRE) mapCell.entity = new KingFireFrog(j, i);
            else if (map[i][j] === MAP_SYMBOLS.MUSHROOM) mapCell.entity = new Mushroom(j, i);
            else if (map[i][j] === MAP_SYMBOLS.MUSHROOM_SMALL) mapCell.entity = new SmallMushroom(j, i);
            else if (map[i][j] === MAP_SYMBOLS.ALLIGATOR) {
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
            } else if (map[i][j] === MAP_SYMBOLS.ALLIGATOR_ELECTRIC) mapCell.entity = new Alligator(j, i, RABBIT_TYPE.ELECTRIC);
            else if (map[i][j] === MAP_SYMBOLS.ALLIGATOR_FIRE) mapCell.entity = new Alligator(j, i, RABBIT_TYPE.FIRE);
            else if (map[i][j] === MAP_SYMBOLS.ALLIGATOR_ENERGY) mapCell.entity = new Alligator(j, i, RABBIT_TYPE.ENERGY);
            else if (map[i][j] === MAP_SYMBOLS.ALLIGATOR_POISON) mapCell.entity = new Alligator(j, i, RABBIT_TYPE.POISON);
            else if (map[i][j] === MAP_SYMBOLS.RABBIT_ELECTRIC) mapCell.entity = new Rabbit(j, i, RABBIT_TYPE.ELECTRIC);
            else if (map[i][j] === MAP_SYMBOLS.RABBIT_FIRE) mapCell.entity = new Rabbit(j, i, RABBIT_TYPE.FIRE);
            else if (map[i][j] === MAP_SYMBOLS.RABBIT_ENERGY) mapCell.entity = new Rabbit(j, i, RABBIT_TYPE.ENERGY);
            else if (map[i][j] === MAP_SYMBOLS.RABBIT_POISON) mapCell.entity = new Rabbit(j, i, RABBIT_TYPE.POISON);
            else if (map[i][j] === MAP_SYMBOLS.STATUE) {
                if (Game.weaponPool.length > 0) {
                    mapCell.entity = new Statue(j, i, getRandomWeapon());
                }
            } else if (map[i][j] === MAP_SYMBOLS.CHEST) {
                if (Game.chestItemPool.length > 0) {
                    mapCell.entity = new Chest(j, i, getRandomChestDrop());
                }
            } else if (map[i][j] === MAP_SYMBOLS.OBELISK) {
                if (Game.magicPool.length >= 4) {
                    let magicPool = [];
                    for (let i = 0; i < 4; ++i) {
                        while (true) {
                            const randomSpell = getRandomSpell();
                            if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                                magicPool.push(randomSpell);
                                break;
                            }
                        }
                    }
                    let onDestroyMagicPool = [];
                    for (let i = 0; i < 2; ++i) {
                        while (true) {
                            const randomSpell = getRandomSpell();
                            if (!onDestroyMagicPool.some(magic => magic.type === randomSpell.type)) {
                                onDestroyMagicPool.push(randomSpell);
                                break;
                            }
                        }
                    }
                    obeliskTiles.push({x: j, y: i});
                    mapCell.entity = new Obelisk(j, i, magicPool, onDestroyMagicPool);
                }
            } else if (map[i][j] === MAP_SYMBOLS.TORCH) {
                mapCell.item = new LyingItem(j, i, new Torch());
                Game.torchTile = {x: j, y: i};
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

    return map;
}

//0 is walkable, 1 is not
export function calculateDetectionGraph(map) {
    const mapWithWeights = [];
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