import {GraySpider} from "../classes/enemies/spider_gray";
import {Roller} from "../classes/enemies/roller";
import {Spider} from "../classes/enemies/spider";
import {Snail} from "../classes/enemies/snail";
import {SpikySnail} from "../classes/enemies/snail_spiky";
import {Star} from "../classes/enemies/star";
import {Eel} from "../classes/enemies/eel";
import {DarkEel} from "../classes/enemies/eel_dark";
import {PoisonEel} from "../classes/enemies/eel_poison";
import {SmallMushroom} from "../classes/enemies/mushroom_small";
import {KingFrog} from "../classes/enemies/frog_king";
import {Frog} from "../classes/enemies/frog";
import {RedStar} from "../classes/enemies/star_red";
import {Cocoon} from "../classes/enemies/cocoon";
import {ParanoidEel} from "../classes/enemies/bosses/paranoid_eel";
import {GuardianOfTheLight} from "../classes/enemies/bosses/guardian_of_the_light";
import {Alligator} from "../classes/enemies/alligator";
import {Rabbit} from "../classes/enemies/rabbit";
import {RedSpider} from "../classes/enemies/spider_red";
import {GreenSpider} from "../classes/enemies/spider_green";
import {FireFrog} from "../classes/enemies/frog_fire";
import {KingFireFrog} from "../classes/enemies/frog_king_fire";
import {LizardWarrior} from "../classes/enemies/lizard_warrior";
import {MudMage} from "../classes/enemies/mud_mage";
import {TeleportMage} from "../classes/enemies/teleport_mage";
import {WallSlime} from "../classes/enemies/wall_slime";

export const FCEnemySets = [
    [GraySpider, GraySpider, GraySpider],
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
    [Spider, RedStar],
    [RedStar],
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
    [GraySpider, GraySpider, Snail, Snail, Snail],
    [Eel, Eel, Eel, Eel, Eel],
    [Eel, Eel, Eel, Eel, Eel, Eel],
    [Eel, Eel, Eel, DarkEel, DarkEel, PoisonEel],
    [Eel, Frog, Snail],
    [Frog, Frog, Star, Star],
    [GraySpider, GraySpider, Snail, Snail],
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
    [RedStar, Star],
    [RedStar, Roller, Roller, Roller, Roller],
    [RedStar, Roller, Roller],
    [RedStar, Eel, Eel]
];

//boss comes first!
export const FCBossSets = [
    [ParanoidEel, Eel, Eel, Eel, Eel],
    [ParanoidEel, DarkEel, DarkEel]
];

export const DTEnemySets = [
    [Alligator, Alligator, Alligator, Alligator, Alligator],
    [Alligator, Alligator, Alligator, Alligator],
    [Alligator, Alligator, Alligator],
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
    [RedSpider, FireFrog],
    [GreenSpider, FireFrog],
    [FireFrog, FireFrog, FireFrog, Rabbit],
    [FireFrog, FireFrog, FireFrog],
    [KingFireFrog, KingFireFrog],
    [KingFireFrog, FireFrog, FireFrog],
    [KingFireFrog, FireFrog, FireFrog],
    [KingFireFrog, Alligator],
    [Cocoon, KingFireFrog],
    [FireFrog, Alligator, Alligator]
];

export const DTBossSets = [
    [GuardianOfTheLight]
];

export const RUEnemySets = [
    [LizardWarrior, LizardWarrior],
    [LizardWarrior],
    [MudMage],
    [TeleportMage],
    [WallSlime],
    [MudMage, WallSlime],
    [WallSlime, TeleportMage, TeleportMage],
    [TeleportMage, MudMage],
    [TeleportMage, MudMage, MudMage],
    [LizardWarrior, TeleportMage, TeleportMage],
    [LizardWarrior, MudMage, MudMage],
    [MudMage, LizardWarrior],
    [LizardWarrior, TeleportMage],
    [LizardWarrior, LizardWarrior, MudMage, TeleportMage, MudMage],
    [MudMage, MudMage, LizardWarrior, LizardWarrior],
    [LizardWarrior, TeleportMage, TeleportMage, MudMage, MudMage],
    [LizardWarrior, LizardWarrior, WallSlime],
    [LizardWarrior, WallSlime, LizardWarrior, MudMage],
    [LizardWarrior, TeleportMage, MudMage],
    [WallSlime, WallSlime]
];

export const RUBossSets = [
    [LizardWarrior] //temp
];