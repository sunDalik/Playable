import {CommonSpriteSheet, InanimatesSpriteSheet} from "../../../loader";
import {Shrine} from "./shrine";
import {RerollPotion} from "../../equipment/bag/reroll_potion";
import {addKeys} from "../../../game_logic";
import {Game} from "../../../game";
import {createFadingText} from "../../../animations";
import {AnimatedTileElement} from "../../tile_elements/animated_tile_element";

export class ShrineOfDice extends Shrine {
    constructor(tilePositionX, tilePositionY, texture = InanimatesSpriteSheet["shrine_of_dice.png"]) {
        super(tilePositionX, tilePositionY, texture);
        this.name = "Shrine of Dice";
        this.description = "Pay 1 Key\nGet 1 Reroll Potion";
    }

    interact(player) {
        if (Game.keysAmount > 0) {
            addKeys(-1);
            this.throwKey(player);
            this.dropItemOnFreeTile(new RerollPotion());
            this.successfullyActivate();
            return false;
        } else {
            createFadingText("You have no keys", this.position.x, this.position.y);
        }
    }

    // copied from chest...
    throwKey(player){
        const keyElement = new AnimatedTileElement(CommonSpriteSheet["key.png"], player.tilePosition.x, player.tilePosition.y);
        keyElement.removeShadow();
        keyElement.setScaleModifier(0.7);
        const tileStepX = this.tilePosition.x - player.tilePosition.x;
        const tileStepY = this.tilePosition.y - player.tilePosition.y;
        if (tileStepX === -1) {
            keyElement.scale.x *= -1;
            keyElement.angle = 45;
        } else if (tileStepX === 1) {
            keyElement.angle = -45;
        } else if (tileStepY === 1) {
            keyElement.angle = 45;
        } else if (tileStepY === -1) {
            keyElement.angle = -135;
        }

        keyElement.zIndex = player.zIndex + 1;
        Game.world.addChild(keyElement);
        keyElement.step(tileStepX, tileStepY, null, () => Game.world.removeChild(keyElement));
    }
}