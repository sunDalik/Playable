import {Game} from "../game"
import * as PIXI from "pixi.js"
import {ROLE, STAGE} from "../enums";
import {FullTileElement} from "../classes/tile_elements/full_tile_element";
import {decrementEachDigitInHex} from "../utils/basic_utils";
import {DarkTunnelTile} from "../classes/tile_elements/dark_tunnel_tile";
import {updateChain} from "./draw_dunno";
import {LimitChain} from "../classes/draw/limit_chain";

export function drawTiles() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            if (Game.map[i][j].tile !== null) {
                Game.world.addChild(Game.map[i][j].tile);
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
                voidTile = new FullTileElement(PIXI.Texture.WHITE, j, i);
                voidTile.tint = 0x000000;
                voidTile.zIndex = 10;
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
                }
            }
            const entity = Game.map[i][j].item;
            if (entity !== null) {
                Game.world.addChild(entity);
            }
        }
    }
}

export function drawGrid() {
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
    const gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(Game.BGColor);
    gameWorldBG.drawRect(10, 10, Game.world.width - 20, Game.world.height - 20);
    gameWorldBG.zIndex = -4;
    Game.world.addChild(gameWorldBG);
    //Game.followChain = new PIXI.Sprite(Game.resources["src/images/follow_chain.png"].texture);
    //Game.world.addChild(Game.followChain);
    Game.limitChain = new LimitChain();
    Game.world.addChild(Game.limitChain);
    updateChain();
}