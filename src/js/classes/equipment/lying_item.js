import {Game} from "../../game"
import {createFloatingItemAnimation} from "../../animations";
import {TileElement} from "../tile_elements/tile_element";
import {swapEquipmentWithPlayer} from "../../game_logic";
import {removeObjectFromArray} from "../../utils/basic_utils";
import * as PIXI from "pixi.js";
import {HUDTextStyle} from "../../drawing/draw_constants";

export class LyingItem extends TileElement {
    constructor(tilePositionX, tilePositionY, item) {
        super(item.texture, tilePositionX, tilePositionY);
        this.item = item;
        this.width = Game.TILESIZE * 0.9;
        this.height = Game.TILESIZE * 0.9;
        this.addAmountNumber();
        this.place();
        this.animation = createFloatingItemAnimation(this);
    }

    place() {
        super.place();
        this.position.y -= Game.TILESIZE / 5;
    }

    pickUp(player) {
        this.item = swapEquipmentWithPlayer(player, this.item);
        if (this.item === null) {
            Game.world.removeChild(this);
            Game.map[this.tilePosition.y][this.tilePosition.x].item = null;
            Game.app.ticker.remove(this.animation);
            removeObjectFromArray(this.animation, Game.infiniteAnimations);
        } else {
            this.texture = this.item.texture;
            this.width = Game.TILESIZE * 0.9;
            this.height = Game.TILESIZE * 0.9;
            this.addAmountNumber();
        }
    }

    addAmountNumber() {
        if (this.item.amount && this.item.amount > 1) {
            const container = new PIXI.Container();
            const text = new PIXI.Text("x" + this.item.amount, Object.assign({}, HUDTextStyle, {
                fontSize: HUDTextStyle.fontSize / this.scale.x,
                strokeThickness: HUDTextStyle.strokeThickness / this.scale.x
            }));
            const sprite = new PIXI.Sprite(this.item.texture);
            container.addChild(sprite);
            container.addChild(text);
            text.position.set(sprite.width - text.width, 0);
            this.texture = Game.app.renderer.generateTexture(container);
        }
    }
}