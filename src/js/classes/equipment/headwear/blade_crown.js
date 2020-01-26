import {Game} from "../../../game"
import {EQUIPMENT_TYPE, HEAD_TYPE, RARITY} from "../../../enums";
import {TileElement} from "../../tile_elements/tile_element";
import {randomChoice} from "../../../utils/random_utils";
import {get8Directions} from "../../../utils/map_utils";
import {isEnemy} from "../../../map_checks";
import {createPlayerAttackTile} from "../../../animations";

export class BladeCrown {
    constructor() {
        this.texture = Game.resources["src/images/headwear/blade_crown.png"].texture;
        this.type = HEAD_TYPE.BLADE_CROWN;
        this.equipmentType = EQUIPMENT_TYPE.HEAD;
        this.nonremoveable = true;
        this.bladeAtk = 1;
        this.name = "Blade Crown";
        this.description = "You can't take it off...";
        this.rarity = RARITY.S;
    }

    afterAttack(wielder, dirX, dirY) {
        const enemiesToAttack = [];
        for (const dir of get8Directions()) {
            const atkTile = {x: wielder.tilePosition.x + dir.x, y: wielder.tilePosition.y + dir.y};
            if (isEnemy(atkTile.x, atkTile.y)) {
                enemiesToAttack.push(Game.map[atkTile.y][atkTile.x].entity);
            }
            createPlayerAttackTile(atkTile, 12, 0.5, 0xa67bbe);
        }
        for (const enemy of enemiesToAttack) {
            enemy.damage(wielder, this.bladeAtk, dirX, dirY, true, false)
        }

        const bladeSprite = new TileElement(Game.resources["src/images/headwear/blade_crown_blade.png"].texture, wielder.tilePosition.x, wielder.tilePosition.y);
        Game.world.addChild(bladeSprite);
        wielder.animationSubSprites.push(bladeSprite);
        bladeSprite.zIndex = Game.primaryPlayer.zIndex + 1;
        bladeSprite.scaleModifier = 1.3;
        bladeSprite.fitToTile();
        bladeSprite.anchor.set(0.5, 1.3);
        bladeSprite.position.x = wielder.position.x;
        bladeSprite.position.y = wielder.position.y;

        //if blade is looking to the right
        const flyDir = randomChoice([-1, 1]);
        const baseAngle = 0;
        if (-dirX === 1) bladeSprite.angle = baseAngle + 90;
        else if (-dirX === -1) bladeSprite.angle = baseAngle - 90;
        else if (-dirY === 1) bladeSprite.angle = baseAngle + 180;
        else if (-dirY === -1) bladeSprite.angle = baseAngle;

        //the blade points to the right
        if (flyDir === -1) bladeSprite.scale.x *= -1;

        const endChange = 360 * flyDir;
        const animationTime = 15;
        const startStayTime = 1;
        const endStayTime = 1;
        const startVal = bladeSprite.angle;
        let counter = 0;

        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter >= startStayTime && counter < animationTime + startStayTime) {
                bladeSprite.angle = startVal + endChange * (counter - startStayTime) / animationTime;
            }
            if (counter >= startStayTime + animationTime + endStayTime) {
                Game.app.ticker.remove(animation);
                Game.world.removeChild(bladeSprite);
            }
        };
        wielder.animation = animation;
        Game.app.ticker.add(animation);
    }
}