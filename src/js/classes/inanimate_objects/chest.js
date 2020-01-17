import {Game} from "../../game"
import {INANIMATE_TYPE, ROLE} from "../../enums";
import {createFloatingItemAnimation} from "../../animations";
import {removeEquipmentFromPlayer, swapEquipmentWithPlayer} from "../../game_logic";
import {TileElement} from "../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {HUDTextStyle} from "../../drawing/draw_constants";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";

export class Chest extends TileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/other/chest.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.contentsSprite = new TileElement(this.contents.texture, this.tilePosition.x, this.tilePosition.y - 0.5);
        this.contentsSprite.width = Game.TILESIZE * 0.9;
        this.contentsSprite.height = Game.TILESIZE * 0.9;
        this.contentsSprite.scaleModifier = 0.8;
        this.contentsSprite.fitToTile();
        this.contentsSprite.visible = false;
        this.contentsSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        Game.world.addChild(this.contentsSprite);

        this.textObj = new PIXI.Text(this.contents.name, Object.assign({}, HUDTextStyle, {fontSize: Game.TILESIZE / 3.2}));
        this.textObj.anchor.set(0.5, 0.5);
        this.textObj.position.set(this.position.x, this.position.y - this.height * 5 / 4);
        this.textObj.visible = false;
        this.textObj.zIndex = 99;
        Game.world.addChild(this.textObj);
    }

    interact(player) {
        this.texture = Game.resources["src/images/other/chest_opened.png"].texture;
        if (this.opened) {
            if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
            else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        } else {
            this.opened = true;
            this.animation = createFloatingItemAnimation(this.contentsSprite);
        }
        if (this.contents) {
            Game.app.ticker.remove(this.contentsSprite.animation); //wait... Does it actually work like that??? I think remove is redundant here...
            Game.app.ticker.add(this.contentsSprite.animation);
            this.textObj.text = this.contents.name;
            this.contentsSprite.texture = this.contents.texture;
            this.contentsSprite.width = Game.TILESIZE * 0.9;
            this.contentsSprite.height = Game.TILESIZE * 0.9;
            this.contentsSprite.visible = true;
        } else {
            Game.app.ticker.remove(this.contentsSprite.animation);
            this.textObj.text = "";
            this.contentsSprite.visible = false;
        }
    }

    onUpdate() {
        this.textObj.visible = false;
        if (this.opened) {
            for (const dir of getCardinalDirections()) {
                if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                    this.textObj.visible = true;
                    break;
                }
            }
        }
    }
}