class Enchantment {
    constructor(prefix) {
        this.prefix = prefix;
    }
}

// ???
// not entirely sure what I'm doing
export const ENCHANTMENT_TYPE = Object.freeze({
    NONE: new Enchantment(""),
    DIVINE: new Enchantment("Divine"),
    CURSED: new Enchantment("Cursed")
});