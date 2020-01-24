import {Game} from "../../game"
import {TallTileElement} from "../tile_elements/tall_tile_element"
import {EQUIPMENT_TYPE, INANIMATE_TYPE, ROLE, WEAPON_TYPE} from "../../enums";
import {createFadingText, longShakeScreen} from "../../animations";
import {randomChoice} from "../../utils/random_utils";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";

export class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(Game.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
        this.marauded = false;
        this.textObj = new PIXI.Text("", getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.height / 4);
        this.textObj.visible = false;
        this.textObj.zIndex = 99;
        this.zIndex = Game.primaryPlayer.zIndex + 1;
        Game.world.addChild(this.textObj);
        this.updateTexture();
    }

    updateTexture() {
        if (this.weapon) {
            this.textObj.text = this.weapon.name;
            this.textObj.style.fill = this.weapon.rarity.color;
        } else this.textObj.text = "";
        if (this.weapon === null) this.texture = Game.resources["src/images/other/statue.png"].texture;
        else if (this.weapon.equipmentType === EQUIPMENT_TYPE.SHIELD) {
            this.texture = Game.resources["src/images/other/statue_shield.png"].texture;
        } else if (this.weapon.equipmentType === EQUIPMENT_TYPE.TOOL) {
            this.texture = Game.resources["src/images/other/statue_tool.png"].texture;
        } else switch (this.weapon.type) {
            case WEAPON_TYPE.KNIFE:
                this.texture = Game.resources["src/images/other/statue_knife.png"].texture;
                break;
            case WEAPON_TYPE.RAPIER:
                this.texture = Game.resources["src/images/other/statue_sword.png"].texture;
                break;
            case WEAPON_TYPE.NINJA_KNIFE:
                this.texture = Game.resources["src/images/other/statue_ninja_knife.png"].texture;
                break;
            case WEAPON_TYPE.BOW:
                this.texture = Game.resources["src/images/other/statue_bow.png"].texture;
                break;
            case WEAPON_TYPE.BOOK_OF_FLAMES:
                this.texture = Game.resources["src/images/other/statue_book_of_flames.png"].texture;
                break;
            case WEAPON_TYPE.SCYTHE:
                this.texture = Game.resources["src/images/other/statue_scythe.png"].texture;
                break;
            case WEAPON_TYPE.SPEAR:
                this.texture = Game.resources["src/images/other/statue_spear.png"].texture;
                break;
            case WEAPON_TYPE.MAIDEN_DAGGER:
                const option = randomChoice([1, 2]);
                if (option === 1) {
                    this.texture = Game.resources["src/images/other/statue_maiden_dagger.png"].texture;
                } else this.texture = Game.resources["src/images/other/statue_maiden_dagger_2.png"].texture;
                break;
            case WEAPON_TYPE.HAMMER:
                this.texture = Game.resources["src/images/other/statue_hammer.png"].texture;
                break;
            case WEAPON_TYPE.PICKAXE:
                this.texture = Game.resources["src/images/other/statue_tool.png"].texture;
                break;
            case WEAPON_TYPE.PAWN_SWORDS:
                this.texture = Game.resources["src/images/other/statue_pawn_swords.png"].texture;
                break;
            case WEAPON_TYPE.RUSTY_SWORD:
                this.texture = Game.resources["src/images/other/statue_rusty_sword.png"].texture;
                break;
        }
    }

    maraud() {
        if (!this.marauded) {
            createFadingText("Marauder!", this.position.x, this.position.y);
            longShakeScreen();
            this.marauded = true;
        }
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