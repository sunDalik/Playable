import {Game} from "../../game"
import {EQUIPMENT_TYPE, INANIMATE_TYPE, ROLE} from "../../enums";
import {createFadingText} from "../../animations";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {InanimatesSpriteSheet} from "../../loader";
import {getZIndexForLayer, Z_INDEXES} from "../../z_indexing";
import {TileElement} from "../tile_elements/tile_element";

export class Statue extends TileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(InanimatesSpriteSheet["statue.png"], tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
        this.marauded = false;
        this.textObj = new PIXI.Text("", getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.height / 4);
        this.textObj.visible = false;
        this.textObj.zIndex = getZIndexForLayer(this.tilePosition.y) + Z_INDEXES.META;
        Game.world.addChild(this.textObj);
        //this.updateTexture();
        this.correctZIndex();
    }

    updateTexture() {
        if (this.weapon) {
            this.textObj.text = this.weapon.name;
            this.textObj.style.fill = this.weapon.rarity.color;
        } else this.textObj.text = "";
    }

    interact(player) {
        if (!this.marauded) this.maraud();
        if (this.weapon === null) this.weapon = removeEquipmentFromPlayer(player, EQUIPMENT_TYPE.WEAPON);
        else this.weapon = swapEquipmentWithPlayer(player, this.weapon);
        this.updateTexture();
    }

    maraud() {
        this.marauded = true;
        createFadingText("Marauder!", this.position.x, this.position.y);
        //longShakeScreen();
        Game.maraudedStatues.push(this.weapon);
    }

    onUpdate() {
        this.textObj.visible = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                this.textObj.visible = true;
                break;
            }
        }
    }
}