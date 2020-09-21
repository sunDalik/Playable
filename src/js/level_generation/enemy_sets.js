import {GraySpider} from "../classes/enemies/fc/spider_gray";
import {Roller} from "../classes/enemies/fc/roller";
import {Spider} from "../classes/enemies/fc/spider";
import {Snail} from "../classes/enemies/fc/snail";
import {SpikySnail} from "../classes/enemies/fc/snail_spiky";
import {Star} from "../classes/enemies/fc/star";
import {Eel} from "../classes/enemies/fc/eel";
import {DarkEel} from "../classes/enemies/fc/eel_dark";
import {PoisonEel} from "../classes/enemies/fc/eel_poison";
import {SmallMushroom} from "../classes/enemies/fc/mushroom_small";
import {KingFrog} from "../classes/enemies/fc/frog_king";
import {Frog} from "../classes/enemies/fc/frog";
import {Cocoon} from "../classes/enemies/fc/cocoon";
import {ParanoidEel} from "../classes/enemies/bosses/paranoid_eel";
import {GuardianOfTheLight} from "../classes/enemies/bosses/guardian_of_the_light";
import {Alligator} from "../classes/enemies/dt/alligator";
import {Rabbit} from "../classes/enemies/dt/rabbit";
import {RedSpider} from "../classes/enemies/dt/spider_red";
import {GreenSpider} from "../classes/enemies/dt/spider_green";
import {FireFrog} from "../classes/enemies/dt/frog_fire";
import {KingFireFrog} from "../classes/enemies/dt/frog_king_fire";
import {LizardWarrior} from "../classes/enemies/ru/lizard_warrior";
import {MudMage} from "../classes/enemies/ru/mud_mage";
import {TeleportMage} from "../classes/enemies/ru/teleport_mage";
import {WallSlime} from "../classes/enemies/ru/wall_slime";
import {Mushroom} from "../classes/enemies/fc/mushroom";
import {SpiderSmall} from "../classes/enemies/fc/spider_small";
import {FireSnail} from "../classes/enemies/dt/fire_snail";
import {ExplosivePixie} from "../classes/enemies/dt/explosive_pixie";
import {HexEye} from "../classes/enemies/ru/hex_eye";
import {BladeDemon} from "../classes/enemies/ru/blade_demon";
import {LavaSlime} from "../classes/enemies/ru/lava_slime";
import {LunaticLeader} from "../classes/enemies/bosses/lunatic_leader";
import {LostMage} from "../classes/enemies/dt/lost_mage";
import {DeadStar} from "../classes/enemies/dc/dead_star";
import {BombSkull} from "../classes/enemies/dc/bomb_skull";
import {DesertWorm} from "../classes/enemies/dc/desert_worm";
import {MiniStar} from "../classes/enemies/fc/mini_star";
import {PoisonousStar} from "../classes/enemies/fc/poisonous_star";
import {Crab} from "../classes/enemies/fc/crab";
import {MasterSpider} from "../classes/enemies/ru/master_spider";
import {DarkCrab} from "../classes/enemies/dt/dark_crab";
import {PoisonCactus} from "../classes/enemies/dc/poison_cactus";
import {FireCactus} from "../classes/enemies/dc/fire_cactus";
import {Phantom} from "../classes/enemies/dt/phantom";
import {Scorpion} from "../classes/enemies/dc/scorpion";
import {RedScorpion} from "../classes/enemies/dc/red_scorpion";
import {ScorpionQueen} from "../classes/enemies/bosses/scorpion_queen";

// 6 max
export const FCEnemySets = [
    [GraySpider, GraySpider, SpiderSmall],
    [Roller],
    [Spider],
    [GraySpider],
    [Snail],
    [SpikySnail],
    [Roller, Roller, Roller, Roller, Roller, Roller],
    [Star, Star, Star, Star],
    [Star, GraySpider],
    [Snail, Snail],
    [Snail, Snail, Snail],
    [Eel, Eel],
    [DarkEel],
    [PoisonEel],
    [SmallMushroom],
    [Eel],
    [SmallMushroom, SmallMushroom],
    [SmallMushroom, KingFrog],
    [KingFrog, KingFrog],
    [SmallMushroom, SmallMushroom, SmallMushroom, SmallMushroom, KingFrog],
    [Frog, Frog, Frog, Frog],
    [Frog, Frog],
    [Frog, Roller, Roller],
    [DarkEel, Snail],
    [DarkEel, Snail, Snail],
    [Spider, GraySpider, SmallMushroom],
    [Frog, SmallMushroom],
    [Frog, Eel, DarkEel],
    [PoisonEel, PoisonEel],
    [Star, PoisonEel, Star, PoisonEel],
    [Eel, Roller, Eel, Roller],
    [SpikySnail, Snail, SpikySnail, Snail],
    [SpikySnail, Spider, GraySpider],
    [SmallMushroom, Eel],
    [KingFrog],
    [KingFrog, PoisonEel],
    [KingFrog, Frog, Frog],
    [Eel, DarkEel, PoisonEel],
    [Eel, Spider],
    [Eel, Spider, Snail],
    [GraySpider, Snail],
    [GraySpider, Eel, Eel],
    [Spider, GraySpider],
    [Spider, Roller, Roller],
    [Spider, DarkEel],
    [Spider, DarkEel, DarkEel],
    [Spider, Snail],
    [GraySpider, SpikySnail],
    [Spider, SpikySnail],
    [GraySpider, SpiderSmall, Snail, Snail, Snail],
    [Eel, Eel, Eel, Eel, Eel],
    [Eel, Eel, Eel, Eel, Eel, Eel],
    [Eel, Eel, Eel, DarkEel, DarkEel, PoisonEel],
    [Eel, Frog, Snail],
    [Frog, Frog, Star, Star],
    [GraySpider, SpiderSmall, Snail, Snail],
    [Cocoon, Cocoon, Cocoon],
    [Cocoon],
    [Cocoon, Spider],
    [Cocoon, GraySpider],
    [Cocoon, GraySpider, Spider],
    [Cocoon, Cocoon, GraySpider, Spider],
    [Cocoon, Cocoon, Roller, GraySpider, Spider],
    [Cocoon, Snail, Snail, Cocoon],
    [Cocoon, Star, Star],
    [Cocoon],
    [Cocoon, Cocoon, Star],
    [Cocoon, Frog],
    [Cocoon, Cocoon, Eel, Eel],
    [Cocoon, DarkEel, Eel, Eel, Cocoon],
    [PoisonEel, Cocoon],
    [Roller, Roller, Roller, Roller, Spider],
    [Roller, Roller, Roller, Roller, Roller, Spider],
    [Roller, Roller, Roller, Roller, Roller, Star],
    [Roller, Roller, Roller, Roller, Roller, Frog],
    [Roller, Roller, Roller, Roller, Roller, Cocoon],
    [Mushroom],
    [SmallMushroom, Mushroom],
    [SmallMushroom, SmallMushroom, Mushroom],
    [SmallMushroom, SmallMushroom, Mushroom, Mushroom],
    [Roller, Mushroom, Roller],
    [Star, Mushroom, Star, Mushroom],
    [Mushroom, Mushroom],
    [Frog, Mushroom, KingFrog],
    [Eel, Mushroom, Eel],
    [Roller, Roller, Roller, Mushroom, Mushroom],
    [Cocoon, Mushroom, Mushroom],
    [Mushroom, Spider, Mushroom],
    [Mushroom, GraySpider, GraySpider],
    [Mushroom, Snail],
    [Mushroom, DarkEel, DarkEel],
    [Frog, Mushroom],
    [KingFrog, Mushroom],
    [Mushroom, SpikySnail, Snail],
    [SpiderSmall],
    [SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, SpiderSmall, SpiderSmall],
    [Cocoon, SpiderSmall],
    [Cocoon, SpiderSmall, SpiderSmall, SpiderSmall],
    [Cocoon, Cocoon, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, Snail, Snail],
    [SpiderSmall, Snail],
    [SpiderSmall, Spider],
    [SpiderSmall, Star, Star],
    [Roller, Roller, Roller, Roller, SpiderSmall, SpiderSmall],
    [GraySpider, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, SpikySnail],
    [MiniStar],
    [MiniStar, MiniStar],
    [MiniStar, MiniStar, MiniStar],
    [MiniStar, MiniStar, MiniStar, MiniStar],
    [MiniStar, MiniStar, SpiderSmall, SpiderSmall],
    [MiniStar, SpiderSmall],
    [MiniStar, Cocoon],
    [MiniStar, MiniStar, Cocoon],
    [MiniStar, MiniStar, Spider],
    [MiniStar, MiniStar, GraySpider],
    [MiniStar, MiniStar, SmallMushroom],
    [MiniStar, MiniStar, Frog, Frog],
    [MiniStar, Frog],
    [MiniStar, MiniStar, MiniStar, Frog, Frog, Frog],
    [MiniStar, SpiderSmall, SmallMushroom, Eel, Roller, Frog],
    [MiniStar, MiniStar, Star, Star],
    [MiniStar, Star],
    [MiniStar, MiniStar, Mushroom],
    [MiniStar, MiniStar, Roller, Roller],
    [MiniStar, Eel, Eel, Eel],
    [MiniStar, Eel, Eel],
    [MiniStar, Snail],
    [PoisonousStar],
    [PoisonousStar, PoisonousStar],
    [PoisonousStar, MiniStar, MiniStar],
    [MiniStar, Star, PoisonousStar],
    [PoisonousStar, Roller, Roller],
    [PoisonousStar, Roller, Roller, Roller, Roller],
    [PoisonousStar, PoisonEel],
    [PoisonousStar, Mushroom, SmallMushroom],
    [PoisonousStar, Spider],
    [PoisonousStar, SpiderSmall, SpiderSmall],
    [PoisonousStar, Cocoon],
    [PoisonousStar, Eel, Eel, Eel],
    [PoisonousStar, Snail, Snail],
    [MiniStar, MiniStar, Snail, Snail],
    [PoisonousStar, KingFrog],
    [PoisonousStar, Frog],
    [PoisonousStar, Frog, Frog],
    [PoisonousStar, Frog, Frog, Frog],
    [PoisonousStar, Spider, Mushroom, DarkEel, PoisonEel, KingFrog],
    [Crab],
    [Crab, Crab],
    [Crab, Crab, Crab],
    [Crab, Crab, Crab, Crab],
    [Crab, Crab, Crab, Crab, Crab, Crab],
    [Crab, Roller],
    [Roller, Roller],
    [Roller, Roller, Roller],
    [Crab, Crab, Roller, Roller],
    [Crab, Star, Crab, Star],
    [Crab, MiniStar, Crab, MiniStar],
    [Crab, Spider],
    [Crab, GraySpider],
    [Crab, Eel, Roller],
    [Crab, Crab, Eel, Eel, Roller, Roller],
    [Crab, SmallMushroom],
    [Crab, Crab, SmallMushroom, SmallMushroom],
    [Crab, Snail, Snail],
    [Crab, Crab, Frog, Frog],
    [Crab, SpiderSmall, SpiderSmall],
    [Crab, Crab, Cocoon],
    [Crab, Frog, Frog],
    [Crab, Mushroom],
    [Crab, SpikySnail],
    [SpikySnail, SpikySnail],
    [SpikySnail, SmallMushroom],
    [SpikySnail, SmallMushroom, SmallMushroom, SmallMushroom],
    [SpikySnail, Eel, Eel],
    [SpikySnail, Frog, Frog],
    [Crab, Star, MiniStar, Roller, Eel, DarkEel],
    [SpikySnail, DarkEel],
    [SpikySnail, Roller, Roller, Crab, Crab, Crab],
    [SpikySnail, Roller, Roller, Roller, Crab, Crab],
    [Crab, Crab, Roller, PoisonousStar],
    [Snail, Spider, Crab, MiniStar, Eel, Frog]
];

//boss comes first!
export const FCBossSets = [
    [ParanoidEel, Eel, Eel, Eel, Eel],
    [ParanoidEel, DarkEel, DarkEel],
    [ParanoidEel, PoisonEel]
];

// 5 max
export const DTEnemySets = [
    [Alligator, Alligator, Alligator, Rabbit, Rabbit],
    [Alligator, Alligator, Rabbit, Rabbit],
    [Alligator, Alligator, Rabbit],
    [Alligator, Alligator],
    [Alligator],
    [Rabbit],
    [Rabbit, Rabbit],
    [Rabbit, Rabbit, Rabbit],
    [Rabbit, Rabbit, Rabbit, Rabbit],
    [RedSpider],
    [RedSpider, Rabbit],
    [RedSpider, Rabbit, Rabbit],
    [GreenSpider],
    [GreenSpider, Rabbit],
    [GreenSpider, Rabbit, Alligator],
    [Cocoon],
    [Cocoon, Rabbit],
    [Cocoon, Alligator],
    [Rabbit, Alligator, Alligator, Rabbit],
    [Rabbit, Rabbit, Alligator],
    [FireFrog],
    [KingFireFrog],
    [KingFireFrog, FireFrog],
    [RedSpider, FireFrog],
    [GreenSpider, FireFrog],
    [FireFrog, FireFrog, FireFrog, Rabbit],
    [FireFrog, FireFrog, FireFrog],
    [KingFireFrog, KingFireFrog],
    [KingFireFrog, FireFrog, FireFrog],
    [KingFireFrog, Alligator],
    [Cocoon, KingFireFrog],
    [Cocoon, FireFrog],
    [Cocoon, FireFrog, FireFrog],
    [FireFrog, Alligator, Alligator],
    [GreenSpider, KingFireFrog],
    [GreenSpider, Rabbit, Rabbit, Rabbit],
    [RedSpider, Rabbit, Rabbit, Rabbit],
    [FireSnail],
    [ExplosivePixie],
    [FireSnail, FireSnail],
    [ExplosivePixie, ExplosivePixie],
    [ExplosivePixie, ExplosivePixie, ExplosivePixie],
    [ExplosivePixie, FireFrog, FireFrog],
    [ExplosivePixie, Rabbit, ExplosivePixie],
    [FireSnail, ExplosivePixie],
    [FireSnail, FireFrog, FireFrog],
    [FireSnail, KingFireFrog],
    [ExplosivePixie, Alligator, Alligator],
    [FireSnail, Alligator],
    [FireSnail, Cocoon],
    [ExplosivePixie, Cocoon],
    [FireSnail, FireSnail, FireSnail, ExplosivePixie, ExplosivePixie],
    [FireSnail, FireSnail, FireSnail],
    [ExplosivePixie, FireFrog, FireFrog, FireFrog, ExplosivePixie],
    [Cocoon, FireSnail, FireSnail],
    [FireSnail, FireSnail, Rabbit, Rabbit, Rabbit],
    [Cocoon, ExplosivePixie, Rabbit],
    [GreenSpider, ExplosivePixie],
    [GreenSpider, FireSnail],
    [RedSpider, FireSnail],
    [RedSpider, FireFrog, FireFrog],
    [ExplosivePixie, ExplosivePixie, Alligator, Alligator],
    [ExplosivePixie, Alligator, Alligator, Rabbit, FireSnail],
    [ExplosivePixie, ExplosivePixie, ExplosivePixie, Alligator, Alligator],
    [FireSnail, Alligator, Alligator, Rabbit, Rabbit],
    [FireSnail, Alligator, Alligator],
    [ExplosivePixie, Alligator],
    [LostMage],
    [LostMage, LostMage],
    [LostMage, LostMage, LostMage],
    [LostMage, LostMage, LostMage, LostMage],
    [LostMage, ExplosivePixie],
    [LostMage, Rabbit],
    [LostMage, Rabbit, Rabbit],
    [LostMage, Rabbit, Rabbit, Rabbit],
    [LostMage, Alligator],
    [LostMage, FireSnail],
    [LostMage, FireSnail, Rabbit],
    [LostMage, Alligator, Rabbit],
    [LostMage, FireFrog],
    [LostMage, LostMage, FireFrog],
    [LostMage, KingFireFrog],
    [LostMage, Cocoon],
    [LostMage, LostMage, Rabbit, Rabbit, Rabbit],
    [LostMage, LostMage, LostMage, Rabbit, Rabbit],
    [LostMage, LostMage, ExplosivePixie, ExplosivePixie],
    [DarkCrab],
    [DarkCrab, DarkCrab],
    [DarkCrab, DarkCrab, DarkCrab],
    [DarkCrab, DarkCrab, DarkCrab, DarkCrab],
    [DarkCrab, DarkCrab, DarkCrab, DarkCrab, DarkCrab],
    [DarkCrab, LostMage],
    [DarkCrab, DarkCrab, LostMage, LostMage],
    [DarkCrab, Alligator],
    [DarkCrab, FireSnail],
    [DarkCrab, DarkCrab, Alligator, FireSnail],
    [DarkCrab, DarkCrab, LostMage],
    [DarkCrab, LostMage, LostMage],
    [DarkCrab, Rabbit],
    [DarkCrab, DarkCrab, Rabbit, Rabbit],
    [DarkCrab, DarkCrab, DarkCrab, Rabbit, Rabbit],
    [DarkCrab, DarkCrab, Rabbit, Rabbit, Rabbit],
    [DarkCrab, FireFrog],
    [DarkCrab, FireFrog, FireFrog],
    [DarkCrab, DarkCrab, FireFrog, FireFrog],
    [DarkCrab, FireFrog, KingFireFrog],
    [DarkCrab, Cocoon],
    [DarkCrab, DarkCrab, DarkCrab, Alligator, Alligator],
    [DarkCrab, DarkCrab, DarkCrab, FireSnail, FireSnail],
    [DarkCrab, DarkCrab, Alligator, Alligator],
    [DarkCrab, DarkCrab, FireSnail, FireSnail],
    [DarkCrab, Alligator, FireSnail, ExplosivePixie, LostMage],
    [DarkCrab, Cocoon, Rabbit, ExplosivePixie, LostMage],
    [DarkCrab, GreenSpider, Rabbit, ExplosivePixie],
    [DarkCrab, RedSpider, Rabbit, ExplosivePixie],
    [Phantom],
    [Phantom, Phantom],
    [Phantom, Phantom, Phantom],
    [Phantom, Phantom, Phantom, Phantom],
    [Phantom, FireFrog],
    [Phantom, FireFrog, FireFrog],
    [Phantom, Cocoon],
    [Phantom, DarkCrab],
    [Phantom, DarkCrab, DarkCrab],
    [Phantom, Phantom, DarkCrab, DarkCrab],
    [Phantom, LostMage],
    [Phantom, Phantom, Phantom, LostMage, LostMage],
    [Phantom, ExplosivePixie],
    [Phantom, ExplosivePixie, ExplosivePixie],
    [Phantom, ExplosivePixie, FireSnail, LostMage, DarkCrab],
    [Phantom, Alligator, Rabbit, LostMage, DarkCrab],
    [Phantom, Cocoon, LostMage, DarkCrab, DarkCrab],
    [Phantom, GreenSpider],
    [Phantom, RedSpider],
    [Phantom, KingFireFrog],
    [Phantom, Rabbit],
    [Phantom, Rabbit, Rabbit],
    [Phantom, Phantom, FireFrog, KingFireFrog],
    [Phantom, Phantom, Rabbit, Rabbit],
    [Phantom, Phantom, Rabbit, Rabbit, Rabbit]
];

export const DTBossSets = [
    [GuardianOfTheLight]
];

// 4 max
export const RUEnemySets = [
    [LavaSlime],
    [BladeDemon],
    [HexEye],
    [LizardWarrior],
    [MudMage],
    [TeleportMage],
    [WallSlime],
    [LizardWarrior, LizardWarrior],
    [MudMage, WallSlime],
    [WallSlime, TeleportMage],
    [TeleportMage, MudMage],
    [LizardWarrior, TeleportMage],
    [LizardWarrior, MudMage],
    [LizardWarrior, LizardWarrior, MudMage, TeleportMage],
    [LizardWarrior, LizardWarrior, MudMage],
    [LizardWarrior, LizardWarrior, TeleportMage],
    [LizardWarrior, LizardWarrior, WallSlime],
    [WallSlime, WallSlime],
    [WallSlime, WallSlime, WallSlime],
    [LavaSlime, LavaSlime],
    [LavaSlime, LavaSlime, HexEye],
    [LavaSlime, LavaSlime, MudMage, MudMage],
    [LavaSlime, LavaSlime, LavaSlime, HexEye],
    [HexEye, HexEye],
    [HexEye, LavaSlime],
    [WallSlime, LavaSlime],
    [BladeDemon, LizardWarrior],
    [BladeDemon, BladeDemon],
    [BladeDemon, BladeDemon, BladeDemon],
    [HexEye, MudMage],
    [BladeDemon, HexEye],
    [HexEye, WallSlime, WallSlime, HexEye],
    [HexEye, WallSlime, WallSlime],
    [HexEye, HexEye, HexEye],
    [HexEye, HexEye, MudMage],
    [BladeDemon, WallSlime, LavaSlime, BladeDemon],
    [LavaSlime, LizardWarrior],
    [LavaSlime, MudMage],
    [TeleportMage, LavaSlime],
    [TeleportMage, WallSlime, WallSlime],
    [HexEye, LizardWarrior],
    [LizardWarrior, WallSlime],
    [BladeDemon, LavaSlime],
    [BladeDemon, WallSlime],
    [BladeDemon, BladeDemon, WallSlime],
    [BladeDemon, BladeDemon, WallSlime, WallSlime],
    [MudMage, BladeDemon],
    [TeleportMage, HexEye],
    [MasterSpider],
    [MasterSpider, MasterSpider],
    [MasterSpider, BladeDemon],
    [MasterSpider, HexEye],
    [MasterSpider, LizardWarrior],
    [MasterSpider, WallSlime],
    [MasterSpider, MudMage],
    [MasterSpider, TeleportMage],
    [MasterSpider, MudMage, MudMage],
    [MasterSpider, TeleportMage, TeleportMage],
    [MasterSpider, MudMage, TeleportMage],
    [MasterSpider, MasterSpider, MudMage],
    [MasterSpider, HexEye, BladeDemon],
    [MasterSpider, LavaSlime],
    [MasterSpider, MasterSpider, MasterSpider],
    [HexEye, BladeDemon, LizardWarrior, MasterSpider]
];

export const RUBossSets = [
    [LunaticLeader]
];

// most of them are copied from FC
// Replacements:
// Rollers are replaced with BombSkulls, SpikySnail is replaced with FireSnail,
// Added enemies:
// FireFrog, DeadStar, DesertWorm, PoisonCactus, FireCactus, Scorpion, RedScorpion
// Removed enemies:
// Eel, DarkEel, PoisonEel, KingFrog, MiniStar, PoisonousStar, SmallMushroom, Mushroom, Crab
export const DCEnemySets = [
    [GraySpider, GraySpider, SpiderSmall],
    [BombSkull],
    [Spider],
    [GraySpider],
    [Snail],
    [FireSnail],
    [BombSkull, BombSkull, BombSkull, BombSkull, BombSkull, BombSkull],
    [Star, Star, Star, Star],
    [Star, GraySpider],
    [Snail, Snail],
    [Snail, Snail, Snail],
    [PoisonCactus],
    [PoisonCactus, PoisonCactus],
    [FireCactus, FireFrog],
    [FireFrog, FireFrog],
    [PoisonCactus, PoisonCactus, PoisonCactus, PoisonCactus, Frog],
    [Frog, Frog, Frog, Frog],
    [Frog, Frog],
    [Frog, BombSkull, BombSkull],
    [Spider, DeadStar],
    [DeadStar],
    [Spider, GraySpider, PoisonCactus],
    [Frog, PoisonCactus],
    [FireSnail, Snail, FireSnail, Snail],
    [FireSnail, Spider, GraySpider],
    [FireFrog],
    [FireFrog, Frog, Frog],
    [GraySpider, Snail],
    [Spider, GraySpider],
    [Spider, BombSkull, BombSkull],
    [Spider, Snail],
    [GraySpider, FireSnail],
    [Spider, FireSnail],
    [GraySpider, SpiderSmall, Snail, Snail, Snail],
    [Frog, Frog, Star, Star],
    [GraySpider, SpiderSmall, Snail, Snail],
    [Cocoon, Cocoon, Cocoon],
    [Cocoon],
    [Cocoon, Spider],
    [Cocoon, GraySpider],
    [Cocoon, GraySpider, Spider],
    [Cocoon, Cocoon, GraySpider, Spider],
    [Cocoon, Cocoon, BombSkull, GraySpider, Spider],
    [Cocoon, Snail, Snail, Cocoon],
    [Cocoon, Star, Star],
    [Cocoon],
    [Cocoon, Cocoon, Star],
    [Cocoon, Frog],
    [BombSkull, BombSkull, BombSkull, BombSkull, Spider],
    [BombSkull, BombSkull, BombSkull, BombSkull, BombSkull, Spider],
    [BombSkull, BombSkull, BombSkull, BombSkull, BombSkull, Star],
    [BombSkull, BombSkull, BombSkull, BombSkull, BombSkull, Frog],
    [BombSkull, BombSkull, BombSkull, BombSkull, BombSkull, Cocoon],
    [DeadStar, Star],
    [DeadStar, BombSkull, BombSkull, BombSkull, BombSkull],
    [DeadStar, BombSkull, BombSkull],
    [FireCactus],
    [PoisonCactus, FireCactus],
    [PoisonCactus, PoisonCactus, FireCactus],
    [PoisonCactus, PoisonCactus, FireCactus, FireCactus],
    [BombSkull, FireCactus, BombSkull],
    [BombSkull, PoisonCactus, BombSkull],
    [Star, PoisonCactus, Star, FireCactus],
    [FireCactus, FireCactus],
    [Frog, PoisonCactus, FireFrog],
    [Frog, FireCactus, FireFrog],
    [Frog, FireCactus, PoisonCactus, FireFrog],
    [Frog, FireCactus],
    [FireFrog, PoisonCactus],
    [BombSkull, BombSkull, BombSkull, PoisonCactus, FireCactus],
    [Cocoon, PoisonCactus, PoisonCactus],
    [PoisonCactus, Spider, PoisonCactus],
    [PoisonCactus, GraySpider, GraySpider],
    [FireCactus, GraySpider],
    [PoisonCactus, Snail],
    [PoisonCactus, DeadStar],
    [PoisonCactus, FireSnail, Snail],
    [SpiderSmall],
    [SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, SpiderSmall, SpiderSmall],
    [Cocoon, SpiderSmall],
    [Cocoon, SpiderSmall, SpiderSmall, SpiderSmall],
    [Cocoon, Cocoon, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, Snail, Snail],
    [SpiderSmall, Snail],
    [SpiderSmall, Spider],
    [SpiderSmall, Star, Star],
    [BombSkull, BombSkull, BombSkull, BombSkull, SpiderSmall, SpiderSmall],
    [GraySpider, SpiderSmall, SpiderSmall],
    [SpiderSmall, SpiderSmall, FireSnail],
    [FireSnail, Snail],
    [FireSnail, SpiderSmall],
    [FireFrog, Frog],
    [FireFrog, Frog, Frog, FireFrog],
    [FireFrog, FireFrog, Frog],
    [DesertWorm],
    [DesertWorm, DesertWorm],
    [DesertWorm, DesertWorm, DesertWorm],
    [DesertWorm, DesertWorm, DesertWorm, DesertWorm],
    [DesertWorm, BombSkull],
    [DesertWorm, DesertWorm, BombSkull, BombSkull],
    [DesertWorm, BombSkull, BombSkull],
    [DesertWorm, DesertWorm, BombSkull],
    [DesertWorm, DesertWorm, Snail],
    [DesertWorm, Snail, Snail],
    [DesertWorm, Frog, FireFrog],
    [DesertWorm, DesertWorm, FireFrog, Frog, SpiderSmall],
    [DesertWorm, Star],
    [DesertWorm, Star, Star],
    [DesertWorm, DesertWorm, Star, Star],
    [DesertWorm, DesertWorm, DesertWorm, BombSkull, SpiderSmall, SpiderSmall],
    [DesertWorm, DesertWorm, DesertWorm, BombSkull, SpiderSmall, BombSkull],
    [DesertWorm, DesertWorm, Cocoon],
    [DesertWorm, DeadStar],
    [DeadStar, DeadStar],
    [DeadStar, Frog],
    [DeadStar, FireFrog],
    [DeadStar, Frog, FireFrog],
    [Scorpion],
    [Scorpion, Scorpion],
    [Scorpion, Scorpion, Scorpion],
    [Scorpion, Scorpion, Scorpion, Scorpion],
    [Scorpion, Scorpion, Scorpion, Scorpion, Scorpion],
    [Scorpion, Scorpion, Scorpion, Scorpion, Scorpion, Scorpion],
    [Scorpion, PoisonCactus],
    [Scorpion, FireCactus],
    [Scorpion, FireCactus, PoisonCactus],
    [Scorpion, Scorpion, PoisonCactus, FireCactus],
    [Scorpion, Scorpion, Scorpion, BombSkull, BombSkull, BombSkull],
    [Scorpion, DesertWorm],
    [Scorpion, Scorpion, DesertWorm],
    [Scorpion, DeadStar],
    [Scorpion, Scorpion, DeadStar],
    [Scorpion, DesertWorm, BombSkull, FireCactus, FireFrog, FireSnail],
    [Scorpion, DesertWorm, BombSkull, PoisonCactus, Frog, Snail],
    [Scorpion, Cocoon],
    [Scorpion, Scorpion, Cocoon],
    [Scorpion, Scorpion, SpiderSmall, SpiderSmall],
    [Scorpion, Scorpion, Scorpion, SpiderSmall, SpiderSmall, SpiderSmall],
    [Scorpion, Scorpion, Scorpion, SpiderSmall, SpiderSmall],
    [Scorpion, Scorpion, SpiderSmall, SpiderSmall, SpiderSmall],
    [Scorpion, DesertWorm, DesertWorm],
    [Scorpion, Spider],
    [Scorpion, GraySpider],
    [Scorpion, SpiderSmall],
    [Scorpion, Scorpion, Spider],
    [Scorpion, Scorpion, GraySpider],
    [Scorpion, Snail],
    [Scorpion, Scorpion, Snail],
    [Scorpion, Star],
    [Scorpion, Scorpion, Star],
    [Scorpion, BombSkull, BombSkull],
    [Scorpion, Scorpion, BombSkull, BombSkull],
    [Scorpion, Scorpion, Scorpion, BombSkull, BombSkull],
    [Scorpion, Frog],
    [Scorpion, FireFrog],
    [Scorpion, Scorpion, Frog],
    [Scorpion, Scorpion, FireFrog],
    [Scorpion, Scorpion, FireFrog, Frog],
    [Scorpion, Scorpion, Scorpion, Star],
    [Scorpion, Scorpion, Scorpion, Star, Star],
    [RedScorpion],
    [RedScorpion, RedScorpion],
    [RedScorpion, RedScorpion, RedScorpion],
    [RedScorpion, RedScorpion, RedScorpion, RedScorpion],
    [RedScorpion, Scorpion],
    [RedScorpion, RedScorpion, Scorpion, Scorpion, Scorpion],
    [RedScorpion, RedScorpion, Scorpion, Scorpion, Scorpion, Scorpion],
    [RedScorpion, DesertWorm],
    [RedScorpion, BombSkull, BombSkull],
    [RedScorpion, RedScorpion, BombSkull, BombSkull, BombSkull],
    [RedScorpion, FireFrog, FireFrog],
    [RedScorpion, DesertWorm, BombSkull, BombSkull, DeadStar],
    [RedScorpion, FireCactus, FireCactus],
    [RedScorpion, PoisonCactus, PoisonCactus],
    [RedScorpion, Frog],
    [RedScorpion, RedScorpion, Frog, Frog],
    [RedScorpion, RedScorpion, FireFrog, FireFrog],
    [RedScorpion, Star],
    [RedScorpion, Star, Star],
    [RedScorpion, RedScorpion, Star],
    [RedScorpion, RedScorpion, Scorpion, BombSkull, BombSkull, BombSkull],
    [RedScorpion, Scorpion, Scorpion, BombSkull, BombSkull, BombSkull],
    [RedScorpion, Scorpion, DesertWorm, DesertWorm],
    [RedScorpion, Snail],
    [Scorpion, FireSnail],
    [RedScorpion, RedScorpion, Snail],
    [Scorpion, Scorpion, Snail, Snail],
    [RedScorpion, Cocoon],
    [RedScorpion, Spider, Scorpion, Star],
    [RedScorpion, GraySpider, Scorpion, Star],
    [RedScorpion, RedScorpion, SpiderSmall, Frog, FireFrog]
];

export const DCBossSets = [
    [ScorpionQueen, Scorpion, Scorpion, Scorpion, Scorpion],
    [ScorpionQueen, RedScorpion, RedScorpion, RedScorpion]
];