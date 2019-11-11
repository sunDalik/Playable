import {Game} from "../../game"
import {MAGIC_TYPE, MAGIC_ALIGNMENT,} from "../../enums";
import {redrawHealthForPlayer} from "../../draw";
import {placePlayerOnGameMap} from "../../game_logic";
import {centerCamera} from "../../camera";

export class Necromancy {
    constructor() {
        this.texture = Game.resources["src/images/magic/necromancy.png"].texture;
        this.type = MAGIC_TYPE.NECROMANCY;
        this.alignment = MAGIC_ALIGNMENT.GRAY;
        this.atk = 0;
        this.maxUses = 1;
        this.uses = this.maxUses;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        let otherPlayer;
        if (wielder === Game.player2) otherPlayer = Game.player;
        else otherPlayer = Game.player2;
        if (otherPlayer.dead) {
            otherPlayer.dead = false;
            otherPlayer.visible = true;
            otherPlayer.health = otherPlayer.maxHealth;
            redrawHealthForPlayer(otherPlayer);
            otherPlayer.tilePosition.set(wielder.tilePosition.x, wielder.tilePosition.y);
            placePlayerOnGameMap(otherPlayer);
            otherPlayer.place();
            centerCamera();
            this.uses = -1;
            //maybe should shift all magic to left? who knows...
            for (let i = 1; i <= 4; ++i) {
                if (wielder.getMagicById(i) === this) {
                    wielder.setMagicById(i, null);
                    break;
                }
            }
        } else return false
    }
}