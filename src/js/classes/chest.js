"use strict";

class Chest extends FullTileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/other/chest.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.contentsSprite = new FullTileElement(this.contents.texture, this.tilePosition.x, this.tilePosition.y - 0.5);
        this.contentsSprite.visible = false;
        this.contentsSprite.zIndex = 2;
        Game.world.addChild(this.contentsSprite);
        Game.tiles.push(this.contentsSprite);
        this.animateContents();
    }

    interact(player) {
        this.texture = Game.resources["src/images/other/chest_opened.png"].texture;
        if (this.opened) {
            if (this.contents) this.contents = swapEquipmentWithPlayer(player, this.contents);
            else this.contents = removeEquipmentFromPlayer(player, this.contentsType);
        }
        if (this.contents) {
            this.contentsSprite.texture = this.contents.texture;
            this.contentsSprite.visible = true;
        } else this.contentsSprite.visible = false;
        this.opened = true;
    }

    animateContents() {
        let counter = 0;
        const step = this.contentsSprite.height / 4 / Game.ITEM_FLOAT_ANIMATION_TIME;
        Game.APP.ticker.add(() => {
            if (counter < Game.ITEM_FLOAT_ANIMATION_TIME / 4) {
                this.contentsSprite.position.y -= step;
            } else if (counter < Game.ITEM_FLOAT_ANIMATION_TIME * 3 / 4) {
                this.contentsSprite.position.y += step;
            } else if (counter < Game.ITEM_FLOAT_ANIMATION_TIME) {
                this.contentsSprite.position.y -= step;
            }
            counter++;
            if (counter >= Game.ITEM_FLOAT_ANIMATION_TIME) {
                counter = 0;
            }
        })
    }
}