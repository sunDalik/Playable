import {Game} from "../../../game";
import * as PIXI from "pixi.js";
import {EQUIPMENT_ID, RARITY} from "../../../enums/enums";
import {isEnemy, isRelativelyEmpty} from "../../../map_checks";
import {createPlayerAttackTile, createWeaponAnimationStab} from "../../../animations";
import {WeaponsSpriteSheet} from "../../../loader";
import {floorLevel} from "../../tile_elements/tile_element";
import {Weapon} from "../weapon";

export class AssassinDagger extends Weapon {
    constructor() {
        super();
        this.texture = WeaponsSpriteSheet["assassin_dagger.png"];
        this.id = EQUIPMENT_ID.ASSASSIN_DAGGER;
        this.SLIDE_ANIMATION_TIME = 5;
        this.FINISH_SLIDE_TIME = 2;
        this.atk = 1.5;
        this.name = "Assassin's Dagger";
        this.description = "Attack 1.5\nIf there is a space behind the target, teleports you behind it and gives it 1 stun";
        this.rarity = RARITY.S;
    }

    attack(wielder, tileDirX, tileDirY) {
        const attackTileX = wielder.tilePosition.x + tileDirX;
        const attackTileY = wielder.tilePosition.y + tileDirY;
        const atk = wielder.getAtk(this);
        if (isEnemy(attackTileX, attackTileY)) {
            if (isRelativelyEmpty(wielder.tilePosition.x + tileDirX * 2, wielder.tilePosition.y + tileDirY * 2)) {
                createAnimation(this);
                wielder.slide(tileDirX * 2, tileDirY * 2, null, null, this.SLIDE_ANIMATION_TIME);
                if (Game.map[attackTileY][attackTileX].entity) Game.map[attackTileY][attackTileX].entity.addStun(1);
            } else {
                createWeaponAnimationStab(wielder, this, tileDirX, tileDirY, 5, 1, 1);
                //createWeaponAnimationSwing(wielder, this, tileDirX, tileDirY, 4, 35, 1);
            }
            createPlayerAttackTile({x: attackTileX, y: attackTileY});
            this.damageEnemies([Game.map[attackTileY][attackTileX].entity], wielder, atk, tileDirX, tileDirY);
            return true;
        } else return false;

        //todo refactor
        function createAnimation(context) {
            let attackParticle = new PIXI.Sprite(PIXI.Texture.WHITE);
            attackParticle.width = attackParticle.height = Game.TILESIZE / 2.5;
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
            const playerPositionYOld = wielder.tilePosition.y * Game.TILESIZE - floorLevel;
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
                    centerAttackParticleToOldPlayer();
                } else if (counter < context.SLIDE_ANIMATION_TIME + context.FINISH_SLIDE_TIME) {
                    attackParticle.width -= stepXFinish * delta;
                    attackParticle.height -= stepYFinish * delta;
                    attackParticle.anchor.set(newAnchor.x, newAnchor.y);
                    centerAttackParticleToNewPlayer();
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