import {Game} from "../../../game"
import {ENEMY_TYPE, STAGE} from "../../../enums";
import {Boss} from "./boss";
import {getRandomInt, randomChoice} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {getChasingDirections} from "../../../utils/map_utils";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {isEmpty, isRelativelyEmpty} from "../../../map_checks";
import {average} from "../../../utils/math_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {FireHazard} from "../../hazards/fire";
import {WARNING_BULLET_OUTLINE_FILTER} from "../../../filters";

export class GuardianOfTheLight extends Boss {
    constructor(tilePositionX, tilePositionY, texture = Game.resources["src/images/bosses/guardian_of_the_light/neutral.png"].texture) {
        super(texture, tilePositionX, tilePositionY);
        this.maxHealth = 32;
        this.health = this.maxHealth;
        this.type = ENEMY_TYPE.GUARDIAN_OF_THE_LIGHT;
        this.atk = 1.5;
        this.name = "Guardian of the Light";

        this.maskLayer = {};
        this.test = 2;
        this.toBecomeNeutral = false;
        this.dontChangeLook = false;
        this.triggeredElectric = false;
        this.triggeredTeleport = false;
        this.triggeredFireTeleport = false;
        this.electricWearOff = false;
        this.phase = 1;
        this.finalPhase = false;
        this.patience = {turns: 0, damage: 0};
        this.startDelay = 4;
        this.plannedElectricAttacks = 0;
        this.possibleAttacks = [this.verticalStream, this.horizontalStream, this.tunnelBullets, this.diamondBullets];
        this.usedAttacks = [];
        this.overallDamage = [];
        this.initialZIndex = this.zIndex;
        this.scaleModifier = 1.25;
        this.warningBullets = [];
        this.bulletQueue = [];
        this.electricityDelay = 1;
        this.fitToTile();
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.alpha = 1;
        this.zIndex = this.initialZIndex;
    }

    move() {
        for (const warningBullet of this.warningBullets) {
            warningBullet.die();
        }
        for (let i = this.bulletQueue.length - 1; i >= 0; i--) {
            const bullet = this.bulletQueue[i];
            bullet.delay--;
            if (bullet.delay <= 0) {
                bullet.delay = 1;
                Game.world.addBullet(bullet);
                removeObjectFromArray(bullet, this.bulletQueue);
            }
        }

        if (this.phase === 1 && this.health <= this.maxHealth / 1.25) {
            this.phase = 2;
            this.electricityDelay -= 2;
        }
        if (this.phase === 2 && this.health <= this.maxHealth / 1.75) {
            this.phase = 3;
            this.electricityDelay -= 3;
        }

        if (this.toBecomeNeutral) {
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/neutral.png"].texture;
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
            this.toBecomeNeutral = false;
        }

        if (this.dontChangeLook) this.dontChangeLook = false;
        else {
            const lookDirection = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (lookDirection !== 0) {
                this.scale.x = lookDirection * Math.abs(this.scale.x);
            }
        }
        if (!this.finalPhase && this.health <= Math.max(this.maxHealth / 5, average(this.overallDamage) * 3) && this.health <= this.maxHealth / 3) {
            this.activateFinalPhase();
        } else if (this.startDelay > 0) {
            this.startDelay--;
            if (this.startDelay <= 0) {
                this.triggeredTeleport = true;
                this.texture = Game.resources["src/images/bosses/guardian_of_the_light/about_to_teleport.png"].texture;
            }
        } else if (this.waitingToMove) {
            this.waitingToMove = false;
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/neutral.png"].texture;
            if (!this.triggeredElectric && !this.electricWearOff && !this.triggeredFireTeleport) {
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
            }
        } else if (this.triggeredTeleport) {
            this.teleport();
            this.triggeredTeleport = false;
            this.toBecomeNeutral = true;
        } else if (this.triggeredFireTeleport) {
            this.fireTeleport();
            this.triggeredFireTeleport = false;
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/fire.png"].texture;
            this.waitingToMove = true;
        } else if (this.electricWearOff) {
            this.electricWearOff = false;
            this.toBecomeNeutral = true;
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/after_electric.png"].texture;
            this.electricityDelay = getRandomInt(8, 13) - this.phase;
        } else if (this.triggeredElectric) {
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/electric.png"].texture;
            const attack = randomChoice(this.possibleAttacks.filter(attack => !this.usedAttacks.includes(attack)));
            this.usedAttacks.push(attack);
            if (attack === this.verticalStream || attack === this.horizontalStream) {
                if (Math.random() < 0.5) attack.call(this, 2);
                else attack.call(this, 1);
            } else attack.call(this);
            this.plannedElectricAttacks--;
            if (this.plannedElectricAttacks <= 0) {
                this.triggeredElectric = false;
                this.electricWearOff = true;
            } else {
                this.shake(0, 1);
            }
        } else if (this.electricityDelay <= 0) {
            Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
            this.texture = Game.resources["src/images/bosses/guardian_of_the_light/before_electric.png"].texture;
            this.triggeredElectric = true;
            this.plannedElectricAttacks = this.phase;
            this.usedAttacks = [];
            this.shake(0, 1);
        } else if (this.patience.turns <= 0) {
            if (this.phase === 3) {
                Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
                this.triggeredFireTeleport = true;
                this.texture = Game.resources["src/images/bosses/guardian_of_the_light/fire.png"].texture;
            } else {
                this.triggeredTeleport = true;
                this.texture = Game.resources["src/images/bosses/guardian_of_the_light/about_to_teleport.png"].texture;
            }
        }
        this.patience.turns--;
        this.electricityDelay--;
    }

    verticalStream(gap = 2) {
        const startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[0].x + 2]);
        let startY = randomChoice([Game.endRoomBoundaries[0].y + 1, Game.endRoomBoundaries[1].y - 1]);
        let dirY = startY === Game.endRoomBoundaries[0].y + 1 ? 1 : -1;
        for (let x = startX; x < Game.endRoomBoundaries[1].x; x += gap + 1) {
            this.prepareBullets(x, startY, [{x: 0, y: dirY}], 6);

            if (this.phase >= 2) {
                startY = startY === Game.endRoomBoundaries[0].y + 1 ? Game.endRoomBoundaries[1].y - 1 : Game.endRoomBoundaries[0].y + 1;
                dirY = startY === Game.endRoomBoundaries[0].y + 1 ? 1 : -1;
            }
        }
    }

    horizontalStream(gap = 2) {
        const startY = randomChoice([Game.endRoomBoundaries[0].y + 1, Game.endRoomBoundaries[0].y + 2]);
        let startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[1].x - 1]);
        let dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
        for (let y = startY; y < Game.endRoomBoundaries[1].y; y += gap + 1) {
            this.prepareBullets(startX, y, [{x: dirX, y: 0}], 8);

            if (this.phase >= 2) {
                startX = startX === Game.endRoomBoundaries[0].x + 1 ? Game.endRoomBoundaries[1].x - 1 : Game.endRoomBoundaries[0].x + 1;
                dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
            }
        }
    }

    tunnelBullets() {
        const prepareTunnelBullets = dir => {
            this.prepareBullets(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: 0}, {x: dir, y: 1}, {x: dir, y: 0}, {x: dir, y: 0}, {x: dir, y: -1}], 6);
            this.prepareBullets(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: 0}, {x: dir, y: -1}, {x: dir, y: 0}, {x: dir, y: 0}, {x: dir, y: 1}], 6);
        };

        //relies on the first element having X direction
        let dirX = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dirX === 0) {
            dirX = randomChoice([-1, 1]);
        }

        prepareTunnelBullets(dirX);
        if (this.phase === 3 || this.phase === 2 && Math.random() < 0.5) {
            prepareTunnelBullets(-dirX);
        }
    }

    diamondBullets() {
        const prepareDiamondBullets = dir => {
            this.prepareBullets(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: 1}, {x: dir, y: 1}, {x: dir, y: -1}, {x: dir, y: -1}], 6);
            this.prepareBullets(this.tilePosition.x + dir, this.tilePosition.y,
                [{x: dir, y: -1}, {x: dir, y: -1}, {x: dir, y: 1}, {x: dir, y: 1}], 6);
        };

        //relies on the first element having X direction
        let dirX = getChasingDirections(this, closestPlayer(this))[0].x;
        if (dirX === 0) {
            dirX = randomChoice([-1, 1]);
        }
        prepareDiamondBullets(dirX);
        if (this.phase === 3) {
            prepareDiamondBullets(-dirX);
        }
    }

    teleport() {
        const freeLocations = this.getFreeTeleportLocations();
        if (freeLocations.length === 0) return;
        Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        this.updatePatience();
        const location = randomChoice(freeLocations);
        this.removeFromMap();
        this.tilePosition = location;
        this.placeOnMap();
        const time = 18;
        const alphaStep1 = 1 / (time / 3);
        const alphaStep2 = 1 / (time * 2 / 3);
        let counter = 0;
        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter < time / 3) {
                this.zIndex = Game.darkTiles[0][0].zIndex + 1;
                this.alpha -= alphaStep1;
            } else {
                this.place();
                this.alpha += alphaStep2;
            }
            if (counter >= time) {
                this.place();
                this.alpha = 1;
                this.zIndex = this.initialZIndex;
                Game.app.ticker.remove(animation);
            }
        };
        this.animation = animation;
        Game.app.ticker.add(animation);
    }

    verticalDoomBullets() {
        let startY = randomChoice([Game.endRoomBoundaries[0].y + 1, Game.endRoomBoundaries[1].y - 1]);
        let dirY = startY === Game.endRoomBoundaries[0].y + 1 ? 1 : -1;
        for (let x = Game.endRoomBoundaries[0].x + 1; x < Game.endRoomBoundaries[1].x; x++) {
            this.prepareBullets(x, startY, [{x: 0, y: dirY}], 6);
        }
    }

    horizontalDoomBullets() {
        const amountOfBullets = 8;
        let startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[1].x - 1]);
        let dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            this.prepareBullets(startX, y, [{x: dirX, y: 0}], 8);
        }
    }

    fireTeleport() {
        const freeLocations = this.getFreeTeleportLocations();
        if (freeLocations.length === 0) return;
        Game.darkTiles[this.tilePosition.y][this.tilePosition.x].removeLightSource(this.maskLayer);
        this.updatePatience();
        const location = randomChoice(freeLocations);
        const oldLocation = {x: this.tilePosition.x, y: this.tilePosition.y};
        const animationTime = Math.abs(location.x - this.tilePosition.x) + Math.abs(location.y - this.tilePosition.y);
        this.slide(location.x - this.tilePosition.x, location.y - this.tilePosition.y, null, null, animationTime);

        while (location.x !== oldLocation.x || location.y !== oldLocation.y) {
            if (isRelativelyEmpty(oldLocation.x, oldLocation.y)) {
                const newFire = new FireHazard(oldLocation.x, oldLocation.y);
                newFire.spreadTimes = 1;
                newFire.tileSpread = 1;
                newFire.LIFETIME = newFire.turnsLeft = 7;
                Game.world.addHazard(newFire);
            }
            if (location.x !== oldLocation.x && location.y !== oldLocation.y) {
                if (Math.abs(location.x - oldLocation.x) === Math.abs(location.y - oldLocation.y)) {
                    if (Math.random() < 0.5) oldLocation.x += Math.sign(location.x - oldLocation.x);
                    else oldLocation.y += Math.sign(location.y - oldLocation.y)
                } else if (Math.abs(location.x - oldLocation.x) > Math.abs(location.y - oldLocation.y)) oldLocation.x += Math.sign(location.x - oldLocation.x);
                else oldLocation.y += Math.sign(location.y - oldLocation.y);
            } else {
                if (location.x !== oldLocation.x) oldLocation.x += Math.sign(location.x - oldLocation.x);
                else oldLocation.y += Math.sign(location.y - oldLocation.y)
            }
        }
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

    activateFinalPhase() {
        this.finalPhase = true;
    }

    updatePatience() {
        this.patience.turns = getRandomInt(24, 32) - this.phase * 2;
        this.patience.damage = getRandomInt(3, 6);
    }

    damage(source, dmg, inputX = 0, inputY = 0, magical = false, hazardDamage = false) {
        super.damage(source, dmg, inputX, inputY, magical, hazardDamage);
        if (inputX !== 0) {
            this.scale.x = -inputX * Math.abs(this.scale.x);
            this.dontChangeLook = true;
        }
        this.overallDamage.push(dmg);
        this.patience.damage -= dmg;
        if (this.patience.damage <= 0) {
            this.patience.turns = 0;
            if (this.startDelay > 0) {
                this.startDelay = 0;
                this.triggeredTeleport = true;
                this.texture = Game.resources["src/images/bosses/guardian_of_the_light/about_to_teleport.png"].texture;
            }
        }
    }

    createWarningBullet(tilePosX, tilePosY, pattern) {
        const warningBullet = new ElectricBullet(tilePosX, tilePosY, pattern);
        Game.world.addChild(warningBullet);
        //we assume that this boss cannot spawn anywhere but in dark tunnel
        Game.darkTiles[warningBullet.tilePosition.y][warningBullet.tilePosition.x].addLightSource(warningBullet.maskLayer);
        warningBullet.delay = 0;
        warningBullet.filters = [WARNING_BULLET_OUTLINE_FILTER];
        warningBullet.updateIntentIcon();
        warningBullet.alpha = warningBullet.intentIcon.alpha = 0.4;
        this.warningBullets.push(warningBullet);
    }

    prepareBullets(tilePosX, tilePosY, pattern, amount) {
        this.createWarningBullet(tilePosX, tilePosY, pattern);
        for (let n = 1; n <= amount; n++) {
            const bullet = new ElectricBullet(tilePosX, tilePosY, pattern);
            bullet.delay = n;
            this.bulletQueue.push(bullet);
        }
    }

    die(source) {
        super.die(source);
        for (const warningBullet of this.warningBullets) {
            warningBullet.die();
        }
        for (const bullet of Game.bullets) {
            bullet.die();
        }
    }
}