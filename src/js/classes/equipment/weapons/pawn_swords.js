import {Game} from "../../../game"
import {EQUIPMENT_TYPE, RARITY, WEAPON_TYPE} from "../../../enums";
import {isEnemy, isLit} from "../../../map_checks";
import * as PIXI from "pixi.js";

export class PawnSwords {
    constructor() {
        this.texture = Game.resources["src/images/weapons/pawn_swords.png"].texture;
        this.type = WEAPON_TYPE.PAWN_SWORDS;
        this.equipmentType = EQUIPMENT_TYPE.WEAPON;
        this.atk = 1;
        this.name = "Pawn Swords";
        this.description = "Attack diagonally";
        this.rarity = RARITY.C;
    }

    attack(wielder, tileDirX, tileDirY) {
        let attackTiles = [];
        if (tileDirX !== 0)
            attackTiles = [{x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y + 1},
                {x: wielder.tilePosition.x + tileDirX, y: wielder.tilePosition.y - 1}];
        else if (tileDirY !== 0)
            attackTiles = [{x: wielder.tilePosition.x + 1, y: wielder.tilePosition.y + tileDirY},
                {x: wielder.tilePosition.x - 1, y: wielder.tilePosition.y + tileDirY}];

        const enemiesToAttack = [];
        for (const attackTile of attackTiles) {
            if (isEnemy(attackTile.x, attackTile.y) && isLit(attackTile.x, attackTile.y)) {
                enemiesToAttack.push(Game.map[attackTile.y][attackTile.x].entity);
            }
        }

        if (enemiesToAttack.length === 0) return false;
        this.createWeaponAnimation(wielder, tileDirX, tileDirY);

        const atk = wielder.getAtkWithWeapon(this);
        for (const enemy of enemiesToAttack) {
            enemy.damage(wielder, atk, tileDirX, tileDirY, false, false);
        }
        return true;
    }

    //stolen from maiden dagger
    createWeaponAnimation(player, tileDirX, tileDirY) {
        let attackSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        let attackSprite2 = new PIXI.Sprite(PIXI.Texture.WHITE);
        const px = player.tilePosition.x * Game.TILESIZE + (Game.TILESIZE - Game.player.width) / 2 + Game.player.width / 2;
        const py = player.tilePosition.y * Game.TILESIZE + (Game.TILESIZE - Game.player.height) / 2 + Game.player.height / 2;
        attackSprite.position.set(px, py);
        attackSprite2.position.set(px, py);
        player.animationSubSprites.push(attackSprite);
        player.animationSubSprites.push(attackSprite2);
        attackSprite.zIndex = attackSprite2.zIndex = Game.primaryPlayer.zIndex + 1;
        const size = Game.TILESIZE / 2.5;
        attackSprite.width = attackSprite.height = attackSprite2.width = attackSprite2.height = size;
        const angle = 45;
        if (tileDirX > 0) {
            attackSprite.anchor.set(0, 0.5);
            attackSprite2.anchor.set(0, 0.5);
            attackSprite.angle = -angle;
            attackSprite2.angle = angle;
        } else if (tileDirX < 0) {
            attackSprite.anchor.set(1, 0.5);
            attackSprite2.anchor.set(1, 0.5);
            attackSprite.angle = angle;
            attackSprite2.angle = -angle;
        } else if (tileDirY > 0) {
            attackSprite.anchor.set(0.5, 0);
            attackSprite2.anchor.set(0.5, 0);
            attackSprite.angle = angle;
            attackSprite2.angle = -angle;
        } else if (tileDirY < 0) {
            attackSprite.anchor.set(0.5, 1);
            attackSprite2.anchor.set(0.5, 1);
            attackSprite.angle = -angle;
            attackSprite2.angle = angle;
        }
        Game.world.addChild(attackSprite);
        Game.world.addChild(attackSprite2);

        const animationTime = Game.WEAPON_ATTACK_TIME + 1;
        const stepX = Math.abs(tileDirX) * Game.TILESIZE / (animationTime / 2);
        const stepY = Math.abs(tileDirY) * Game.TILESIZE / (animationTime / 2);
        if (stepX === 0) {
            attackSprite.height = 0;
            attackSprite2.height = 0;
        }
        if (stepY === 0) {
            attackSprite.width = 0;
            attackSprite2.width = 0;
        }

        let counter = 0;
        const animation = (delta) => {
            if (counter < animationTime / 2) {
                attackSprite.width += stepX * delta;
                attackSprite.height += stepY * delta;
                attackSprite2.width += stepX * delta;
                attackSprite2.height += stepY * delta;
            } else {
                attackSprite.width -= stepX * delta;
                attackSprite.height -= stepY * delta;
                attackSprite2.width -= stepX * delta;
                attackSprite2.height -= stepY * delta;
            }
            counter += delta;
            if (counter >= animationTime) {
                Game.world.removeChild(attackSprite);
                Game.world.removeChild(attackSprite2);
                Game.app.ticker.remove(animation);
            }
        };
        player.animation = animation;
        Game.app.ticker.add(animation);
    }
}