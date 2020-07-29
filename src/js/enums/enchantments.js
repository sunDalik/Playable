class Enchantment {
    constructor(prefix, description) {
        this.prefix = prefix;
        this.description = description;
    }
}

// ???
// not entirely sure what I'm doing
export const ENCHANTMENT_TYPE = Object.freeze({
    NONE: new Enchantment("", ""),
    DIVINE: new Enchantment("Divine", "DIVINE: +0.5 atk, attacked enemies spread damage"),
    CURSED: new Enchantment("Cursed", "CURSED: +1 heart, you can't take this item off"),
    NIGHTMARE: new Enchantment("Nightmare", "NIGHTMARE: killed enemies spawn ghost minions")
});