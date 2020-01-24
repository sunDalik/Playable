import {Game} from "../../../game"
import {EQUIPMENT_TYPE, MAGIC_ALIGNMENT, MAGIC_TYPE, RARITY,} from "../../../enums";
import {drawInteractionKeys, drawMovementKeyBindings} from "../../../drawing/draw_hud";
import {otherPlayer} from "../../../utils/game_utils";
import {camera} from "../../game/camera";
import {updateChain} from "../../../drawing/draw_dunno";

export class Teleport {
    constructor() {
        this.texture = Game.resources["src/images/magic/teleport.png"].texture;
        this.type = MAGIC_TYPE.TELEPORT;
        this.equipmentType = EQUIPMENT_TYPE.MAGIC;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.atk = 0;
        this.maxUses = 20;
        this.uses = this.maxUses;
        this.name = "Teleport";
        this.description = "Teleport to her";
        this.rarity = RARITY.C;
    }

    cast(wielder) {
        if (this.uses <= 0) return false;
        if (Game.player.dead || Game.player2.dead) return false;
        if (wielder.tilePosition.x === otherPlayer(wielder).tilePosition.x
            && wielder.tilePosition.y === otherPlayer(wielder).tilePosition.y) return false;
        wielder.removeFromMap();
        wielder.tilePosition.set(otherPlayer(wielder).tilePosition.x, otherPlayer(wielder).tilePosition.y);
        wielder.placeOnMap();
        wielder.place();
        updateChain();
        drawMovementKeyBindings();
        drawInteractionKeys();
        camera.center();
        this.uses--;
        return true;
    }
}