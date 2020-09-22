import {randomChoice} from "../utils/random_utils";
import {STAGE} from "../enums/enums";
import {Game} from "../game";

export function getRandomTip() {
    const tips = [
        "Every time your characters die, they both lose 1 heart container",
        "Destroying active obelisk causes dead enemies to revive and alive enemies to get +0.25 attack",
        "Destroying active obelisk gives you 2 random magic, but you can pick up both",
        "Wielding two identical weapons causes you to attack twice in one turn: before and after enemies",
        "You can make a sacrifice to an obelisk. You will lose a heart, but get 2 more magic to choose from",
        "The maximum amount of heart containers you can get is 10",
        "White triangle has x0.5 ATK multiplier and x1 DEF multiplier",
        "Black triangle has x1 ATK multiplier and x0.5 DEF multiplier",
        "Treasure walls drop a key most of the time, but they can also drop a chest or a potion",
        "If you hold SHIFT while moving, you will move without attacking. This allows to escape tricky situations when you have a long-range weapon",
        "Using bag while holding SHIFT drops your bag item instead of using it",
        "When both characters stand on the same tile, only the top one takes damage from enemies and can attack. Press Z to switch positions",
        "Magic and shields restore half of their max uses every floor if their wielder is alive",
        "Obelisks have 100% chance to offer Necromancy magic if one of the characters is dead upon obelisk's activation",
        "Bosses can't be stunned by any means",
        "Bosses drop less healing potions if one of the characters is dead",
        "You get 2 items if you beat a boss without taking damage",
        "Stunned enemies skip their turn",
        "There are 4 rarities of items: C (white), B (blue), A (green) and S (gold)",
        "When your stat is halved because of the multiplier, it always rounds UP to quarters",
        "Sometimes you will encounter giant enemies. They have x2 times more HP and attack",
        "Sometimes you will encounter tiny enemies. They have x4 times less HP and attack",
        "Magic books are powerful, but after using them up you need to focus for a few turns to use them again",
        "Magic books are magical weapons and thus they benefit from both attack and magic attack bonuses",
        "Minion attack isn't affected by your attack multiplier and normal attack bonuses",
        "Shields don't protect you from floor hazards",
        "The rarer a chest is, the more keys you will need to open it",
        "Items from shops are 1 key more expensive than corresponding items from chests",
        "It takes two explosions to destroy a chest. If you destroy an unopened chest, it will drop 1 key",
        "If you have a negative defense, you will take more damage"
    ];

    if (Game.stage === STAGE.DARK_TUNNEL) {
        tips.push("Don't wander in the darkness. Darkness damages you");
    } else if (Game.stage === STAGE.RUINS) {
        tips.push("Lizard Warriors always chase one character and completely ignore the other. Use this to your advantage");
    } else if (Game.stage === STAGE.DRY_CAVE) {
        //tips.push("Dead Stars, unlike normal Stars, try to predict your movement");
    }

    return randomChoice(tips);
}