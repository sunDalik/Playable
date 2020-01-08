import {Game} from "../../game"
import {FullTileElement} from "../tile_elements/full_tile_element";
import {INANIMATE_TYPE, ROLE} from "../../enums";
import {Grail} from "./grail";
import {createFadingText, longShakeScreen} from "../../animations";
import {redrawHealthForPlayer} from "../../drawing/draw_hud";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";

export class Obelisk extends FullTileElement {
    constructor(tilePositionX, tilePositionY, magic, onDestroyMagic) {
        super(Game.resources["src/images/other/obelisk.png"].texture, tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.OBELISK;
        this.activated = false;
        this.working = true;
        this.destroyed = false;
        this.timesDamaged = 0;
        this.timesDonated = 0;
        this.magic1 = magic[0];
        this.magic2 = magic[1];
        this.magic3 = magic[2];
        this.magic4 = magic[3];
        this.onDestroyMagic = onDestroyMagic;
        this.grail1 = new Grail(0, 0, this);
        this.grail2 = new Grail(0, 0, this);
        this.grail3 = new Grail(0, 0, this);
        this.grail4 = new Grail(0, 0, this);

        this.icon = new PIXI.Sprite(Game.resources["src/images/icons/obelisk_sacrifice.png"].texture);
        Game.world.addChild(this.icon);
        this.icon.visible = false;
        this.icon.zIndex = Game.primaryPlayer.zIndex + 1;
        this.icon.width = this.icon.height = 25;
        this.icon.anchor.set(0.5, 0.5);
        this.icon.position.x = this.position.x;
        this.icon.position.y = this.position.y - this.height / 2 - this.icon.height / 2;
    }

    placeGrails() {
        for (const grail of [this.grail1, this.grail2, this.grail3, this.grail4]) {
            grail.placeGrail();
        }
    }

    activate() {
        if (!this.activated && this.working) {
            this.grail1.setMagic(this.magic1);
            this.grail2.setMagic(this.magic2);
            this.activated = true;
            createFadingText("Choose one...", this.position.x, this.position.y);
            longShakeScreen();
        }
    }

    deactivate(grail) {
        if (this.working && this.activated) {
            this.working = false;
            if (this.timesDamaged > 0) this.texture = Game.resources["src/images/other/obelisk_used_damaged.png"].texture;
            else this.texture = Game.resources["src/images/other/obelisk_used.png"].texture;
            this.grail1.setMagic(null);
            this.grail2.setMagic(null);
            this.grail3.setMagic(null);
            this.grail4.setMagic(null);
            createFadingText("Goodbye...", this.position.x, this.position.y);
            longShakeScreen();
        } else if (this.destroyed) {
            grail.setMagic(null);
        }
    }

    donate(player) {
        if (this.working && this.activated) {
            if (this.timesDonated < 2) {
                if (player.health > 1) {
                    player.health -= 1;
                    redrawHealthForPlayer(player);
                    this.timesDonated++;
                    if (this.timesDonated === 1) this.grail3.setMagic(this.magic3);
                    else this.grail4.setMagic(this.magic4);
                    createFadingText("Be blessed...", this.position.x, this.position.y);
                    longShakeScreen();
                } else {
                    createFadingText("Your offer is fictitious...", this.position.x, this.position.y);
                }
            } else {
                createFadingText("Choose one...", this.position.x, this.position.y);
            }
        }
    }

    destroy() {
        if (this.working) {
            this.working = false;
            this.destroyed = true;
            this.texture = Game.resources["src/images/other/obelisk_broken.png"].texture;
            this.grail1.setMagic(this.onDestroyMagic[0]);
            this.grail2.setMagic(this.onDestroyMagic[1]);
            this.grail3.setMagic(null);
            this.grail4.setMagic(null);
            for (const enemy of Game.enemies) {
                if (enemy.dead) {
                    if (Game.map[enemy.tilePosition.y][enemy.tilePosition.x].entity === null) {
                        enemy.revive();
                        enemy.stun = 2;
                    }
                } else enemy.atk += 0.25;
            }
            createFadingText("Live with it... you will not...", this.position.x, this.position.y);
            longShakeScreen();
        }
    }

    damage() {
        if (this.working) {
            if (this.timesDamaged >= 1) this.destroy();
            else {
                this.timesDamaged++;
                this.texture = Game.resources["src/images/other/obelisk_damaged.png"].texture;
                createFadingText("Don't", this.position.x, this.position.y);
                longShakeScreen();
            }
        }
    }

    onUpdate() {
        //todo: add -heart icon
        if (!this.working) {
            //no highlight
            this.filters = [];
        }
        let playerFound = false;
        for (const dir of getCardinalDirections()) {
            if (getPlayerOnTile(this.tilePosition.x + dir.x, this.tilePosition.y + dir.y) !== null) {
                playerFound = true;
                break;
            }
        }
        this.icon.visible = this.working && this.activated && this.timesDonated < 2 && playerFound;
    }
}