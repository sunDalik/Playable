import {INANIMATE_TYPE} from "../../enums/enums";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {InanimatesSpriteSheet} from "../../loader";
import {ItemInanimate} from "./item_inanimate";

export class Pedestal extends ItemInanimate {
    constructor(tilePositionX, tilePositionY, contents) {
        super(InanimatesSpriteSheet["pedestal.png"], tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.type = INANIMATE_TYPE.PEDESTAL;
        this.createItemSprite(contents, this.height * 0.8);
        this.createTextLabel(contents, this.height * 1.6);
        this.initAnimations();
        this.showItem(contents);
        this.tallModifier = -7;
        this.place()
    }

    interact(player) {
        if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
        else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        if (this.contents) this.showItem(this.contents);
        else this.hideItem();
    }
}