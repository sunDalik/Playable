import {Aura} from "./classes/magic/aura";
import {Spikes} from "./classes/magic/spikes";
import {Fireball} from "./classes/magic/fireball";
import {Necromancy} from "./classes/magic/necromancy";
import {Petrification} from "./classes/magic/petrification";
import {Teleport} from "./classes/magic/teleport";
import {Pickaxe} from "./classes/equipment/tools/pickaxe";
import {BasicArmor} from "./classes/equipment/armor/basic_armor";
import {WizardRobe} from "./classes/equipment/armor/wizard_robe";
import {SeerCirclet} from "./classes/equipment/headwear/seer_circlet";
import {WizardHat} from "./classes/equipment/headwear/wizard_hat";
import {AntiHazardBoots} from "./classes/equipment/footwear/anti_hazard";
import {DamagingBoots} from "./classes/equipment/footwear/damaging";
import {Game} from "./game";
import {STAGE} from "./enums";
import * as rooms from "./rooms";
import {Knife} from "./classes/equipment/weapons/knife";
import {NinjaKnife} from "./classes/equipment/weapons/ninja_knife";
import {Sword} from "./classes/equipment/weapons/sword";
import {Bow} from "./classes/equipment/weapons/bow";
import {PassiveShield} from "./classes/equipment/shields/passive";
import {SpikyShield} from "./classes/equipment/shields/spiky";
import {StunningShield} from "./classes/equipment/shields/stunning";
import {Scythe} from "./classes/equipment/weapons/scythe";
import {MaidenDagger} from "./classes/equipment/weapons/maiden_dagger";
import {BookOfFlames} from "./classes/equipment/weapons/book_of_flames";

export function initPools() {
    Game.weaponPool = [new Knife(), new NinjaKnife(), new Sword(), new Bow(), new Scythe(), new MaidenDagger(), new BookOfFlames()];
    Game.magicPool = [new Aura(), new Spikes(), new Fireball(), new Necromancy(), new Petrification(), new Teleport()];
    Game.chestItemPool = [new Pickaxe(), new BasicArmor(), new WizardRobe(), new SeerCirclet(), new WizardHat(),
        new AntiHazardBoots(), new DamagingBoots(), new PassiveShield(), new SpikyShield(), new StunningShield()];
}

export function incrementStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.stage = STAGE.DARK_TUNNEL;
            break;
        case STAGE.DARK_TUNNEL:
            Game.stage = STAGE.RUINS;
            break;
        case STAGE.RUINS:
            Game.stage = STAGE.DUNNO;
            break;
        case STAGE.DUNNO:
            Game.stage = STAGE.FINALE;
            break;
    }
}

export function setVariablesForStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.normalRooms = rooms.FCNormalRooms;
            Game.statueRooms = rooms.FCStatueRooms;
            Game.obeliskRooms = rooms.FCObeliskRooms;
            Game.chestRooms = rooms.FCChestRooms;
            Game.BGColor = 0xabcfd1;
            break;
        case STAGE.DARK_TUNNEL:
            Game.normalRooms = rooms.DTNormalRooms;
            Game.statueRooms = rooms.DTStatueRooms;
            Game.obeliskRooms = rooms.DTObeliskRooms;
            Game.chestRooms = rooms.DTChestRooms;
            Game.BGColor = 0x666666;
            break;
        case STAGE.RUINS:
            Game.BGColor = 0xd8d9d7;
            break;
        case STAGE.DUNNO:
            Game.BGColor = 0x75c978;
            break;
        case STAGE.FINALE:
            Game.BGColor = 0xcc76cc;
            break;
    }
}