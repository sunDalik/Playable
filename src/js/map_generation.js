import {Game} from "./game";
import {ENEMY_TYPE, MAP_SYMBOLS, RABBIT_TYPE, ROLE, STAGE, TILE_TYPE} from "./enums";
import PF from "../../bower_components/pathfinding/pathfinding-browser";
import {copy2dArray} from "./utils/basic_utils";
import {getRandomInt, getRandomValue, randomShuffle} from "./utils/random_utils";
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
import {LaserTurret} from "./classes/enemies/laser_turret";
import {SpikyWallTrap} from "./classes/enemies/spiky_wall_trap";
import {ParanoidEel} from "./classes/enemies/bosses/paranoid_eel";
import {BalletSpider} from "./classes/enemies/bosses/ballet_spider";
import {GuardianOfTheLight} from "./classes/enemies/bosses/guardian_of_the_light";
import {FireGoblet} from "./classes/inanimate_objects/fire_goblet";
import {Necromancy} from "./classes/equipment/magic/necromancy";
import {Bomb} from "./classes/equipment/bag/bomb";
import {SmallHealingPotion} from "./classes/equipment/bag/small_healing_potion";
import {TileElement} from "./classes/tile_elements/tile_element";
import {getRandomChestDrop, getRandomSpell, getRandomWeapon} from "./utils/pool_utils";
import {tileInsideTheBossRoom} from "./map_checks";
import {Cocoon} from "./classes/enemies/cocoon";
import {LizardWarrior} from "./classes/enemies/lizard_warrior";
import {RustySword} from "./classes/equipment/weapons/rusty_sword";
import {TeleportMage} from "./classes/enemies/teleport_mage";
import {MudCubeZombie} from "./classes/enemies/mud_cube_zombie";
import {MudMage} from "./classes/enemies/mud_mage";
import {WallSlime} from "./classes/enemies/wall_slime";
import {PingPongBuddy} from "./classes/enemies/ping_pong_buddies";
import {WallTile} from "./classes/draw/wall";
import {getZIndexForLayer, Z_INDEXES} from "./z_indexing";

export function generateMap(level) {
    const map = copy2dArray(level);
    const obeliskTiles = [];
    const entries = [];
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
            if (map[i][j].split(":")[0] === MAP_SYMBOLS.WALL) {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new WallTile(Game.resources["src/images/wall.png"].texture, j, i);
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.SUPER_WALL) {
                mapCell.tileType = TILE_TYPE.SUPER_WALL;
                mapCell.tile = new WallTile(Game.resources["src/images/wall.png"].texture, j, i);
                //mapCell.tile = new WallTile(Game.resources["src/images/super_wall.png"].texture, j, i);
                mapCell.tile.tint = 0x888888;
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.VOID) {
                mapCell.tileType = TILE_TYPE.VOID;
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.ENTRY) {
                mapCell.tileType = TILE_TYPE.ENTRY;
                entries.push({x: j, y: i});
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.PATH) {
                mapCell.tileType = TILE_TYPE.PATH;
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.EXIT) {
                mapCell.tileType = TILE_TYPE.EXIT;
                mapCell.tile = new TileElement(Game.resources["src/images/exit_text.png"].texture, j, i);
                //mapCell.tile.zIndex = 100;
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.START) {
                Game.startPos = {x: j, y: i};
            } else if (map[i][j].split(":")[0] === MAP_SYMBOLS.BOSS_EXIT) {
                mapCell.tileType = TILE_TYPE.WALL;
                mapCell.tile = new TileElement(Game.resources["src/images/wall.png"].texture, j, i);
                Game.bossExit = {x: j, y: i};
            }

            if (map[i][j].split(":")[1] === MAP_SYMBOLS.END_ROOM_BOUNDARY) Game.endRoomBoundaries.push({x: j, y: i});

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
            else if (map[i][j] === MAP_SYMBOLS.LASER_TURRET) mapCell.entity = new LaserTurret(j, i);
            else if (map[i][j] === MAP_SYMBOLS.SPIKY_WALL_TRAP) mapCell.entity = new SpikyWallTrap(j, i);
            else if (map[i][j] === MAP_SYMBOLS.COCOON) mapCell.entity = new Cocoon(j, i);
            else if (map[i][j] === MAP_SYMBOLS.LIZARD_WARRIOR) mapCell.entity = new LizardWarrior(j, i);
            else if (map[i][j] === MAP_SYMBOLS.MUD_MAGE) mapCell.entity = new MudMage(j, i);
            else if (map[i][j] === MAP_SYMBOLS.MUD_CUBE_ZOMBIE) mapCell.entity = new MudCubeZombie(j, i);
            else if (map[i][j] === MAP_SYMBOLS.WALL_SLIME) mapCell.entity = new WallSlime(j, i);
            else if (map[i][j] === MAP_SYMBOLS.PING_PONG_BUDDIES) mapCell.entity = new PingPongBuddy(j, i);
            else if (map[i][j] === MAP_SYMBOLS.TELEPORT_MAGE) mapCell.entity = new TeleportMage(j, i);
            else if (map[i][j] === MAP_SYMBOLS.PARANOID_EEL) mapCell.entity = new ParanoidEel(j, i);
            else if (map[i][j] === MAP_SYMBOLS.BALLET_SPIDER) mapCell.entity = new BalletSpider(j, i);
            else if (map[i][j] === MAP_SYMBOLS.GUARDIAN_OF_THE_LIGHT) mapCell.entity = new GuardianOfTheLight(j, i);
            else if (map[i][j] === MAP_SYMBOLS.STATUE) {
                if (Game.weaponPool.length > 0) {
                    mapCell.entity = new Statue(j, i, getRandomWeapon());
                }
            } else if (map[i][j] === MAP_SYMBOLS.CHEST) {
                mapCell.entity = new Chest(j, i, getRandomChestDrop());
            } else if (map[i][j] === MAP_SYMBOLS.OBELISK) {
                if (Game.magicPool.length >= 4) {
                    let necromancyIndex = -1;
                    let alivePlayer = null;
                    if (Game.player.dead) alivePlayer = Game.player2;
                    else if (Game.player2.dead) alivePlayer = Game.player;
                    if (alivePlayer !== null) {
                        if (alivePlayer.health >= 3.5) necromancyIndex = getRandomInt(0, 3);
                        else if (alivePlayer.health >= 2.5) necromancyIndex = getRandomInt(0, 2);
                        else necromancyIndex = getRandomInt(0, 1);
                    }

                    let magicPool = [];
                    for (let i = 0; i < 4; ++i) {
                        if (i === necromancyIndex) {
                            magicPool.push(new Necromancy());
                        } else {
                            //todo: add attempts and stuff because now it breaks on the 4th floor with only C-magic in the pool
                            while (true) {
                                const randomSpell = getRandomSpell();
                                if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                                    magicPool.push(randomSpell);
                                    break;
                                }
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
            } else if (map[i][j] === MAP_SYMBOLS.FIRE_GOBLET) {
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
            const entrySprite = new TileElement(Game.resources["src/images/boss_entry.png"].texture, entry.x, entry.y);
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
    distributeDrops(Bomb, getRandomInt(3, 4));
    distributeDrops(SmallHealingPotion, getRandomInt(1, 2));

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