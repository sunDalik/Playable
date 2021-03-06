import {EQUIPMENT_ID, MAGIC_ALIGNMENT} from "../../../enums/enums";
import {MagicSpriteSheet} from "../../../loader";
import {Magic} from "../magic";
import {otherPlayer} from "../../../utils/game_utils";
import {drawStatsForPlayer} from "../../../drawing/draw_hud";

export class AttackLink extends Magic {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_attack_link.png"];
        this.id = EQUIPMENT_ID.ATTACK_LINK;
        this.alignment = MAGIC_ALIGNMENT.DARK;
        this.name = "Attack Link";
        this.description = "Other character gets +0.5 to atk multiplier, which effectively doubles its attack\nThe bonus is only active while both souls are alive";
        this.gainedIncreasement = false;
        this.calculateRarity();
    }

    onWear(wielder) {
        super.onWear(wielder);
        this.increaseStat(wielder);
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        this.decreaseStat(wielder);
    }

    onDeath(wielder) {
        super.onDeath(wielder);
        this.decreaseStat(wielder);
    }

    onRevive(wielder) {
        super.onRevive(wielder);
        this.increaseStat(wielder);
    }

    increaseStat(wielder) {
        if (!this.gainedIncreasement) {
            this.gainedIncreasement = true;
            otherPlayer(wielder).atkMul += 0.5;
            drawStatsForPlayer(otherPlayer(wielder));
        }
    }

    decreaseStat(wielder) {
        if (this.gainedIncreasement) {
            this.gainedIncreasement = false;
            otherPlayer(wielder).atkMul -= 0.5;
            drawStatsForPlayer(otherPlayer(wielder));
        }
    }

    cast(wielder) {
        return false;
    }
}