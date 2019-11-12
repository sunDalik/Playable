import {Game} from "./game"
import astar from "javascript-astar"
import {TILE_TYPE} from "./enums";
import {FullTileElement} from "./classes/full_tile_element"

import {copy2dArray, getRandomSpell, getRandomChestDrop, getRandomWeapon} from "./utils"
import {Roller} from "./classes/enemies/roller"
import {RollerB} from "./classes/enemies/roller_b"
import {Snail} from "./classes/enemies/snail"
import {SnailB} from "./classes/enemies/snail_b"
import {Star} from "./classes/enemies/star"
import {StarB} from "./classes/enemies/star_b"
import {Spider} from "./classes/enemies/spider"
import {SpiderB} from "./classes/enemies/spider_b"
import {Eel} from "./classes/enemies/eel"
import {DarkEel} from "./classes/enemies/dark_eel"
import {PoisonEel} from "./classes/enemies/poison_eel"
import {Statue} from "./classes/statue"
import {Chest} from "./classes/chest"
import {Obelisk} from "./classes/obelisk"

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
            else if (map[i][j] === "sna") mapCell.entity = new Snail(j, i);
            else if (map[i][j] === "snab") mapCell.entity = new SnailB(j, i);
            else if (map[i][j] === "eel") mapCell.entity = new Eel(j, i);
            else if (map[i][j] === "eel_dark") mapCell.entity = new DarkEel(j, i);
            else if (map[i][j] === "eel_poison") mapCell.entity = new PoisonEel(j, i);
            else if (map[i][j] === "statue") mapCell.entity = new Statue(j, i, getRandomWeapon());
            else if (map[i][j] === "chest") mapCell.entity = new Chest(j, i, getRandomChestDrop());
            else if (map[i][j] === "obelisk") {
                let magicPool = [];
                for (let i = 0; i < 4; ++i) {
                    while (true) {
                        const randomSpell = getRandomSpell();
                        if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                            magicPool.push(randomSpell);
                            break;
                        }
                        if (magicPool.length === Game.magicPool.length) break;
                    }
                }
                obeliskTiles.push({x: j, y: i});
                mapCell.entity = new Obelisk(j, i, magicPool);
            }

            map[i][j] = mapCell;
        }
    }

    for (const obelisk of obeliskTiles) {
        const obeliskEntity = map[obelisk.y][obelisk.x].entity;
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

export function calculateDetectionGraph(map) {
    let mapWithWeights = [];
    for (let i = 0; i < map.length; ++i) {
        mapWithWeights[i] = [];
        for (let j = 0; j < map[0].length; ++j) {
            if (map[i][j].tileType === TILE_TYPE.VOID || map[i][j].tileType === TILE_TYPE.PATH
                || map[i][j].tileType === TILE_TYPE.WALL || map[i][j].tileType === TILE_TYPE.SUPER_WALL) {
                mapWithWeights[i][j] = 0;
            } else {
                mapWithWeights[i][j] = 1;
            }
        }
    }
    Game.playerDetectionGraph = new astar.Graph(mapWithWeights);
}