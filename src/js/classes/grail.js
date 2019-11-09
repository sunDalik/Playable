class Grail extends FullTileElement {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(Game.resources["src/images/other/grail.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
        //just some default texture
        this.magicSprite = new TileElement(Game.resources["src/images/magic/aura.png"].texture, 0, 0);
        this.magicSprite.visible = false;
        this.magicSprite.zIndex = 2;
        Game.world.addChild(this.magicSprite);
        Game.tiles.push(this.magicSprite);
        createFloatingItemAnimation(this.magicSprite);
    }

    placeGrail() {
        this.place();
        this.magicSprite.tilePosition.set(this.tilePosition.x, this.tilePosition.y - 0.3);
        this.magicSprite.place();
    }

    setMagic(magic) {
        this.magic = magic;
        if (this.magic) {
            switch (this.magic.alignment) {
                case MAGIC_ALIGNMENT.WHITE:
                    this.texture = Game.resources["src/images/other/grail_white.png"].texture;
                    break;
                case MAGIC_ALIGNMENT.DARK:
                    this.texture = Game.resources["src/images/other/grail_dark.png"].texture;
                    break;
                case MAGIC_ALIGNMENT.GRAY:
                    this.texture = Game.resources["src/images/other/grail_gray.png"].texture;
                    break;
            }
            this.magicSprite.texture = this.magic.texture;
            this.magicSprite.visible = true;
        } else {
            this.magicSprite.visible = false;
            this.texture = Game.resources["src/images/other/grail.png"].texture;
        }
    }

    choose(player) {
        if (this.magic &&
            ((this.magic.alignment === MAGIC_ALIGNMENT.WHITE && player === Game.player)
                || (this.magic.alignment === MAGIC_ALIGNMENT.DARK && player === Game.player2)
                || this.magic.alignment === MAGIC_ALIGNMENT.GRAY)
            && (player.magic4 === null || player.magic3 === null || player.magic2 === null || player.magic1 === null)) { //not sure about the last part yet. What to do when the player has no free magic slots?...
            player.giveNewMagic(this.magic);
            this.obelisk.deactivate();
        }
    }
}