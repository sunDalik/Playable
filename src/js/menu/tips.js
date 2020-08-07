import {randomChoice} from "../utils/random_utils";

export function getRandomTip() {
    const tips = [
        "Every time your characters die, they both lose 1 health container",
        "Destroying active obelisk causes dead enemies to revive and alive enemies to get +0.25 atk",
        "Destroying active obelisk gives you 2 random magic, but you can pick up both",
        "Wielding two identical weapons causes you to attack twice in one turn: before and after enemy turn",
        "You can make a sacrifice to an obelisk. You will lose a heart, but get 2 more magic to choose from",
        "The maximum amount of health containers you can get is 10",
        "White triangle has x0.5 atk multiplier and x1 def multiplier. Minions go very well with her because atk multiplier does not affect minion attack",
        "Black triangle has x1 atk multiplier and x0.5 def multiplier",
        "Treasure walls drop a key most of the time, but they can also drop a chest or a potion.",
        "If you hold SHIFT while moving, you will move without attacking. This allows to escape tricky situations when you have a long-range weapon",
        "Using bag while holding shift drops your bag item instead of using it",
        "When both characters stand on the same tile only the top one takes damage and can attack. Press Z to switch positions",
        "There is a secret room in Flooded Caves. You can spot it if you open a minimap after clearing the entire level",
        "Magic and shields restore half of their max uses every floor if their wielder is alive",
        "Obelisks have 100% chance to contain Necromancy magic if one of the characters is dead upon obelisk's activation",
        "Bosses can't be stunned by any mean",
        "Bosses drop less healing potions if one of the characters is dead",
        "You get 2 items if you beat a boss without taking damage"
    ];

    return randomChoice(tips);
}