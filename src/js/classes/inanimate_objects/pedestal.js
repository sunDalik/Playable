import {Game} from "../../game"
import {INANIMATE_TYPE, ROLE} from "../../enums";
import {createFloatingItemAnimation} from "../../animations";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {TileElement} from "../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {getInanimateItemLabelTextStyle} from "../../drawing/draw_constants";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";

export class Pedestal extends TileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/other/pedestal.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.PEDESTAL;
        this.contentsSprite = new TileElement(this.contents.texture, this.tilePosition.x, this.tilePosition.y - 0.75);
        this.contentsSprite.width = Game.TILESIZE * 0.9;
        this.contentsSprite.height = Game.TILESIZE * 0.9;
        this.contentsSprite.scaleModifier = 0.8;
        this.contentsSprite.fitToTile();
        this.contentsSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        Game.world.addChild(this.contentsSprite);

        this.textObj = new PIXI.Text(this.contents.name, getInanimateItemLabelTextStyle());
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.visible = false;
        this.textObj.style.fill = this.contents.rarity.color;
        this.textObj.position.set(this.position.x, this.position.y - this.height * 1.5);
        this.textObj.zIndex = 99;
        Game.world.addChild(this.textObj);

        this.animation = createFloatingItemAnimation(this.contentsSprite);
        this.textObj.animation = createFloatingItemAnimation(this.textObj);
    }

    interact(player) {
        if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
        else this.contents = removeEquipmentFromPlayer(player, this.contentsType);


        Game.app.ticker.remove(this.animation);
        Game.app.ticker.remove(this.textObj.animation);
        if (this.contents) {
            Game.app.ticker.add(this.animation);
            Game.app.ticker.add(this.textObj.animation);
            this.textObj.text = this.contents.name;
            this.textObj.style.fill = this.contents.rarity.color;
            this.contentsSprite.texture = this.contents.texture;
            this.contentsSprite.width = Game.TILESIZE * 0.9;
            this.contentsSprite.height = Game.TILESIZE * 0.9;
            this.contentsSprite.visible = true;
            this.textObj.visible = true;
        } else {
            this.textObj.text = "";
            this.contentsSprite.visible = false;
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