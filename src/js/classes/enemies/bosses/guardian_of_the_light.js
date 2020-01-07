import {Game} from "../../../game"
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {getRandomInt, randomChoice} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {getChasingDirections} from "../../../utils/map_utils";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {isEmpty} from "../../../map_checks";

export class GuardianOfTheLight extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/guardian_of_the_light/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 30;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.GUARDIAN_OF_THE_LIGHT;
        this.atk = 1.5;
        this.name = "Guardian of the Light";

        this.test = 2;
        this.patience = {turns: 0, damage: 0};
        this.updatePatience();
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.alpha = 1;
    }

    move() {
        this.fireTeleport();
        return;
        if (this.test < 0) {
            const attack = randomChoice([() => this.verticalStream(), () => this.horizontalStream(), () => this.tunnelBullets(),
                () => this.diamondBullets(), () => this.verticalStream(1), () => this.horizontalStream(1)]);
            attack();
            this.test = 2;
        } else this.test--;
        this.patience.turns--;
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

    tunnelBullets() {
        const amountOfBullets = 6;
        //relies on the first element having X direction
        let dirX = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dirX === 0) {
            dirX = randomChoice([-1, 1]);
        }
        for (let n = 1; n <= amountOfBullets; n++) {
            const bullet1 = new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                [{x: dirX, y: 1}, {x: dirX, y: 0}, {x: dirX, y: 0}, {x: dirX, y: -1}]);
            const bullet2 = new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                [{x: dirX, y: -1}, {x: dirX, y: 0}, {x: dirX, y: 0}, {x: dirX, y: 1}]);
            bullet1.delay = bullet2.delay = n;
            Game.world.addBullet(bullet1);
            Game.world.addBullet(bullet2);
        }
    }

    diamondBullets() {
        const amountOfBullets = 6;
        //relies on the first element having X direction
        let dirX = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dirX === 0) {
            dirX = randomChoice([-1, 1]);
        }
        for (let n = 1; n <= amountOfBullets; n++) {
            const bullet1 = new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                [{x: dirX, y: 1}, {x: dirX, y: 1}, {x: dirX, y: -1}, {x: dirX, y: -1}]);
            const bullet2 = new ElectricBullet(this.tilePosition.x + dirX, this.tilePosition.y,
                [{x: dirX, y: -1}, {x: dirX, y: -1}, {x: dirX, y: 1}, {x: dirX, y: 1}]);
            bullet1.delay = bullet2.delay = n;
            Game.world.addBullet(bullet1);
            Game.world.addBullet(bullet2);
        }
    }

    teleport() {
        const freeLocations = this.getFreeTeleportLocations();
        if (freeLocations.length === 0) return;
        this.updatePatience();
        const location = randomChoice(freeLocations);
        this.tilePosition = location;
        const time = 10;
        const alphaStep = 1 / (time / 2);
        let counter = 0;
        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter < time / 2) {
                this.alpha -= alphaStep;
            } else {
                this.place();
                this.alpha += alphaStep;
            }
            if (counter >= time) {
                this.place();
                Game.app.ticker.remove(animation);
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    fireTeleport() {
        const freeLocations = this.getFreeTeleportLocations();
        if (freeLocations.length === 0) return;
        this.updatePatience();
        const location = randomChoice(freeLocations);
        const animationTime = Math.abs(location.x - this.tilePosition.x) + Math.abs(location.y - this.tilePosition.y);
        this.slide(location.x - this.tilePosition.x, location.y - this.tilePosition.y, null, null, animationTime);
        //todo: add fire
    }

    getFreeTeleportLocations() {
        const freeLocations = [];
        for (let i = Game.endRoomBoundaries[0].y + 2; i <= Game.endRoomBoundaries[1].y - 2; i++) {
            for (let j = Game.endRoomBoundaries[0].x + 2; j <= Game.endRoomBoundaries[1].x - 2; j++) {
                const newPos = {tilePosition: {x: j, y: i}};
                if (tileDistance(this, newPos) > 4 && isEmpty(j, i) && tileDistance(newPos, closestPlayer(newPos)) > 3) {
                    freeLocations.push({x: j, y: i});
                }
            }
        }
        return freeLocations;
    }

    updatePatience() {
        this.patience.turns = getRandomInt(20, 30);
        this.patience.damage = getRandomInt(4, 8);
    }
}