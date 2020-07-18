class DamageType {
    //guys I know weaponal is not a word it's just kind of easier to understand to me
    constructor(weaponal, hazardal, magical, divine) {
        this.weaponal = weaponal;
        this.hazardal = hazardal;
        this.magical = magical;
        this.divine = divine;
    }
}

export const DAMAGE_TYPE = Object.freeze({
    PHYSICAL_WEAPON: new DamageType(true, false, false, false),
    MAGICAL_WEAPON: new DamageType(true, false, true, false),
    MAGICAL: new DamageType(false, false, true, false),
    HAZARDAL: new DamageType(false, true, false, false),
    DIVINE: new DamageType(false, true, false, true)
});