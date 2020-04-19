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
import {AssassinDagger} from "./classes/equipment/weapons/assassin_dagger";
import {LongSword} from "./classes/equipment/weapons/long_sword";
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
import {AbyssalSpit} from "./classes/equipment/magic/abyssal_spit";
import {PawnSwords} from "./classes/equipment/weapons/pawn_swords";
import {BasicShield} from "./classes/equipment/shields/basic_shield";
import {EternalCross} from "./classes/equipment/magic/eternal_cross";
import {Immortality} from "./classes/equipment/magic/immortality";
import {Heart} from "./classes/equipment/one_time/heart";
import {BattleHelmet} from "./classes/equipment/headwear/battle_helmet";
import {FellStarShield} from "./classes/equipment/shields/fell_star_shield";
import {OldBalletShoes} from "./classes/equipment/footwear/old_ballet_shoes";
import {BladeCrown} from "./classes/equipment/headwear/blade_crown";
import {Crossbow} from "./classes/equipment/weapons/crossbow";
import {DivineBow} from "./classes/equipment/weapons/divine_bow";
import {DoubleGlaive} from "./classes/equipment/weapons/double_glaive";
import {BookOfWebs} from "./classes/equipment/weapons/book_of_webs";

export function initPools() {
    Game.weaponPool = [Knife, AssassinDagger, LongSword, Bow, Scythe, MaidenDagger, BookOfFlames, Hammer, Pickaxe,
        PawnSwords, Crossbow, DivineBow, DoubleGlaive, BookOfWebs];
    Game.magicPool = [Aura, Spikes, Fireball, Necromancy, Petrification, Teleport, Wind, AbyssalSpit, EternalCross, Immortality];
    Game.chestItemPool = [Pickaxe,
        BasicShield, PassiveShield, SpikyShield, StunningShield, FellStarShield,
        SeerCirclet, WizardHat, VampireCrown, BattleHelmet, BladeCrown,
        BasicArmor, WizardRobe, HeavyArmor, ElectricArmor, Wings,
        AdventurerBoots, DamagingBoots, DarkBoots, OldBalletShoes,
        Heart];
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

export const BG_COLORS = {
    FLOODED_CAVE: 0xabcfd1,
    DARK_TUNNEL: 0x666666,
    RUINS: 0xd8d9d7,
    DUNNO: 0x75c978,
    FINALE: 0xcc76cc
};

export function setVariablesForStage() {
    switch (Game.stage) {
        case STAGE.FLOODED_CAVE:
            Game.BGColor = BG_COLORS.FLOODED_CAVE;
            assignRarityChances(55, 88, 97); // 55% 33% 9% 3%
            break;
        case STAGE.DARK_TUNNEL:
            Game.BGColor = BG_COLORS.DARK_TUNNEL;
            assignRarityChances(22, 78, 94); // 22% 56% 16% 6%
            break;
        case STAGE.RUINS:
            Game.BGColor = BG_COLORS.RUINS;
            assignRarityChances(10, 55, 91); // 10% 45% 36% 9%
            break;
        case STAGE.LABYRINTH:
            Game.BGColor = BG_COLORS.DUNNO;
            assignRarityChances(2, 36, 87); // 2% 34% 51% 13%
            break;
        case STAGE.FINALE:
            Game.BGColor = BG_COLORS.FINALE;
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