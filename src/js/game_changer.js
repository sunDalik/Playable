import {Spikes} from "./classes/equipment/magic/spikes";
import {Necromancy} from "./classes/equipment/magic/necromancy";
import {Wind} from "./classes/equipment/magic/wind";
import {LeatherArmor} from "./classes/equipment/armor/leather";
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
import {MaidenShortSword} from "./classes/equipment/weapons/maiden_short_sword";
import {BookOfFlames} from "./classes/equipment/weapons/book_of_flames";
import {Hammer} from "./classes/equipment/weapons/hammer";
import {Pickaxe} from "./classes/equipment/tools/pickaxe";
import {SpikyShield} from "./classes/equipment/shields/spiky";
import {StunningShield} from "./classes/equipment/shields/stunning";
import {Game} from "./game";
import {RARITY, STAGE} from "./enums/enums";
import {AbyssalSpit} from "./classes/equipment/magic/abyssal_spit";
import {PawnSwords} from "./classes/equipment/weapons/pawn_swords";
import {Immortality} from "./classes/equipment/magic/immortality";
import {LifeFruit} from "./classes/equipment/one_time/life_fruit";
import {BattleHelmet} from "./classes/equipment/headwear/battle_helmet";
import {FellStarShield} from "./classes/equipment/shields/fell_star_shield";
import {OldBalletShoes} from "./classes/equipment/footwear/old_ballet_shoes";
import {BladeCrown} from "./classes/equipment/headwear/blade_crown";
import {Crossbow} from "./classes/equipment/weapons/crossbow";
import {DivineBow} from "./classes/equipment/weapons/divine_bow";
import {BookOfWebs} from "./classes/equipment/weapons/book_of_webs";
import {BookOfThunders} from "./classes/equipment/weapons/book_of_thunders";
import {BookOfIce} from "./classes/equipment/weapons/book_of_ice";
import {GoldenShield} from "./classes/equipment/shields/golden";
import {WoodenShield} from "./classes/equipment/shields/wooden_shield";
import {Transcendence} from "./classes/equipment/magic/transcendence";
import {VampireSpikes} from "./classes/equipment/magic/vampire_spikes";
import {InfernalSpikes} from "./classes/equipment/magic/infernal_spikes";
import {HeartShapedKey} from "./classes/equipment/one_time/heart_shaped_key";
import {Light} from "./classes/equipment/magic/light";
import {SunBlessing} from "./classes/equipment/magic/sun_blessing";
import {CrystalWind} from "./classes/equipment/magic/crystal_wind";
import {CrystalGuardian} from "./classes/equipment/magic/crystal_guardian";
import {AttackLink} from "./classes/equipment/magic/attack_link";
import {DefenseLink} from "./classes/equipment/magic/defense_link";
import {Thunderstorm} from "./classes/equipment/magic/thunderstorm";
import {EmpyrealWrath} from "./classes/equipment/magic/empyreal_wrath";
import {Escape} from "./classes/equipment/magic/escape";
import {BronzeArmor} from "./classes/equipment/armor/bronze";
import {WitchHat} from "./classes/equipment/headwear/witch_hat";
import {VialOfIchor} from "./classes/equipment/one_time/vial_of_ichor";
import {GoldenDagger} from "./classes/equipment/weapons/golden_dagger";
import {Boomeraxe} from "./classes/equipment/weapons/boomeraxe";
import {Prismaxe} from "./classes/equipment/weapons/prismaxe";
import {CerberusBow} from "./classes/equipment/weapons/cerberus_bow";
import {FlaskOfFire} from "./classes/equipment/accessories/flask_of_fire";
import {PossessedSandals} from "./classes/equipment/footwear/possessed_sandals";
import {QuiverOfTheForestSpirit} from "./classes/equipment/accessories/quiver_of_the_forest_spirit";
import {WeaponMasterEmblem} from "./classes/equipment/accessories/weapon_master_emblem";
import {HeroKey} from "./classes/equipment/accessories/hero_key";
import {DemonHeart} from "./classes/equipment/one_time/demon_heart";
import {ExplosiveRage} from "./classes/equipment/magic/explosive_rage";

//we don't want for the same weapon to appear twice on a level so we remove objects from this pool once picked but restore the pool completely on a new level
export function regenerateWeaponPool() {
    Game.weaponPool = [Knife, GoldenDagger, Boomeraxe, AssassinDagger, LongSword, Bow, Scythe, MaidenShortSword, BookOfFlames, Hammer, Pickaxe,
        PawnSwords, Crossbow, DivineBow, BookOfWebs, BookOfThunders, BookOfIce, Prismaxe, CerberusBow];
}

export function initPools() {
    regenerateWeaponPool();
    Game.magicPool = [Light, SunBlessing, Wind, CrystalWind, CrystalGuardian, DefenseLink, Thunderstorm, EmpyrealWrath,
        Spikes, VampireSpikes, InfernalSpikes, AbyssalSpit, Immortality, Transcendence, AttackLink, Escape, ExplosiveRage,
        Necromancy];
    Game.chestItemPool = [FlaskOfFire, QuiverOfTheForestSpirit, WeaponMasterEmblem, HeroKey,
        WoodenShield, SpikyShield, StunningShield, FellStarShield, GoldenShield,
        WizardHat, WitchHat, VampireCrown, BattleHelmet, SeerCirclet, BladeCrown,
        LeatherArmor, BronzeArmor, ElectricArmor, WizardRobe, HeavyArmor, Wings,
        AdventurerBoots, DamagingBoots, DarkBoots, OldBalletShoes, PossessedSandals,
        DemonHeart, LifeFruit, HeartShapedKey, VialOfIchor];
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
    if (Game.stage === STAGE.RUINS) Game.chainLength = 15;
    else Game.chainLength = 10;

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