import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {randomChoice} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {getChasingDirections} from "../../../utils/map_utils";
import {closestPlayer} from "../../../utils/game_utils";

export class GuardianOfTheLight extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/guardian_of_the_light/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.GUARDIAN_OF_THE_LIGHT;
        this.atk = 1.5;
        this.name = "Guardian of the Light";


        this.test = 2;
    }

    move() {
        if (this.test < 0) {
            const attack = randomChoice([() => this.verticalStream(), () => this.horizontalStream(), () => this.upAndDownBullets(),
                () => this.upAndDownBullets2(), () => this.verticalStream(1), () => this.horizontalStream(1)]);
            attack();
            this.test = 2;
        } else this.test--;
    }

    verticalStream(gap = 2) {
        const amountOfBullets = 6;
        const startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[0].x + 2]);
        let startY = randomChoice([Game.endRoomBoundaries[0].y + 1, Game.endRoomBoundaries[1].y - 1]);
        let dirY = startY === Game.endRoomBoundaries[0].y + 1 ? 1 : -1;
        for (let x = startX; x < Game.endRoomBoundaries[1].x; x += gap + 1) {
            for (let n = 1; n <= amountOfBullets; n++) {
                const bullet = new ElectricBullet(x, startY, [{x: 0, y: dirY}]);
                bullet.delay = n;
                Game.world.addBullet(bullet);
            }
            startY = startY === Game.endRoomBoundaries[0].y + 1 ? Game.endRoomBoundaries[1].y - 1 : Game.endRoomBoundaries[0].y + 1;
            dirY = startY === Game.endRoomBoundaries[0].y + 1 ? 1 : -1;
        }
    }

    horizontalStream(gap = 2) {
        const amountOfBullets = 8;
        const startY = randomChoice([Game.endRoomBoundaries[0].y + 1, Game.endRoomBoundaries[0].y + 2]);
        let startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[1].x - 1]);
        let dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
        for (let y = startY; y < Game.endRoomBoundaries[1].y; y += gap + 1) {
            for (let n = 1; n <= amountOfBullets; n++) {
                const bullet = new ElectricBullet(startX, y, [{x: dirX, y: 0}]);
                bullet.delay = n;
                Game.world.addBullet(bullet);
            }
            startX = startX === Game.endRoomBoundaries[0].x + 1 ? Game.endRoomBoundaries[1].x - 1 : Game.endRoomBoundaries[0].x + 1;
            dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
        }
    }

    upAndDownBullets() {
        const amountOfBullets = 6;
        //relies on the first element having X direction
        const dir = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dir === 0) return;
        for (let n = 1; n <= amountOfBullets; n++) {
            const bullet1 = new ElectricBullet(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: 1}, {x: dir, y: 0}, {x: dir, y: -1}, {x: dir, y: 0}]);
            const bullet2 = new ElectricBullet(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: -1}, {x: dir, y: 0}, {x: dir, y: 1}, {x: dir, y: 0}]);
            bullet1.delay = bullet2.delay = n;
            Game.world.addBullet(bullet1);
            Game.world.addBullet(bullet2);
        }
    }

    upAndDownBullets2() {
        const amountOfBullets = 6;
        //relies on the first element having X direction
        const dir = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dir === 0) return;
        for (let n = 1; n <= amountOfBullets; n++) {
            const bullet1 = new ElectricBullet(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: 1}, {x: dir, y: 1}, {x: dir, y: -1}, {x: dir, y: -1}]);
            const bullet2 = new ElectricBullet(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: -1}, {x: dir, y: -1}, {x: dir, y: 1}, {x: dir, y: 1}]);
            bullet1.delay = bullet2.delay = n;
            Game.world.addBullet(bullet1);
            Game.world.addBullet(bullet2);
        }
    }
}