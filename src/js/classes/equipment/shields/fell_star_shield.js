import {Game} from "../../../game";
import {DAMAGE_TYPE, EQUIPMENT_ID, RARITY, STAGE} from "../../../enums";
import {isAnyWall, isEnemy} from "../../../map_checks";
import {TileElement} from "../../tile_elements/tile_element";
import * as PIXI from "pixi.js";
import {createFadingAttack} from "../../../animations";
import {ShieldsSpriteSheet} from "../../../loader";
import {getCardinalDirections} from "../../../utils/map_utils";
import {AbstractShield} from "./abstract_shield";

export class FellStarShield extends AbstractShield {
    constructor() {
        super();
        this.texture = ShieldsSpriteSheet["fell_star_shield.png"];
        this.id = EQUIPMENT_ID.FELL_STAR_SHIELD;
        this.uses = this.maxUses = 4;
        this.shieldAtk = 3;
        this.usedOnThisTurn = false;
        this.name = "The Fell Star Shield";
        this.description = "Automatically blocks incoming attacks\nRadiates beams on block";
        this.rarity = RARITY.A;
    }

    onBlock(source, wielder, directHit) {
        if (!this.usedOnThisTurn) {
            this.usedOnThisTurn = true;
            for (const dir of getCardinalDirections()) {
                this.radiate(wielder, dir);
            }
        }
    }

    radiate(wielder, direction) {
        let colorCounter = 0;
        for (let x = wielder.tilePosition.x + direction.x, y = wielder.tilePosition.y + direction.y; ; x += direction.x, y += direction.y) {
            if (isAnyWall(x, y)) break;
            const attackSprite = new TileElement(PIXI.Texture.WHITE, x, y, true);
            attackSprite.setOwnZIndex(2);
            if (colorCounter % 3 === 0) attackSprite.tint = 0xe4e647;
            else if (colorCounter % 3 === 1) attackSprite.tint = 0x44c6c4;
            if (colorCounter % 3 === 2) attackSprite.tint = 0x51bc7a;
            colorCounter++;
            if (Game.stage === STAGE.DARK_TUNNEL) attackSprite.maskLayer = {};
            createFadingAttack(attackSprite);
            if (isEnemy(x, y)) {
                Game.map[y][x].entity.damage(wielder, this.shieldAtk, 0, 0, DAMAGE_TYPE.MAGICAL);
            }
        }
    }

    onNewTurn() {
        this.usedOnThisTurn = false;
    }
}