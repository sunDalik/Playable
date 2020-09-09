import {ENEMY_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {ScorpionQueenSpriteSheet} from "../../../loader";
import {Game} from "../../../game";

// tilePosition refers to rightmost tile
export class ScorpionQueen extends Boss {
    constructor(tilePositionX, tilePositionY, texture = ScorpionQueenSpriteSheet["scorpion_queen_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 15;
        this.type = ENEMY_TYPE.SCORPION_QUEEN;
        this.atk = 1;
        this.name = "Scorpion Queen";

        this.startNoActionCounter = 4;
        this.waitingToMove = false;
        this.setScaleModifier(2.2);

        this.shadowHeight = 12;
        this.shadowInside = true;
        this.regenerateShadow();
    }

    afterMapGen() {
        this.placeOnMap();
    }

    getTilePositionX() {
        return super.getTilePositionX() - Game.TILESIZE / 2;
    }

    placeOnMap() {
        super.placeOnMap();
        this.tilePosition.x--;
        super.placeOnMap();
        this.tilePosition.x++;
    }

    removeFromMap() {
        super.removeFromMap();
        this.tilePosition.x--;
        super.removeFromMap();
        this.tilePosition.x++;
    }


    move() {

    }
}