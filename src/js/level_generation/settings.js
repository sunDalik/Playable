// I dont really like it... can't come up with any other concise way of setting up generator tho...
export class Settings {
    constructor(minLevelWidth, maxLevelWidth, minLevelHeight, maxLevelHeight, enemySets, bossSets, openSpace = false, minRoomSize = 7, minRoomArea = 54) {
        this.minLevelWidth = minLevelWidth;
        this.maxLevelWidth = maxLevelWidth;
        this.minLevelHeight = minLevelHeight;
        this.maxLevelHeight = maxLevelHeight;
        this.enemySets = enemySets;
        this.bossSets = bossSets;
        this.openSpace = openSpace;
        this.minRoomSize = minRoomSize;
        this.minRoomArea = minRoomArea;
    }
}