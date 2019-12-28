import * as PIXI from "pixi.js";
import {Game} from "../../game";
import {isEmpty} from "../../map_checks";
import {HAZARD_TYPE, ROLE} from "../../enums";
import {removeObjectFromArray} from "../../utils/basic_utils";
import {removeAllChildrenFromContainer} from "../../drawing/draw_utils";

export class World extends PIXI.Container {
    constructor() {
        super();
    }

    addHazard(hazard) {
        const competingHazard = Game.map[hazard.tilePosition.y][hazard.tilePosition.x].hazard;
        if (competingHazard === null) {
            hazard.addToWorld();
        } else if (competingHazard.type === hazard.type) {
            competingHazard.refreshLifetime();
        } else if (hazard.type === HAZARD_TYPE.POISON) {
            if (competingHazard.type === HAZARD_TYPE.DARK_POISON || competingHazard.type === HAZARD_TYPE.DARK_FIRE) {
                competingHazard.spoil(hazard);
            } else if (competingHazard.type === HAZARD_TYPE.FIRE) {
                competingHazard.ignite();
            }
        } else if (hazard.type === HAZARD_TYPE.FIRE) {
            if (competingHazard.type === HAZARD_TYPE.DARK_FIRE || competingHazard.type === HAZARD_TYPE.DARK_POISON) {
                competingHazard.spoil(hazard);
            } else if (competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            }
        } else if (hazard.type === HAZARD_TYPE.DARK_POISON) {
            if (competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            } else if (competingHazard.type === HAZARD_TYPE.DARK_FIRE) {
                competingHazard.ignite();
            } else if (competingHazard.type === HAZARD_TYPE.FIRE) {
                competingHazard.turnToDark();
            }
        } else if (hazard.type === HAZARD_TYPE.DARK_FIRE) {
            if (competingHazard.type === HAZARD_TYPE.FIRE
                || competingHazard.type === HAZARD_TYPE.DARK_POISON
                || competingHazard.type === HAZARD_TYPE.POISON) {
                competingHazard.removeFromWorld();
                hazard.addToWorld();
            }
        }
    }

    addBullet(bullet) {
        Game.bullets.push(bullet);
        this.addChild(bullet);
        if (isEmpty(bullet.tilePosition.x, bullet.tilePosition.y)) {
            bullet.placeOnMap();
        } else {
            const entity = Game.map[bullet.tilePosition.y][bullet.tilePosition.x].entity;
            if (entity) {
                if (entity.role === ROLE.ENEMY || entity.role === ROLE.PLAYER) {
                    bullet.attack(Game.map[bullet.tilePosition.y][bullet.tilePosition.x].entity);
                } else if (entity.role === ROLE.BULLET) {
                    bullet.placeOnMap();
                } else bullet.die();
            } else bullet.die();
        }
    }

    clean() {
        removeAllChildrenFromContainer(this);
        for (const animation of Game.infiniteAnimations) {
            Game.app.ticker.remove(animation);
        }
    }
}