import {distance, otherPlayer} from "../utils/game_utils";
import {Game} from "../game";

export function updateFollowChain() {
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