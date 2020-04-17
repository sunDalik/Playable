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

//if you want an enemy with parameters you define them like Object.assign(Alligator, {params: [RABBIT_TYPE.ENERGY]})
//all params will be passed to constructor in given order
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
    [GraySpider, Snail]
];