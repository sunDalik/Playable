import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums/enums";
import {closestPlayer, otherPlayer} from "../../../utils/game_utils";
import {castWind} from "../../../special_move_logic";
import {createPlayerAttackTile, rotate} from "../../../animations";
import {randomChoice} from "../../../utils/random_utils";
import {camera} from "../../game/camera";
import {MILD_DARK_GLOW_FILTER, MILD_WHITE_GLOW_FILTER} from "../../../filters";
import {updateChain} from "../../../drawing/draw_dunno";
import {RUEnemiesSpriteSheet} from "../../../loader";
import {MageEnemy} from "../mage_enemy";

export class TeleportMage extends MageEnemy {
    constructor(tilePositionX, tilePositionY, texture = RUEnemiesSpriteSheet["teleport_mage.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.name = "Teleport Mage";
        this.type = ENEMY_TYPE.TELEPORT_MAGE;
        this.cooldown = 12;
        this.currentCooldown = Math.floor(this.cooldown / 3);
        this.castDistance = 5;
        this.targetedPlayer = null;

        this.neutralTexture = texture;
        this.preparingTexture = RUEnemiesSpriteSheet["teleport_mage_prepare.png"];
        this.castingTexture = RUEnemiesSpriteSheet["teleport_mage_cast.png"];
    }

    cast() {
        const tempPos = {x: this.tilePosition.x, y: this.tilePosition.y};
        this.targetedPlayer.removeFromMap();
        this.setTilePosition(this.targetedPlayer.tilePosition.x, this.targetedPlayer.tilePosition.y);
        this.targetedPlayer.setTilePosition(tempPos.x, tempPos.y);
        updateChain();
        rotate(this.targetedPlayer, randomChoice([true, false]));
        createPlayerAttackTile(this.targetedPlayer.tilePosition);
        camera.moveToCenter(5);
        this.blowAwayFromPlayerPosition(this.targetedPlayer);
        if (!otherPlayer(this.targetedPlayer).dead
            && otherPlayer(this.targetedPlayer).tilePosition.x === this.tilePosition.x
            && otherPlayer(this.targetedPlayer).tilePosition.y === this.tilePosition.y) {
            this.die();
            otherPlayer(this.targetedPlayer).damage(1, this, false, true);
        }
    }

    prepare() {
        this.targetedPlayer = closestPlayer(this);
    }

    setStunIcon() {
        super.setStunIcon();
        this.intentIcon.filters = [];
    }

    updateIntentIcon() {
        super.updateIntentIcon();
        this.intentIcon.filters = [];
        if (this.casting) {
            if (this.targetedPlayer === Game.player) this.intentIcon.filters = [MILD_WHITE_GLOW_FILTER];
            else this.intentIcon.filters = [MILD_DARK_GLOW_FILTER];
        }
    }

    blowAwayFromPlayerPosition(player) {
        castWind(player, 2, 1, 1, true);
    }

    correctScale() {
        if (this.casting) {
            if (this.targetedPlayer.tilePosition.x !== this.tilePosition.x) {
                this.scale.x = Math.sign(this.targetedPlayer.tilePosition.x - this.tilePosition.x) * Math.abs(this.scale.x);
            }
        } else {
            const sign = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (sign !== 0) {
                this.scale.x = sign * Math.abs(this.scale.x);
            }
        }
    }
}