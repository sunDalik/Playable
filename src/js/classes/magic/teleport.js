"use strict";

class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 6;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        let otherPlayer;
        if (wielder === Game.player2) otherPlayer = Game.player;
        else otherPlayer = Game.player2;
        removePlayerFromGameMap(wielder);
        wielder.tilePosition.set(otherPlayer.x, otherPlayer.y);
        placePlayerOnGameMap(wielder);
        Game.player2.place();
        centerCamera();
        this.uses--;
    }
}


/*
if (Game.player2.x > Game.player.x) {
            if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x = Game.player.tilePosition.x + 1;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
                Game.player2.tilePosition.x = Game.player.tilePosition.x
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
                Game.player2.tilePosition.x = Game.player.tilePosition.x
            } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x = Game.player.tilePosition.x - 1;
            }
        } else if (Game.player2.x < Game.player.x) {
            if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x = Game.player.tilePosition.x - 1;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
                Game.player2.tilePosition.x = Game.player.tilePosition.x
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
                Game.player2.tilePosition.x = Game.player.tilePosition.x
            } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x = Game.player.tilePosition.x + 1;
            }
        } else if (Game.player2.tilePosition.y < Game.player.tilePosition.y) {
            if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x--;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y - 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x++;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
            }
        } else {
            if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y + 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y + 1;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x - 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x--;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x + 1, Game.player.tilePosition.y)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y;
                Game.player2.tilePosition.x++;
            } else if (isRelativelyEmpty(Game.player.tilePosition.x, Game.player.tilePosition.y - 1)) {
                Game.player2.tilePosition.y = Game.player.tilePosition.y - 1;
            }
        }
 */