import {Game} from "./game";
import {RABBIT_TYPE, TILE_TYPE} from "./enums";
import PF from "../../bower_components/pathfinding/pathfinding-browser";
import {FullTileElement} from "./classes/tile_elements/full_tile_element";

import {copy2dArray} from "./utils/basic_utils";
import {getRandomChestDrop, getRandomSpell, getRandomValue, getRandomWeapon} from "./utils/random_utils";
import {Roller} from "./classes/enemies/roller";
import {RollerB} from "./classes/enemies/roller_b";
import {Snail} from "./classes/enemies/snail";
import {SnailB} from "./classes/enemies/snail_b";
import {Star} from "./classes/enemies/star";
import {StarB} from "./classes/enemies/star_b";
import {Spider} from "./classes/enemies/spider";
import {SpiderB} from "./classes/enemies/spider_b";
import {Eel} from "./classes/enemies/eel";
import {DarkEel} from "./classes/enemies/dark_eel";
import {PoisonEel} from "./classes/enemies/poison_eel";
import {Statue} from "./classes/inanimate_objects/statue";
import {Chest} from "./classes/inanimate_objects/chest";
import {Obelisk} from "./classes/inanimate_objects/obelisk";
import {SpiderRed} from "./classes/enemies/spider_red";
import {SpiderGreen} from "./classes/enemies/spider_green";
import {KingFireFrog} from "./classes/enemies/frog_king_fire";
import {KingFrog} from "./classes/enemies/frog_king";
import {FireFrog} from "./classes/enemies/frog_fire";
import {Frog} from "./classes/enemies/frog";
import {Mushroom} from "./classes/enemies/mushroom";
import {SmallMushroom} from "./classes/enemies/mushroom_small";
import {Alligator} from "./classes/enemies/alligator";
import {Rabbit} from "./classes/enemies/rabbit";
import {Torch} from "./classes/equipment/tools/torch";

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
                lit: false
            };
            if (map[i][j] === "w") {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new FullTileElement(Game.resources["src/images/wall.png"].texture, j, i);
            } else if (map[i][j] === "sw") {
                mapCell.tileType = TILE_TYPE.SUPER_WALL;
                mapCell.tile = new FullTileElement(Game.resources["src/images/super_wall.png"].texture, j, i);
            } else if (map[i][j] === "v") {
                mapCell.tileType = TILE_TYPE.VOID;
            } else if (map[i][j] === "entry") {
                mapCell.tileType = TILE_TYPE.ENTRY;
            } else if (map[i][j] === "path") {
                mapCell.tileType = TILE_TYPE.PATH;
            } else if (map[i][j] === "exit") {
                mapCell.tileType = TILE_TYPE.EXIT;
                mapCell.tile = new FullTileElement(Game.resources["src/images/exit.png"].texture, j, i);
            }

            if (map[i][j] === "r") mapCell.entity = new Roller(j, i);
            else if (map[i][j] === "rb") mapCell.entity = new RollerB(j, i);
            else if (map[i][j] === "s") mapCell.entity = new Star(j, i);
            else if (map[i][j] === "sb") mapCell.entity = new StarB(j, i);
            else if (map[i][j] === "spi") mapCell.entity = new Spider(j, i);
            else if (map[i][j] === "spib") mapCell.entity = new SpiderB(j, i);
            else if (map[i][j] === "spider_red") mapCell.entity = new SpiderRed(j, i);
            else if (map[i][j] === "spider_green") mapCell.entity = new SpiderGreen(j, i);
            else if (map[i][j] === "sna") mapCell.entity = new Snail(j, i);
            else if (map[i][j] === "snab") mapCell.entity = new SnailB(j, i);
            else if (map[i][j] === "eel") mapCell.entity = new Eel(j, i);
            else if (map[i][j] === "eel_dark") mapCell.entity = new DarkEel(j, i);
            else if (map[i][j] === "eel_poison") mapCell.entity = new PoisonEel(j, i);
            else if (map[i][j] === "frog") mapCell.entity = new Frog(j, i);
            else if (map[i][j] === "frog_fire") mapCell.entity = new FireFrog(j, i);
            else if (map[i][j] === "frog_king") mapCell.entity = new KingFrog(j, i);
            else if (map[i][j] === "frog_king_fire") mapCell.entity = new KingFireFrog(j, i);
            else if (map[i][j] === "mushroom") mapCell.entity = new Mushroom(j, i);
            else if (map[i][j] === "mushroom_small") mapCell.entity = new SmallMushroom(j, i);
            else if (map[i][j] === "alligator") {
                //Pairs for paired enemies are generated in the map generation phase. That is how I've decided it to be...
                let type = getRandomValue(RABBIT_TYPE);
                if (type === RABBIT_TYPE.ENERGY) {
                    //energy type is rarer than others so if we get it we reroll it once again
                    type = getRandomValue(RABBIT_TYPE)
                }
                const prey = new Rabbit(j, i, type);
                mapCell.entity = new Alligator(j, i, prey);
            } else if (map[i][j] === "statue") {
                if (Game.weaponPool.length > 0) {
                    mapCell.entity = new Statue(j, i, getRandomWeapon());
                }
            } else if (map[i][j] === "chest") {
                if (Game.chestItemPool.length > 0) {
                    mapCell.entity = new Chest(j, i, getRandomChestDrop());
                }
            } else if (map[i][j] === "obelisk") {
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
            } else if (map[i][j] === "torch") {
                const chest = new Chest(j, i, new Torch());
                chest.interact(null);
                mapCell.entity = chest;
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
    let mapWithWeights = [];
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