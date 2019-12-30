import {Game} from "../../../game"
import {ENEMY_TYPE, ROLE, STAGE} from "../../../enums";
import {Boss} from "./boss";

export class ParanoidEel extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/paranoid_eel/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 15;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.PARANOID_EEL;
        this.atk = 0.5;
        this.scaleModifier = 3.7;
        this.direction = {x: 1, y: 0};
        this.fitToTile();
    }

    afterMapGen() {
        Game.map[this.tilePosition.y][this.tilePosition.x].entity = null;
        this.placeOnMap();
    }

    move() {

    }

    fitToTile() {
        super.fitToTile();
    }

    place() {
        super.place();
    }

    placeOnMap() {
        super.placeOnMap();
        if (this.direction.x !== 0) {
            this.tilePosition.x++;
            super.placeOnMap();
            this.tilePosition.x -= 2;
            super.placeOnMap();
            this.tilePosition.x++;
        } else if (this.direction.y !== 0) {
            this.tilePosition.y++;
            super.placeOnMap();
            this.tilePosition.y -= 2;
            super.placeOnMap();
            this.tilePosition.y++;
        }
    }

    removeFromMap() {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity === this) {
                    Game.map[this.tilePosition.y + y][this.tilePosition.x + x].entity = null;
                }
            }
        }
    }
}