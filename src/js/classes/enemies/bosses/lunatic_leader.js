import {Game} from "../../../game";
import {ENEMY_TYPE} from "../../../enums";
import {Boss} from "./boss";
import {randomInt} from "../../../utils/random_utils";
import {LunaticLeaderSpriteSheet} from "../../../loader";
import {tileInsideTheBossRoom} from "../../../map_checks";
import {darkenTile} from "../../../drawing/lighting";

export class LunaticLeader extends Boss {
    constructor(tilePositionX, tilePositionY, texture = LunaticLeaderSpriteSheet["lunatic_leader_neutral.png"]) {
        super(texture, tilePositionX, tilePositionY);
        this.health = this.maxHealth = 56;
        this.type = ENEMY_TYPE.LUNATIC_LEADER;
        this.atk = 1.25;
        this.name = "Lunatic Leader";
        this.tallModifier = 7;
        this.setScaleModifier(1.7);
        this.shadowWidthMul = 0.35;
        this.regenerateShadow();
    }

    static getBossRoomStats() {
        return {width: randomInt(12, 15), height: randomInt(10, 12)};
    }

    onBossModeActivate() {
        for (let x = 0; x < Game.map[0].length; x++) {
            for (let y = 0; y < Game.map.length; y++) {
                if (!tileInsideTheBossRoom(x, y)) {
                    darkenTile(x, y);
                }
            }
        }
    }

    move() {

    }
}