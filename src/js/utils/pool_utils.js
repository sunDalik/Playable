import {Game} from "../game";
import {Bomb} from "../classes/equipment/bag/bomb";
import {removeItemFromPool} from "../game_changer";
import {RARITY, SLOT} from "../enums/enums";
import {randomChoice, randomShuffle} from "./random_utils";
import {Necromancy} from "../classes/equipment/magic/necromancy";
import {Spear} from "../classes/equipment/weapons/spear";
import {randomlyEnchantItem} from "../game_logic";

export function getRandomWeapon(canGetS = true) {
    if (Game.weaponPool.length === 0) return new Spear();
    const item = getItemFromPool(Game.weaponPool, canGetS);
    removeItemFromPool(item, Game.weaponPool);
    return item;
}

export function getRandomShopItem(forceWeapon = false, forceNonWeapon = false) {
    if (forceWeapon) return getRandomWeapon(false);
    if (forceNonWeapon) return getRandomNonWeaponItem(false);

    if (Math.random() * (Game.chestItemPool.length + Game.weaponPool.length) < Game.chestItemPool.length) {
        return getRandomNonWeaponItem(false);
    } else {
        return getRandomWeapon(false);
    }
}

export function getRandomBossPedestalItem() {
    return Math.random() < 0.6 ? getRandomNonWeaponItem() : getRandomWeapon();
}

export function getRandomChestItem() {
    return Math.random() < 0.7 ? getRandomNonWeaponItem() : getRandomWeapon();
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
                break;
            } else {
                pickAdvanced = false;
            }
        } else {
            const basicMagic = Game.magicPool.filter(m => m.requiredMagic === null);
            if (basicMagic.length > 0) {
                constructor = randomChoice(basicMagic);
                break;
            } else {
                pickAdvanced = true;
            }
        }
    }

    if (constructor === null) return new Necromancy();
    else return new constructor();
}

export function getRandomNonWeaponItem(canGetS = true) {
    if (Game.chestItemPool.length === 0) return new Bomb();
    const item = getItemFromPool(Game.chestItemPool, canGetS);
    removeItemFromPool(item, Game.chestItemPool);
    return item;
}

/**
 * Returns random item from the pool considering current rarity distribution
 * @param pool {Class[]}
 * @param canGetS {Boolean}
 * @returns {null|Class}
 */
function getItemFromPool(pool, canGetS = true) {
    if (pool.length === 0) return null;
    randomShuffle(pool);
    let attempt = 0;
    let constructor = null;
    while (attempt++ < 200 && constructor === null) {
        const rand = Math.random() * 100;
        for (const rarity of [RARITY.C, RARITY.B, RARITY.A, RARITY.S]) {
            if (rarity === RARITY.S && canGetS === false) continue;
            if (rand >= rarity.chanceFrom && rand <= rarity.chanceTo) {
                const filteredPool = pool.filter(item => (new item()).rarity === rarity);
                if (filteredPool.length !== 0) constructor = randomChoice(filteredPool);
                break;
            }
        }
    }
    if (constructor === null) constructor = randomChoice(pool);
    const item = new constructor();
    randomlyEnchantItem(item);
    return item;
}