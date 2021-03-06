import {Game} from "../../../game";
import {ENEMY_TYPE, EQUIPMENT_ID, EQUIPMENT_TYPE, INANIMATE_TYPE} from "../../../enums/enums";
import {Boss} from "./boss";
import {randomChoice, randomInt} from "../../../utils/random_utils";
import {ElectricBullet} from "../bullets/electric";
import {getChasingDirections} from "../../../utils/map_utils";
import {closestPlayer, tileDistance} from "../../../utils/game_utils";
import {isEmpty, isNotAWall} from "../../../map_checks";
import {getBresenhamLine} from "../../../utils/math_utils";
import {removeObjectFromArray} from "../../../utils/basic_utils";
import {FireHazard} from "../../hazards/fire";
import {WARNING_BULLET_OUTLINE_FILTER} from "../../../filters";
import {dropItem, removeEquipmentFromPlayer} from "../../../game_logic";
import {extinguishTorch, lightPosition} from "../../../drawing/lighting";
import {updateChain} from "../../../drawing/draw_dunno";
import {GotLSpriteSheet} from "../../../loader";
import {FireGoblet} from "../../inanimate_objects/fire_goblet";
import {Z_INDEXES} from "../../../z_indexing";
import {camera} from "../../game/camera";
import {DAMAGE_TYPE} from "../../../enums/damage_type";
import {EssenceOfLight} from "../../equipment/one_time/essence_of_light";

export class GuardianOfTheLight extends Boss {
    constructor(tilePositionX, tilePositionY, texture = GotLSpriteSheet["gotl_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 28;
        this.type = ENEMY_TYPE.GUARDIAN_OF_THE_LIGHT;
        this.atk = 1.5; //??
        this.name = "Guardian of the Light";
        this.maskLayer = {weak: true};
        this.toBecomeNeutral = false;
        this.dontChangeLook = false;
        this.triggeredElectric = false;
        this.triggeredElectricDoom = false;
        this.triggeredTeleport = false;
        this.triggeredFireTeleport = false;
        this.electricWearOff = false;
        this.electricDoomWearOff = false;
        this.phase = 1;
        this.patience = {turns: 0, damage: 0};
        this.startDelay = 4;
        this.started = false;
        this.plannedElectricAttacks = 0;
        this.possibleAttacks = [this.verticalStream, this.horizontalStream, this.tunnelBullets, this.diamondBullets];
        this.usedAttacks = [];
        this.canCreateDoom = true;
        this.overallDamage = [];
        this.warningBullets = [];
        this.bulletQueue = [];
        this.electricityDelay = 1;
        this.setScaleModifier(1.25);
        this.setOwnZIndex(Z_INDEXES.DARK_TUNNEL_DARKNESS * 2 + 5);
        this.initialTallModifier = this.tallModifier = 20;
        this.initialHeight = this.texture.trim.height;
    }

    place() {
        //his texture height changes but I want him to stay on a more or less consistent Y
        this.tallModifier = this.initialTallModifier - (this.texture.trim.height - this.initialHeight) * this.scale.y * 0.6;
        super.place();
    }

    placeShadow() {
        super.placeShadow();
        this.shadow.zIndex = 1;
    }

    static getBossRoomStats() {
        return {width: randomInt(11, 12), height: randomInt(11, 12)};
    }

    cancelAnimation() {
        super.cancelAnimation();
        this.alpha = 1;
    }

    onBossModeActivate() {
        Game.darkTiles[this.tilePosition.y][this.tilePosition.x].addLightSource(this.maskLayer);
        if (Game.player.secondHand && Game.player.secondHand.id === EQUIPMENT_ID.TORCH) {
            removeEquipmentFromPlayer(Game.player, EQUIPMENT_TYPE.TOOL);
        } else if (Game.player2.secondHand && Game.player2.secondHand.id === EQUIPMENT_ID.TORCH) {
            removeEquipmentFromPlayer(Game.player2, EQUIPMENT_TYPE.TOOL);
        }
        extinguishTorch();

        Game.unplayable = true;
        const goblets = [];
        for (const inanimate of Game.inanimates) {
            if (inanimate.type === INANIMATE_TYPE.FIRE_GOBLET) {
                goblets.push(inanimate);
            }
        }
        // pick two middle goblets that have the same Y-position
        goblets.sort((a, b) => a.tilePosition.y - b.tilePosition.y);
        goblets.pop();
        goblets.shift();
        for (const goblet of goblets) {
            const offset = goblet.tilePosition.x === Math.min(...goblets.map(g => g.tilePosition.x)) ? 1 : -1;
            if (offset === 1 && !Game.player.dead) {
                this.teleportPlayer(Game.player, goblet.tilePosition.x + offset, goblet.tilePosition.y);
            } else if (offset === -1 && !Game.player2.dead) {
                this.teleportPlayer(Game.player2, goblet.tilePosition.x + offset, goblet.tilePosition.y);
            }
        }
        camera.moveToCenter(10);
    }

    teleportPlayer(player, tilePosX, tilePosY) {
        player.cancelAnimation();
        player.removeFromMap();
        player.tilePosition.x = tilePosX;
        player.tilePosition.y = tilePosY;
        player.placeOnMap();
        const initialZIndex = player.zIndex;
        const time = 30;
        const alphaStep1 = 1 / (time / 3);
        const alphaStep2 = 1 / (time * 2 / 3);
        let counter = 0;
        const animation = delta => {
            counter += delta;
            if (counter < time / 3) {
                player.zIndex = Game.darkTiles[0][0].zIndex + 1;
                player.alpha -= alphaStep1;
            } else {
                updateChain();
                player.place();
                player.alpha += alphaStep2;
            }
            if (counter >= time) {
                player.place();
                player.placeMinions();
                player.alpha = 1;
                player.zIndex = initialZIndex;
                Game.unplayable = false;
                Game.app.ticker.remove(animation);
            }
        };
        Game.app.ticker.add(animation);
    }

    move() {
        for (let i = this.warningBullets.length - 1; i >= 0; i--) {
            this.warningBullets[i].die();
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

        if (this.phase === 1 && this.health <= this.maxHealth / 1.35) {
            this.phase = 2;
            this.electricityDelay -= 2;
        }
        if (this.phase === 2 && this.health <= this.maxHealth / 2.5) {
            this.phase = 3;
            this.electricityDelay -= 3;
        }

        if (this.toBecomeNeutral) {
            this.texture = GotLSpriteSheet["gotl_neutral.png"];
            this.toBecomeNeutral = false;
        }

        if (this.dontChangeLook) this.dontChangeLook = false;
        else {
            const lookDirection = Math.sign(closestPlayer(this).tilePosition.x - this.tilePosition.x);
            if (lookDirection !== 0) {
                this.scale.x = lookDirection * Math.abs(this.scale.x);
            }
        }

        if (!this.started) {
            this.startDelay--;
            if (this.startDelay <= 0) {
                this.started = true;
                this.triggeredTeleport = true;
                this.texture = GotLSpriteSheet["gotl_about_to_teleport.png"];
            }
        } else if (this.waitingToMove) {
            this.waitingToMove = false;
            this.texture = GotLSpriteSheet["gotl_neutral.png"];
            if (this.triggeredElectricDoom || this.triggeredElectric) {
                this.texture = GotLSpriteSheet["gotl_electric.png"];
                this.shake(0, 1);
            }
        } else if (this.triggeredTeleport) {
            this.teleport();
            this.triggeredTeleport = false;
            this.toBecomeNeutral = true;

        } else if (this.triggeredFireTeleport) {
            this.fireTeleport();
            this.triggeredFireTeleport = false;
            this.texture = GotLSpriteSheet["gotl_fire.png"];
            this.toBecomeNeutral = true;

        } else if (this.electricWearOff || this.electricDoomWearOff) {
            this.electricWearOff = false;
            this.toBecomeNeutral = true;
            this.texture = GotLSpriteSheet["gotl_after_electric.png"];
            if (this.electricDoomWearOff) {
                this.electricDoomWearOff = false;
                this.electricityDelay = randomInt(12, 14);
            } else {
                if (this.phase === 1) this.electricityDelay = randomInt(9, 13);
                else if (this.phase === 2) this.electricityDelay = randomInt(9, 12);
                else if (this.phase === 3) this.electricityDelay = randomInt(11, 14);
            }

        } else if (this.triggeredElectricDoom) {
            this.texture = GotLSpriteSheet["gotl_electric.png"];
            if (Math.random() < 0.5) this.horizontalDoomBullets();
            else this.verticalDoomBullets();
            this.triggeredElectricDoom = false;
            this.electricDoomWearOff = true;

        } else if (this.triggeredElectric) {
            this.texture = GotLSpriteSheet["gotl_electric.png"];
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
            this.texture = GotLSpriteSheet["gotl_before_electric.png"];
            if (this.phase === 3) {
                if (Math.random() < 0.5 && this.canCreateDoom) {
                    this.triggeredElectricDoom = true;
                    this.waitingToMove = true;
                    this.canCreateDoom = false;
                } else {
                    this.triggeredElectric = true;
                    this.canCreateDoom = true;
                }
            } else this.triggeredElectric = true;
            this.plannedElectricAttacks = this.phase;
            this.usedAttacks = [];
            this.shake(0, 1);

        } else if (this.patience.turns <= 0) {
            if (this.phase === 3) {
                this.triggeredFireTeleport = true;
                this.texture = GotLSpriteSheet["gotl_fire.png"];
            } else {
                this.triggeredTeleport = true;
                this.texture = GotLSpriteSheet["gotl_about_to_teleport.png"];
            }
        }

        this.place();
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
            this.prepareBullets(startX, y, [{x: dirX, y: 0}], 6);

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
        this.updatePatience();
        const location = randomChoice(freeLocations);
        this.removeFromMap();
        this.tilePosition = location;
        this.placeOnMap();
        this.correctZIndex();
        const time = 18;
        const alphaStep1 = 1 / (time / 4);
        const alphaStep2 = 1 / (time * 3 / 4);
        let counter = 0;
        const animation = delta => {
            if (Game.paused) return;
            counter += delta;
            if (counter < time / 4) {
                this.alpha -= alphaStep1;
            } else {
                this.place();
                this.alpha += alphaStep2;
            }
            if (counter >= time) {
                this.place();
                this.alpha = 1;
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
        let startX = randomChoice([Game.endRoomBoundaries[0].x + 1, Game.endRoomBoundaries[1].x - 1]);
        let dirX = startX === Game.endRoomBoundaries[0].x + 1 ? 1 : -1;
        for (let y = Game.endRoomBoundaries[0].y + 1; y < Game.endRoomBoundaries[1].y; y++) {
            this.prepareBullets(startX, y, [{x: dirX, y: 0}], 6);
        }
    }

    fireTeleport() {
        const freeLocations = this.getFreeTeleportLocations();
        if (freeLocations.length === 0) return;
        this.updatePatience();
        const location = randomChoice(freeLocations);
        const oldLocation = {x: this.tilePosition.x, y: this.tilePosition.y};
        const animationTime = Math.abs(location.x - this.tilePosition.x) + Math.abs(location.y - this.tilePosition.y);
        this.slide(location.x - this.tilePosition.x, location.y - this.tilePosition.y, null, null, animationTime);

        for (const tile of getBresenhamLine(oldLocation.x, oldLocation.y, location.x, location.y)) {
            if (isNotAWall(tile.x, tile.y)) {
                const newFire = new FireHazard(tile.x, tile.y);
                newFire.spreadTimes = 1;
                newFire.tileSpread = 1;
                newFire.LIFETIME = newFire.turnsLeft = 7;
                Game.world.addHazard(newFire);
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

    updatePatience() {
        this.patience.turns = randomInt(24, 31) - this.phase * 2;
        this.patience.damage = randomInt(3, 4);
    }

    damage(source, dmg, inputX = 0, inputY = 0, damageType = DAMAGE_TYPE.PHYSICAL_WEAPON) {
        super.damage(source, dmg, inputX, inputY, damageType);
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
        const essenceX = Game.endRoomBoundaries[0].x + Math.floor((Game.endRoomBoundaries[1].x - Game.endRoomBoundaries[0].x + 1) / 2);
        const essenceY = Game.endRoomBoundaries[0].y + Math.floor((Game.endRoomBoundaries[1].y - Game.endRoomBoundaries[0].y + 1) / 2);
        const essence = new EssenceOfLight();
        const item = dropItem(essence, essenceX, essenceY);
        if (item) lightPosition({x: item.tilePosition.x, y: item.tilePosition.y}, essence.lightSpread, true);

        super.die(source);
        for (let i = this.warningBullets.length - 1; i >= 0; i--) {
            this.warningBullets[i].die();
        }
        for (let i = Game.bullets.length - 1; i >= 0; i--) {
            Game.bullets[i].die();
        }

        for (const inanimate of Game.inanimates) {
            if (inanimate.type === INANIMATE_TYPE.FIRE_GOBLET) {
                inanimate.shatter();
            }
        }
    }

    applyRoomLayout(level, room) {
        const positions = [{x: this.tilePosition.x, y: this.tilePosition.y - 3},
            {x: this.tilePosition.x, y: this.tilePosition.y + 3},
            {x: this.tilePosition.x - 3, y: this.tilePosition.y},
            {x: this.tilePosition.x + 3, y: this.tilePosition.y}];

        for (const pos of positions) {
            level[pos.y][pos.x].entity = new FireGoblet(pos.x, pos.y);
        }
    }
}