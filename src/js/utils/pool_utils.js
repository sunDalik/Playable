import {Game} from "../game";
import {Bomb} from "../classes/equipment/bag/bomb";
import {removeItemFromPool} from "../game_changer";
import {RARITY, SLOT} from "../enums";
import {randomChoice, randomShuffle} from "./random_utils";
import {Necromancy} from "../classes/equipment/magic/necromancy";

export function getRandomWeapon() {
    if (Game.weaponPool.length === 0) return null;
    const constructor = getItemFromPool(Game.weaponPool);
    return new constructor();
}

export function getRandomSpell() {
    if (Game.magicPool.length === 0) return new Necromancy();
    randomShuffle(Game.magicPool);
    let constructor = null;
    const playersMagic = [];
    for (const player of [Game.player, Game.player2]) {
        playersMagic.push(player[SLOT.MAGIC1]);
        playersMagic.push(player[SLOT.MAGIC2]);
        playersMagic.push(player[SLOT.MAGIC3]);
    }
    const totalMagicSlots = 6;
    const advancedChance = playersMagic.reduce((acc, val) => val !== null ? ++acc : acc, 0) / totalMagicSlots;
    let pickAdvanced = Math.random() < advancedChance;
    for (let i = 0; i < 2; i++) {
        if (pickAdvanced) {
            const advancedMagic = Game.magicPool.filter(m => m.requiredMagic !== null
                && (Game.player.getMagicByConstructor(m.requiredMagic) !== null || Game.player2.getMagicByConstructor(m.requiredMagic) !== null));
            if (advancedMagic.length > 0) {
                constructor = randomChoice(advancedMagic);
            } else {
                pickAdvanced = false;
            }
        } else {
            const basicMagic = Game.magicPool.filter(m => m.requiredMagic === null);
            if (basicMagic.length > 0) {
                constructor = randomChoice(basicMagic);
            } else {
                pickAdvanced = true;
            }
        }
    }

    if (constructor === null) return new Necromancy();
    else return new constructor();
}

export function getRandomChestDrop() {
    if (Game.chestItemPool.length === 0) return new Bomb();
    const constructor = getItemFromPool(Game.chestItemPool);
    const item = new constructor();
    removeItemFromPool(item, Game.chestItemPool);
    return item;
}

/**
 * Returns random item from the pool considering current rarity distribution
 * @param pool {Class[]}
 * @returns {null|Class}
 */
function getItemFromPool(pool) {
    if (pool.length === 0) return null;
    randomShuffle(pool);
    let attempt = 0;
    let item = null;
    while (attempt++ < 200 && item === null) {
        const rand = Math.random() * 100;
        for (const rarity of [RARITY.C, RARITY.B, RARITY.A, RARITY.S]) {
            if (rand >= rarity.chanceFrom && rand <= rarity.chanceTo) {
                const filteredPool = pool.filter(item => (new item()).rarity === rarity);
                if (filteredPool.length !== 0) item = randomChoice(filteredPool);
                break;
            }
        }
    }
    if (item === null) return randomChoice(pool);
    else return item;
}