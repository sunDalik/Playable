import {Game} from "../../game";
import * as PIXI from "pixi.js";
import {distance, otherPlayer, tileDistanceDiagonal} from "../../utils/game_utils";
import {CommonSpriteSheet} from "../../loader";

export class LimitChain extends PIXI.Container {
    constructor() {
        super();
        this.chainVisRadius = 3.5;
        //this.zIndex = otherPlayer(Game.primaryPlayer).zIndex + 1;
        this.zIndex = 11;
        this.visible = false;
        this.elements = [];
        this.elementSize = Game.TILESIZE;
    }

    update() {
        if (!Game.player.dead && !Game.player2.dead && Game.chainLength - tileDistanceDiagonal(Game.player, Game.player2) <= this.chainVisRadius) {
            const alpha = (this.chainVisRadius + 1 - (Game.chainLength - tileDistanceDiagonal(Game.player, Game.player2))) / this.chainVisRadius;
            let rotation = Math.atan((Game.player2.y - Game.player.y) / (Game.player2.x - Game.player.x)) + Math.PI / 2;
            if (Game.player2.x < Game.player.x) rotation += Math.PI;

            this.visible = true;
            //const distDiff = distance(Game.player, Game.player2) - Math.floor(distance(Game.player, Game.player2) / this.elementSize) * this.elementSize;
            for (let i = 0; i < distance(Game.player, Game.player2) / this.elementSize; i++) {
                //I do NOT understand why it works!
                const posX = Game.player.position.x + i * this.elementSize * Math.sin(rotation);
                const posY = Game.player.position.y - i * this.elementSize * Math.cos(rotation);
                this.updateElement(i, false, alpha, rotation, posX, posY);
                //if (i === 0 || i + 2 >= distance(Game.player, Game.player2) / this.elementSize) this.elements[i].zIndex = otherPlayer(Game.primaryPlayer).zIndex + 1;
                //else this.elements[i].zIndex = 11;

            }
            for (let i = Math.floor(distance(Game.player, Game.player2) / this.elementSize); i < this.elements.length; i++) {
                this.updateElement(i, true);
            }
        } else {
            this.visible = false;
        }
    }

    updateElement(index, hide, alpha, rot, posX, posY) {
        while (this.elements.length - 1 < index) {
            this.elements.push(new PIXI.Sprite(CommonSpriteSheet["limit_chain.png"]));
            const newElement = this.elements[this.elements.length - 1];
            newElement.anchor.set(0.5, 1);
            newElement.width = newElement.height = this.elementSize;
            this.addChild(newElement);
        }
        const el = this.elements[index];
        if (hide) el.visible = false;
        else {
            el.visible = true;
            el.position.x = posX;
            el.position.y = posY;
            el.alpha = alpha;
            el.rotation = rot;
        }
    }
}