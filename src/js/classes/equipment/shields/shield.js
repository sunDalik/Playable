export class Shield {
    constructor() {
        this.maxUses = undefined;
        this.uses = this.maxUses;
        this.exhausted = false;
    }

    activate(wielder) {
        if (this.uses <= 0) return false;
        this.uses--;
        if (this.uses <= 0) this.exhausted = true;
        return true;
    }

    onBlock(source, wielder) {
    }
}