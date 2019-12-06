import {Game} from "../game"
import * as PIXI from "pixi.js"
import {ROLE, STAGE, TILE_TYPE} from "../enums";
import {FullTileElement} from "../classes/tile_elements/full_tile_element";
import {decrementEachDigitInHex} from "../utils/basic_utils";
import {DarkTunnelTile} from "../classes/tile_elements/dark_tunnel_tile";

export function drawTiles() {
    for (let i = 0; i < Game.map.length; ++i) {
        for (let j = 0; j < Game.map[0].length; ++j) {
            if (Game.map[i][j].tile !== null) {
                Game.world.addChild(Game.map[i][j].tile);
                Game.tiles.push(Game.map[i][j].tile);
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
            Game.tiles.push(voidTile);
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
                    Game.tiles.push(entity);
                    if (entity.role === ROLE.ENEMY) {
                        Game.enemies.push(entity);
                    }
                    if (entity.role !== ROLE.PLAYER) {
                        entity.visible = false;
                    }
                }
            }
            const entity = Game.map[i][j].item;
            if (entity !== null) {
                Game.world.addChild(entity);
                Game.tiles.push(entity);
            }
        }
    }
}

export function drawGrid() {
    const gridTexture = Game.resources["src/images/grid.png"].texture;
    const grid = new PIXI.TilingSprite(gridTexture, Game.map[0].length * gridTexture.width, Game.map.length * gridTexture.height);
    grid.scale.set(Game.TILESIZE / gridTexture.width, Game.TILESIZE / gridTexture.height);
    //2 is half-width of a tile's border... Don't ask me I don't understand why it works either
    grid.position.x -= 2 * Game.TILESIZE / gridTexture.width;
    grid.position.y -= 2 * Game.TILESIZE / gridTexture.height;
    grid.tint = decrementEachDigitInHex(Game.BGColor);
    grid.zIndex = -2;
    Game.world.addChild(grid);
    return grid;
}

export function drawOther() {
    const gameWorldBG = new PIXI.Graphics();
    gameWorldBG.beginFill(Game.BGColor);
    gameWorldBG.drawRect(10, 10, Game.world.width - 20, Game.world.height - 20);
    gameWorldBG.zIndex = -4;
    //to hide grid on world borders
    const gridBorderWidth = -2 * Game.TILESIZE / Game.resources["src/images/grid.png"].texture.width;
    const blackOutline = new PIXI.Graphics();
    blackOutline.lineStyle(3, 0x000000);
    blackOutline.drawRect(gridBorderWidth, gridBorderWidth, Game.world.width, Game.world.height);
    blackOutline.endFill();
    Game.world.addChild(gameWorldBG);
    Game.world.addChild(blackOutline);
    Game.otherGraphics.push(gameWorldBG);
    Game.otherGraphics.push(blackOutline);
}