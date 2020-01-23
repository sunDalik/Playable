import {Aura} from "./classes/equipment/magic/aura";
import {Spikes} from "./classes/equipment/magic/spikes";
import {Fireball} from "./classes/equipment/magic/fireball";
import {Necromancy} from "./classes/equipment/magic/necromancy";
import {Petrification} from "./classes/equipment/magic/petrification";
import {Teleport} from "./classes/equipment/magic/teleport";
import {Wind} from "./classes/equipment/magic/wind";
import {BasicArmor} from "./classes/equipment/armor/basic";
import {WizardRobe} from "./classes/equipment/armor/wizard_robe";
import {HeavyArmor} from "./classes/equipment/armor/heavy";
import {ElectricArmor} from "./classes/equipment/armor/electric";
import {Wings} from "./classes/equipment/armor/wings";
import {SeerCirclet} from "./classes/equipment/headwear/seer_circlet";
import {WizardHat} from "./classes/equipment/headwear/wizard_hat";
import {VampireCrown} from "./classes/equipment/headwear/vampire_crown";
import {AdventurerBoots} from "./classes/equipment/footwear/adventurer";
import {DamagingBoots} from "./classes/equipment/footwear/damaging";
import {DarkBoots} from "./classes/equipment/footwear/dark";
import {Knife} from "./classes/equipment/weapons/knife";
import {NinjaKnife} from "./classes/equipment/weapons/ninja_knife";
import {Sword} from "./classes/equipment/weapons/sword";
import {Bow} from "./classes/equipment/weapons/bow";
import {Scythe} from "./classes/equipment/weapons/scythe";
import {MaidenDagger} from "./classes/equipment/weapons/maiden_dagger";
import {BookOfFlames} from "./classes/equipment/weapons/book_of_flames";
import {Hammer} from "./classes/equipment/weapons/hammer";
import {Pickaxe} from "./classes/equipment/tools/pickaxe";
import {PassiveShield} from "./classes/equipment/shields/passive";
import {SpikyShield} from "./classes/equipment/shields/spiky";
import {StunningShield} from "./classes/equipment/shields/stunning";
import {Game} from "./game";
import {RARITY, STAGE} from "./enums";
import * as rooms from "./rooms";
import {AbyssalSpit} from "./classes/equipment/magic/abyssal_spit";
import {PawnSwords} from "./classes/equipment/weapons/pawn_swords";
import {BasicShield} from "./classes/equipment/shields/basic_shield";

export function initPools() {
    Game.weaponPool = [Knife, NinjaKnife, Sword, Bow, Scythe, MaidenDagger, BookOfFlames, Hammer, Pickaxe, PawnSwords];
    Game.magicPool = [Aura, Spikes, Fireball, Necromancy, Petrification, Teleport, Wind, AbyssalSpit];
    Game.chestItemPool = [Pickaxe, BasicArmor, WizardRobe, SeerCirclet, WizardHat, AdventurerBoots,
        DamagingBoots, DarkBoots, BasicShield, PassiveShield, SpikyShield, StunningShield, HeavyArmor, ElectricArmor, VampireCrown, Wings];
}

export function removeItemFromPool(item, pool) {
    for (let i = 0; i < pool.length; i++) {
        if (item.constructor === pool[i]) {
            pool.splice(i, 1);
            break;
        }
    }
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
            Game.stage = STAGE.LABYRINTH;
            break;
        case STAGE.LABYRINTH:
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
            Game.bossRooms = rooms.FCBossRooms;
            Game.BGColor = 0xabcfd1;
            assignRarityChances(55, 88, 97); // 55% 33% 9% 3%
            break;
        case STAGE.DARK_TUNNEL:
            Game.normalRooms = rooms.DTNormalRooms;
            Game.statueRooms = rooms.DTStatueRooms;
            Game.obeliskRooms = rooms.DTObeliskRooms;
            Game.chestRooms = rooms.DTChestRooms;
            Game.bossRooms = rooms.DTBossRooms;
            Game.BGColor = 0x666666;
            assignRarityChances(22, 78, 94); // 22% 56% 16% 6%
            break;
        case STAGE.RUINS:
            Game.BGColor = 0xd8d9d7;
            assignRarityChances(10, 55, 91); // 10% 45% 36% 9%
            break;
        case STAGE.LABYRINTH:
            Game.BGColor = 0x75c978;
            assignRarityChances(0, 32, 87); // 0% 32% 55% 13%
            break;
        case STAGE.FINALE:
            Game.BGColor = 0xcc76cc;
            assignRarityChances(0, 10, 75); // 0% 10% 65% 25%
            break;
    }
}

function assignRarityChances(c1, c2, c3) {
    RARITY.C.chanceFrom = 0;
    RARITY.C.chanceTo = RARITY.B.chanceFrom = c1;
    RARITY.B.chanceTo = RARITY.A.chanceFrom = c2;
    RARITY.A.chanceTo = RARITY.S.chanceFrom = c3;
    RARITY.S.chanceTo = 100;
}