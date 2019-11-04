"use strict";

class Statue extends TallTileElement {
    constructor(tilePositionX, tilePositionY, weapon) {
        super(Game.resources["src/images/other/statue.png"].texture, tilePositionX, tilePositionY);
        this.weapon = weapon;
        this.updateTexture();
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.STATUE;
        this.TEXT_ANIMATION_TIME = 80;
        this.marauded = false;
    }

    updateTexture() {
        if (this.weapon === null) this.texture = Game.resources["src/images/other/statue.png"].texture;
        else switch (this.weapon.type) {
            case WEAPON_TYPE.NONE:
                this.texture = Game.resources["src/images/other/statue.png"].texture;
                break;
            case WEAPON_TYPE.KNIFE:
                this.texture = Game.resources["src/images/other/statue_knife.png"].texture;
                break;
            case WEAPON_TYPE.SWORD:
                this.texture = Game.resources["src/images/other/statue_sword.png"].texture;
                break;
            case WEAPON_TYPE.NINJA_KNIFE:
                this.texture = Game.resources["src/images/other/statue_ninja_knife.png"].texture;
                break;
        }
    }

    maraud() {
        if (!this.marauded) {
            let counter = 0;
            let text = new PIXI.Text("Marauder!", {
                fontSize: Game.TILESIZE / 65 * 26,
                fill: 0xffffff,
                fontWeight: "bold"
            });
            text.position.set(this.position.x - text.width / 2, this.position.y - text.height * 1.5);
            text.zIndex = 99;
            Game.world.addChild(text);
            const stepY = Game.TILESIZE / 65 * 30 / this.TEXT_ANIMATION_TIME;
            const alphaStep = 1 / this.TEXT_ANIMATION_TIME;

            let animation = () => {
                text.position.y -= stepY;
                if (counter >= this.TEXT_ANIMATION_TIME / 2) {
                    text.alpha -= alphaStep;
                }
                counter++;
                if (counter >= this.TEXT_ANIMATION_TIME) {
                    Game.world.removeChild(text);
                    Game.APP.ticker.remove(animation);
                }
            };

            Game.APP.ticker.add(animation);
            this.marauded = true;
        }
    }
}