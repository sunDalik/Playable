import {distance, otherPlayer} from "../utils/game_utils";
import {Game} from "../game";
import {camera} from "../classes/game/camera";
import {STAGE, TILE_TYPE} from "../enums";

export function updateChain() {
    //updateFollowChain();
    Game.limitChain.update();
}

function updateFollowChain() {
    if (Game.followMode) {
        Game.followChain.zIndex = otherPlayer(Game.primaryPlayer).zIndex + 1;
        Game.followChain.visible = true;
        Game.followChain.width = Game.followChain.height = Math.min(distance(Game.player, Game.player2), Game.TILESIZE * 1.1);
        Game.followChain.position.x = Game.player.position.x;
        Game.followChain.position.y = Game.player.position.y;
        Game.followChain.anchor.set(0.5, 1);
        Game.followChain.rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x)) + Math.PI / 2;
        if (Game.player2.x < Game.player.x) {
            Game.followChain.rotation += Math.PI;
        }
    } else Game.followChain.visible = false;
}

export function cullByView() {
    const externalTiles = 2;
    const left = Math.floor((camera.x - Game.app.renderer.screen.width / 2) / Game.TILESIZE) - externalTiles;
    const right = Math.floor((camera.x + Game.app.renderer.screen.width / 2) / Game.TILESIZE) + externalTiles;
    const up = Math.floor((camera.y - Game.app.renderer.screen.height / 2) / Game.TILESIZE) - externalTiles;
    const down = Math.floor((camera.y + Game.app.renderer.screen.height / 2) / Game.TILESIZE) + externalTiles;
    for (let i = 0; i < Game.map.length; i++) {
        for (let j = 0; j < Game.map[0].length; j++) {
            if (i >= up && i <= down && j >= left && j <= right) {
                setTileVisibility(j, i, true);
            } else {
                setTileVisibility(j, i, false);
            }
        }
    }

    function setTileVisibility(x, y, visible) {
        //todo: make toggleVisibility function to also hide intents and shadows?
        const mapCell = Game.map[y][x];
        if (mapCell.lit) {
            //if (mapCell.entity) mapCell.entity.visible = visible;
            //if (mapCell.secondaryEntity) mapCell.secondaryEntity.visible = visible;
            if (mapCell.hazard) mapCell.hazard.visible = visible;
            if (mapCell.tile) mapCell.tile.visible = visible;
            if (mapCell.item) mapCell.item.visible = visible;
        }
        if (visible === false) Game.darkTiles[y][x].visible = false;
        else {
            if (!mapCell.lit) Game.darkTiles[y][x].visible = true;

            if (Game.stage === STAGE.DARK_TUNNEL) {
                //no idea yet
                //todo though
            }
        }
    }
}