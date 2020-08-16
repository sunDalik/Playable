import {Game} from "../../game";
import {ACHIEVEMENT_ID, INANIMATE_TYPE, ROLE, TILE_TYPE} from "../../enums/enums";
import {createFadingText, runDestroyAnimation} from "../../animations";
import * as PIXI from "pixi.js";
import {getCardinalDirections} from "../../utils/map_utils";
import {getPlayerOnTile} from "../../map_checks";
import {TileElement} from "../tile_elements/tile_element";
import {InanimatesSpriteSheet} from "../../loader";
import {randomInt} from "../../utils/random_utils";
import {Necromancy} from "../equipment/magic/necromancy";
import {getRandomSpell} from "../../utils/pool_utils";
import {Grail} from "./grail";
import {clearWall} from "../../level_generation/standard_generation";
import {completeAchievement} from "../../achievements";

export class Obelisk extends TileElement {
    constructor(tilePositionX, tilePositionY, level) {
        super(InanimatesSpriteSheet["obelisk.png"], tilePositionX, tilePositionY);
        this.role = ROLE.INANIMATE;
        this.type = INANIMATE_TYPE.OBELISK;
        this.activated = false;
        this.working = true;
        this.destroyed = false;
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
        this.setScaleModifier(1.15);
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
                    if (!magicPool.some(magic => magic.id === randomSpell.id)) {
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
        const placeGrail = (grail, x, y) => {
            level[y][x].entity = grail;
            grail.tilePosition.set(x, y);
        };

        const clearPathToGrail = (grail, dirX) => {
            if ([TILE_TYPE.ENTRY, TILE_TYPE.NONE].includes(level[grail.tilePosition.y][grail.tilePosition.x + dirX].tileType)) {
                clearWall(grail.tilePosition.x + dirX, grail.tilePosition.y + 1);
            }
        };

        const clearPathToPoint = (x, y, dirX) => clearPathToGrail({tilePosition: {x: x, y: y}}, dirX);

        if (level[this.tilePosition.y - 1][this.tilePosition.x - 2].tileType === TILE_TYPE.WALL && level[this.tilePosition.y - 1][this.tilePosition.x + 2].tileType === TILE_TYPE.WALL) {
            // g g o g g
            placeGrail(this.grails[0], this.tilePosition.x - 1, this.tilePosition.y);
            placeGrail(this.grails[1], this.tilePosition.x + 1, this.tilePosition.y);
            placeGrail(this.grails[2], this.tilePosition.x - 2, this.tilePosition.y);
            placeGrail(this.grails[3], this.tilePosition.x + 2, this.tilePosition.y);
            clearPathToGrail(this.grails[2], -1);
            clearPathToGrail(this.grails[3], 1);
        } else {
            // o
            //g g
            //g g
            placeGrail(this.grails[0], this.tilePosition.x - 1, this.tilePosition.y + 1);
            placeGrail(this.grails[1], this.tilePosition.x + 1, this.tilePosition.y + 1);
            placeGrail(this.grails[2], this.tilePosition.x - 1, this.tilePosition.y + 2);
            placeGrail(this.grails[3], this.tilePosition.x + 1, this.tilePosition.y + 2);
            clearWall(this.tilePosition.x, this.tilePosition.y + 2);
            clearWall(this.tilePosition.x, this.tilePosition.y + 3);
            clearPathToPoint(this.tilePosition.x + 1, this.tilePosition.y, 1);
            clearPathToPoint(this.tilePosition.x - 1, this.tilePosition.y, -1);
            clearPathToGrail(this.grails[0], -1);
            clearPathToGrail(this.grails[1], 1);
            clearPathToGrail(this.grails[2], -1);
            clearPathToGrail(this.grails[3], 1);
        }
        for (const grail of this.grails) {
            grail.initGrail();
        }
        for (const object of this.grails.concat([this])) {
            for (const dir of [{x: 0, y: 0}, {x: 0, y: 1}]) {
                clearWall(object.tilePosition.x + dir.x, object.tilePosition.y + dir.y);
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
            createFadingText("Choose one", this.position.x, this.position.y);
            this.onUpdate();
        }
    }

    deactivate(grail) {
        if (this.working && this.activated) {
            this.working = false;
            this.texture = InanimatesSpriteSheet["obelisk_used.png"];
            this.grails.map(grail => grail.setMagic(null));
            createFadingText("Goodbye", this.position.x, this.position.y);
        } else if (this.destroyed) {
            grail.setMagic(null);
        }
    }

    donate(player) {
        if (this.working && this.activated) {
            if (this.timesDonated <= 0) {
                if (player.health > 1) {
                    player.voluntaryDamage(1);
                    this.timesDonated++;
                    this.grails[2].setMagic(this.magic[2]);
                    this.grails[3].setMagic(this.magic[3]);
                    createFadingText("Be blessed", this.position.x, this.position.y);
                } else {
                    createFadingText("Your offer is fictitious", this.position.x, this.position.y);
                }
            } else {
                createFadingText("Choose one", this.position.x, this.position.y);
            }
        }
    }

    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            this.visible = false;
            Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
            this.texture = InanimatesSpriteSheet["obelisk_used.png"];
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
                if (enemy.dead && !enemy.boss) {
                    enemy.revive();
                    enemy.setStun(2);
                } else enemy.atk += 0.25;
            }
            completeAchievement(ACHIEVEMENT_ID.DESTROY_OBELISK);
            //createFadingText("Live with it... you will not...", this.position.x, this.position.y);
        }
        this.onUpdate();
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
        this.icon.visible = this.working && this.activated && this.timesDonated <= 0 && playerFound;
    }
}