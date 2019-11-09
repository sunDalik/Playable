"use strict";

class Chest extends FullTileElement {
    constructor(tilePositionX, tilePositionY, contents) {
        super(Game.resources["src/images/other/chest.png"].texture, tilePositionX, tilePositionY);
        this.contents = contents;
        this.contentsType = contents.equipmentType;
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.CHEST;
        this.opened = false;
        this.contentsSprite = new PIXI.Sprite(this.contents.texture);
        this.contentsSprite.visible = false;
        this.contentsSprite.anchor.set(0.5, 0.5);
        this.contentsSprite.position.set(this.position.x, this.position.y - this.height / 2);
        this.contentsSprite.width = Game.TILESIZE;
        this.contentsSprite.height = Game.TILESIZE;
        this.contentsSprite.zIndex = 1;
        Game.world.addChild(this.contentsSprite);
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
}