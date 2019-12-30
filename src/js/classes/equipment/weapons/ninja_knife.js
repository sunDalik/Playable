import {Game} from "../../../game"
import * as PIXI from "pixi.js"
import {EQUIPMENT_TYPE, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerWeaponAnimation} from "../../../animations";

export class NinjaKnife {
    constructor() {
        this.texture = Game.resources["src/images/weapons/ninja_knife.png"].texture;
        this.type = WEAPON_TYPE.NINJA_KNIFE;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.SLIDE_ANIMATION_TIME = 4;
        this.FINISH_SLIDE_TIME = 2;
        this.atk = 1.25; //maybe I should actually lower it?
        this.name = "Ninja Knife";
        this.description = "Kill with style";
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        const atk = wielder.getAtkWithWeapon(this);
        if (isEnemy(attackTileX, attackTileY)) {
            if (isRelativelyEmpty(wielder.tilePosition.x + tileDirX * 2, wielder.tilePosition.y + tileDirY * 2)) {
                createNinjaKnifeAnimation(this);
                wielder.slide(tileDirX * 2, tileDirY * 2, null, null, this.SLIDE_ANIMATION_TIME);
                if (Game.map[attackTileY][attackTileX].entity) Game.map[attackTileY][attackTileX].entity.stun = 1;
            } else {
                createPlayerWeaponAnimation(wielder, attackTileX, attackTileY);
            }
            Game.map[attackTileY][attackTileX].entity.damage(wielder, atk, tileDirX, tileDirY, false);
            return true;
        } else return false;

        function createNinjaKnifeAnimation(context) {
            let attackParticle = new PIXI.Sprite(PIXI.Texture.WHITE);
            attackParticle.width = Game.TILESIZE / 3;
            attackParticle.height = Game.TILESIZE / 3;
            let newAnchor;
            if (tileDirX > 0) {
                attackParticle.anchor.set(0, 0.5);
                newAnchor = {x: 1, y: 0.5};
            } else if (tileDirX < 0) {
                attackParticle.anchor.set(1, 0.5);
                newAnchor = {x: 0, y: 0.5};
            } else if (tileDirY > 0) {
                attackParticle.anchor.set(0.5, 0);
                newAnchor = {x: 0.5, y: 1};
            } else if (tileDirY < 0) {
                attackParticle.anchor.set(0.5, 1);
                newAnchor = {x: 0.5, y: 0};
            }
            const playerPositionXOld = wielder.tilePosition.x * Game.TILESIZE;
            const playerPositionYOld = wielder.tilePosition.y * Game.TILESIZE;
            centerAttackParticleToOldPlayer();
            Game.world.addChild(attackParticle);
            const stepX = Math.abs(tileDirX * 2) * Game.TILESIZE / (context.SLIDE_ANIMATION_TIME);
            const stepY = Math.abs(tileDirY * 2) * Game.TILESIZE / (context.SLIDE_ANIMATION_TIME);
            const stepXFinish = Math.abs(tileDirX * 2) * Game.TILESIZE / (context.FINISH_SLIDE_TIME);
            const stepYFinish = Math.abs(tileDirY * 2) * Game.TILESIZE / (context.FINISH_SLIDE_TIME);
            if (stepX === 0) attackParticle.height = 0;
            if (stepY === 0) attackParticle.width = 0;

            let counter = 0;
            const animation = (delta) => {
                if (counter < context.SLIDE_ANIMATION_TIME) {
                    attackParticle.width += stepX * delta;
                    attackParticle.height += stepY * delta;
                    centerAttackParticleToOldPlayer()
                } else if (counter < context.SLIDE_ANIMATION_TIME + context.FINISH_SLIDE_TIME) {
                    attackParticle.width -= stepXFinish * delta;
                    attackParticle.height -= stepYFinish * delta;
                    attackParticle.anchor.set(newAnchor.x, newAnchor.y);
                    centerAttackParticleToNewPlayer()
                }
                counter += delta;
                if (counter >= context.SLIDE_ANIMATION_TIME + context.FINISH_SLIDE_TIME) {
                    Game.world.removeChild(attackParticle);
                    Game.app.ticker.remove(animation);
                }
            };
            Game.app.ticker.add(animation);

            function centerAttackParticleToOldPlayer() {
                attackParticle.position.x = playerPositionXOld + (Game.TILESIZE - wielder.width) / 2 + wielder.width / 2;
                attackParticle.position.y = playerPositionYOld + (Game.TILESIZE - wielder.height) / 2 + wielder.height / 2;
            }

            function centerAttackParticleToNewPlayer() {
                attackParticle.position.x = wielder.tilePosition.x * Game.TILESIZE + (Game.TILESIZE - wielder.width) / 2 + wielder.width / 2;
                attackParticle.position.y = wielder.tilePosition.y * Game.TILESIZE + (Game.TILESIZE - wielder.height) / 2 + wielder.height / 2;
            }
        }
    }
}