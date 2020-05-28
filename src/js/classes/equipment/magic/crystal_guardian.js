import {MAGIC_ALIGNMENT, MAGIC_TYPE} from "../../../enums";
import {MagicSpriteSheet} from "../../../loader";
import {CrystalWind} from "./crystal_wind";
import {AnimatedTileElement} from "../../tile_elements/animated_tile_element";
import {Game} from "../../../game";
import {runDestroyAnimation} from "../../../animations";

export class CrystalGuardian extends CrystalWind {
    constructor() {
        super();
        this.texture = MagicSpriteSheet["magic_crystal_guardian.png"];
        this.type = MAGIC_TYPE.CRYSTAL_GUARDIAN;
        this.alignment = MAGIC_ALIGNMENT.WHITE;
        this.uses = this.maxUses = 7;
        this.name = "Crystal Guardian";
        this.follower = null;
        this.description = "EDIT";
        this.calculateRarity();
    }

    onWear(wielder) {
        super.onWear(wielder);
        this.resurrectFollower(wielder);
    }

    onTakeOff(wielder) {
        super.onTakeOff(wielder);
        Game.world.removeChild(this.follower);
    }

    onMove(wielder, tileStepX, tileStepY) {
        this.follower.cancelAnimation();
        this.follower.slide(tileStepX, tileStepY);
    }

    onNextLevel(wielder) {
        super.onNextLevel(wielder);
        if (!wielder.dead) {
            this.resurrectFollower(wielder);
        }
    }

    onDeath(wielder) {
        super.onDeath(wielder);
        runDestroyAnimation(this.follower);
        Game.world.removeChild(this.follower);
    }

    onRevive(wielder) {
        super.onRevive(wielder);
        this.resurrectFollower();
    }

    resurrectFollower(wielder) {
        if (!this.follower) this.follower = new CrystalGuardianFollower(wielder.tilePosition.x, wielder.tilePosition.y);
        this.follower.tilePosition.set(wielder.tilePosition.x, wielder.tilePosition.y);
        this.follower.place();
        Game.world.addChild(this.follower);
    }
}

class CrystalGuardianFollower extends AnimatedTileElement {
    constructor(tilePosX, tilePosY) {
        super(MagicSpriteSheet["crystal_guardian_follower.png"], tilePosX, tilePosY);
        this.removeShadow();
        this.setScaleModifier(0.9);
        this.side = 1; // -1 if on left, 1 if on right
    }

    getTilePositionX() {
        return super.getTilePositionX() + Game.TILESIZE / 2.5 * this.side;
    }

    getTilePositionY() {
        return super.getTilePositionY() - Game.TILESIZE / 2.5;
    }

    slide(tileStepX, tileStepY, animationTime = this.SLIDE_ANIMATION_TIME) {
        const oldPos = {x: this.getTilePositionX(), y: this.getTilePositionY()};
        if (tileStepX !== 0) this.side = tileStepX * -1;
        this.tilePosition.x += tileStepX;
        this.tilePosition.y += tileStepY;
        const newPos = {x: this.getTilePositionX(), y: this.getTilePositionY()};
        let counter = 0;

        const animation = (delta) => {
            if (Game.paused) return;
            counter += delta;
            this.position.x = oldPos.x + (newPos.x - oldPos.x) * (counter / animationTime);
            this.position.y = oldPos.y + (newPos.y - oldPos.y) * (counter / animationTime);
            if (counter >= animationTime / 2) {
                this.correctZIndex();
            }
            if (counter >= animationTime) {
                Game.app.ticker.remove(animation);
                this.animation = null;
                this.place();
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }
}

CrystalGuardian.requiredMagic = CrystalWind;