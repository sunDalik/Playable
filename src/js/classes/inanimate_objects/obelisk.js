import {Game} from "../../game";
import {INANIMATE_TYPE, ROLE, TILE_TYPE} from "../../enums";
import {createFadingText, longShakeScreen, runDestroyAnimation} from "../../animations";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {TileElement} from "../tile_elements/tile_element";
import {InanimatesSpriteSheet} from "../../loader";
import {randomInt} from "../../utils/random_utils";
import {Necromancy} from "../equipment/magic/necromancy";
import {getRandomSpell} from "../../utils/pool_utils";
import {Grail} from "./grail";

export class Obelisk extends TileElement {
    constructor(tilePositionX, tilePositionY, level) {
        super(InanimatesSpriteSheet["obelisk.png"], tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.OBELISK;
        this.activated = false;
        this.working = true;
        this.destroyed = false;
        this.timesDamaged = 0;
        this.timesDonated = 0;
        this.generateGrails(level);
        Game.obelisks.push(this);
        this.icon = new PIXI.Sprite(Game.resources["src/images/icons/obelisk_sacrifice.png"].texture);
        Game.world.addChild(this.icon);
        this.icon.visible = false;
        this.icon.zIndex = this.zIndex + 1;
        this.icon.width = this.icon.height = 25;
        this.icon.anchor.set(0.5, 0.5);
        this.icon.position.x = this.position.x;
        this.icon.position.y = this.position.y - this.height / 2 - this.icon.height / 2;

        this.tallModifier = -10;
    }

    generateMagic() {
        let necromancyIndex = -1;
        let alivePlayer = null;
        if (Game.player.dead) alivePlayer = Game.player2;
        else if (Game.player2.dead) alivePlayer = Game.player;
        if (alivePlayer !== null) {
            if (alivePlayer.health >= 3.5) necromancyIndex = randomInt(0, 3);
            else if (alivePlayer.health >= 2.5) necromancyIndex = randomInt(0, 2);
            else necromancyIndex = randomInt(0, 1);
        }

        const magicPool = [];
        for (let i = 0; i < 4; ++i) {
            if (i === necromancyIndex) {
                magicPool[i] = new Necromancy();
            } else {
                let attempt = 0;
                while (attempt++ < 200) {
                    const randomSpell = getRandomSpell();
                    if (!magicPool.some(magic => magic.type === randomSpell.type)) {
                        magicPool[i] = randomSpell;
                        break;
                    }
                }
                if (attempt >= 200) magicPool[i] = new Necromancy();
            }
        }
        this.magic = magicPool;
    }

    generateGrails(level) {
        this.grails = [];
        for (let i = 0; i < 4; i++) {
            this.grails[i] = new Grail(0, 0, this);
        }
        if (level[this.tilePosition.y - 1][this.tilePosition.x - 2].tileType === TILE_TYPE.WALL && level[this.tilePosition.y - 1][this.tilePosition.x + 2].tileType === TILE_TYPE.WALL) {
            level[this.tilePosition.y][this.tilePosition.x - 1].entity = this.grails[0];
            this.grails[0].tilePosition.set(this.tilePosition.x - 1, this.tilePosition.y);
            level[this.tilePosition.y][this.tilePosition.x + 1].entity = this.grails[1];
            this.grails[1].tilePosition.set(this.tilePosition.x + 1, this.tilePosition.y);
            level[this.tilePosition.y][this.tilePosition.x - 2].entity = this.grails[2];
            this.grails[2].tilePosition.set(this.tilePosition.x - 2, this.tilePosition.y);
            level[this.tilePosition.y][this.tilePosition.x + 2].entity = this.grails[3];
            this.grails[3].tilePosition.set(this.tilePosition.x + 2, this.tilePosition.y);
        } else {
            level[this.tilePosition.y + 1][this.tilePosition.x - 1].entity = this.grails[0];
            this.grails[0].tilePosition.set(this.tilePosition.x - 1, this.tilePosition.y + 1);
            level[this.tilePosition.y + 1][this.tilePosition.x + 1].entity = this.grails[1];
            this.grails[1].tilePosition.set(this.tilePosition.x + 1, this.tilePosition.y + 1);
            level[this.tilePosition.y + 2][this.tilePosition.x - 1].entity = this.grails[2];
            this.grails[2].tilePosition.set(this.tilePosition.x - 1, this.tilePosition.y + 2);
            level[this.tilePosition.y + 2][this.tilePosition.x + 1].entity = this.grails[3];
            this.grails[3].tilePosition.set(this.tilePosition.x + 1, this.tilePosition.y + 2);
        }
        for (const grail of this.grails) {
            grail.placeGrail();
        }
        const clearDirs = [{x: 0, y: 0}, {x: -1, y: 0}, {x: +1, y: 0}, {x: -1, y: +1}, {x: +1, y: +1}, {x: 0, y: +1}];
        for (const grail of this.grails) {
            for (const dir of clearDirs) {
                level[grail.tilePosition.y + dir.y][grail.tilePosition.x + dir.x].tileType = TILE_TYPE.NONE;
                level[grail.tilePosition.y + dir.y][grail.tilePosition.x + dir.x].tile = null;
            }
        }
    }

    interact(player) {
        if (this.working) {
            if (!this.activated) this.activate();
            else this.donate(player);
        }
    }

    activate() {
        if (!this.activated && this.working) {
            this.generateMagic();
            this.grails[0].setMagic(this.magic[0]);
            this.grails[1].setMagic(this.magic[1]);
            this.activated = true;
            createFadingText("Choose one...", this.position.x, this.position.y);
            longShakeScreen();
            this.onUpdate();
        }
    }

    deactivate(grail) {
        if (this.working && this.activated) {
            this.working = false;
            if (this.timesDamaged > 0) this.texture = InanimatesSpriteSheet["obelisk_used_damaged.png"];
            else this.texture = InanimatesSpriteSheet["obelisk_used.png"];
            this.grails.map(grail => grail.setMagic(null));
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
                    player.voluntaryDamage(1);
                    this.timesDonated++;
                    if (this.timesDonated === 1) this.grails[2].setMagic(this.magic[2]);
                    else this.grails[3].setMagic(this.magic[3]);
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
        if (!this.destroyed) {
            this.destroyed = true;
            this.visible = false;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
            this.texture = InanimatesSpriteSheet["obelisk_used_damaged.png"];
            runDestroyAnimation(this);
        }
        if (this.working) {
            this.working = false;
            this.generateMagic();
            this.grails[0].setMagic(this.magic[0]);
            this.grails[1].setMagic(this.magic[1]);
            this.grails[2].setMagic(null);
            this.grails[3].setMagic(null);
            for (const enemy of Game.enemies) {
                if (enemy.dead) {
                    enemy.revive();
                    enemy.stun = 2;
                } else enemy.atk += 0.25;
            }
            //createFadingText("Live with it... you will not...", this.position.x, this.position.y);
            longShakeScreen();
        }
        this.onUpdate();
    }

    damage() {
        if (this.working) {
            if (this.timesDamaged >= 1) this.destroy();
            else {
                this.timesDamaged++;
                this.texture = InanimatesSpriteSheet["obelisk_damaged.png"];
                createFadingText("Don't", this.position.x, this.position.y);
                longShakeScreen();
            }
        }
    }

    onUpdate() {
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