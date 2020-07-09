import {Game} from "../game";
import * as PIXI from "pixi.js";
import {ROLE, STAGE} from "../enums";
import {decrementEachDigitInHex} from "../utils/basic_utils";
import {DarkTunnelTile} from "../classes/tile_elements/dark_tunnel_tile";
import {updateChain} from "./draw_dunno";
import {LimitChain} from "../classes/draw/limit_chain";
import {DarknessTile} from "../classes/draw/darkness";
import {FloorTile} from "../classes/draw/floor_tile";

export function drawTiles() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            if (Game.map[i][j].tile !== null) {
                Game.world.addChild(Game.map[i][j].tile);
                Game.map[i][j].tile.visible = false;

                //for doors
                if (Game.map[i][j].tile.door2) Game.world.addChild(Game.map[i][j].tile.door2);

            }
            if (Game.stage === STAGE.RUINS) {
                if (i !== 0 && i !== Game.map.length - 1 && j !== 0 && j !== Game.map[0].length - 1) {
                    Game.world.addChild(new FloorTile(j, i));
                }
            }
        }
    }
}

export function createDarkness() {
    for (let i = 0; i < Game.map.length; ++i) {
        Game.darkTiles[i] = [];
        for (let j = 0; j < Game.map[0].length; ++j) {
            let voidTile;
            if (Game.stage === STAGE.DARK_TUNNEL) {
                voidTile = new DarkTunnelTile(j, i);
            } else {
                voidTile = new DarknessTile(PIXI.Texture.WHITE, j, i);
                voidTile.tint = 0x000000;
            }
            Game.world.addChild(voidTile);
            Game.darkTiles[i][j] = voidTile;
        }
    }
}

export function drawEntities() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            for (const entity of [Game.map[i][j].entity, Game.map[i][j].secondaryEntity]) {
                if (entity !== null) {
                    Game.world.addChild(entity);
                    if (entity.role === ROLE.ENEMY || entity.role === ROLE.WALL_TRAP) {
                        Game.enemies.push(entity);
                    } else if (entity.role === ROLE.INANIMATE) {
                        Game.inanimates.push(entity);
                    }
                    if (entity.role !== ROLE.PLAYER) {
                        entity.visible = false;
                    }
                    entity.place();
                }
            }
            const entity = Game.map[i][j].item;
            if (entity !== null) {
                Game.world.addChild(entity);
                entity.visible = false;
            }
        }
    }
}

export function drawGrid() {
    if (Game.stage === STAGE.RUINS) return;

    const grid = new PIXI.Container();
    const lineThickness = 2 * Math.round(Game.TILESIZE / 25 / 2);
    for (let i = 1; i < Game.map.length; i++) {
        const line = new PIXI.Graphics();
        line.beginFill(decrementEachDigitInHex(Game.BGColor));
        line.drawRect(0, Game.TILESIZE * i - lineThickness / 2, Game.map[0].length * Game.TILESIZE, lineThickness);
        grid.addChild(line);
    }
    for (let i = 1; i < Game.map[0].length; i++) {
        const line = new PIXI.Graphics();
        line.beginFill(decrementEachDigitInHex(Game.BGColor));
        line.drawRect(Game.TILESIZE * i - lineThickness / 2, 0, lineThickness, Game.map.length * Game.TILESIZE);
        grid.addChild(line);
    }

    grid.zIndex = -2;
    Game.world.addChild(grid);
}

export function drawOther() {
    if (Game.stage !== STAGE.RUINS) drawBackground();
    drawChain();
}

function drawChain() {
    //Game.followChain = new PIXI.Sprite(Game.resources["src/images/follow_chain.png"].texture);
    //Game.world.addChild(Game.followChain);
    Game.limitChain = new LimitChain();
    Game.world.addChild(Game.limitChain);
    updateChain();
}

function drawBackground() {
    const gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(Game.BGColor);
    const cutW = Game.TILESIZE;
    const cutH = Game.TILESIZE * 1.5;
    gameWorldBG.drawRect(cutW / 2, cutH / 2, Game.world.width - cutW, Game.world.height - cutH);
    gameWorldBG.zIndex = -4;
    Game.world.addChild(gameWorldBG);
}