class Grail extends FullTileElement {
    constructor(tilePositionX, tilePositionY, obelisk) {
        super(Game.resources["src/images/other/grail.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.GRAIL;
        this.obelisk = obelisk;
        this.magic = null;
    }

    setMagic(magic) {
        this.magic = magic;
        //maybe you will at some point update it so this switch will not be necessary? so you just draw this.magic as a separate sprite?
        if (this.magic === null) this.texture = Game.resources["src/images/other/grail.png"].texture;
        else switch (this.magic.type) {
            case MAGIC_TYPE.AURA:
                this.texture = Game.resources["src/images/other/grail_aura.png"].texture;
                break;
            case MAGIC_TYPE.FIREBALL:
                this.texture = Game.resources["src/images/other/grail_fireball.png"].texture;
                break;
            case MAGIC_TYPE.PETRIFICATION:
                this.texture = Game.resources["src/images/other/grail_petrification.png"].texture;
                break;
            case MAGIC_TYPE.NECROMANCY:
                this.texture = Game.resources["src/images/other/grail_necromancy.png"].texture;
                break;
            case MAGIC_TYPE.TELEPORT:
                this.texture = Game.resources["src/images/other/grail_teleport.png"].texture;
                break;
            case MAGIC_TYPE.SPIKES:
                this.texture = Game.resources["src/images/other/grail_spikes.png"].texture;
                break;
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