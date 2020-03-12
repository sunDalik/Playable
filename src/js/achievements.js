import {ACHIEVEMENT_ID, STAGE, STORAGE} from "./enums";

export const achievements = [
    {
        id: ACHIEVEMENT_ID.BEAT_FC,
        description: "Beat Flooded Caves",
        image: "src/images/achievements/beat_fc.png"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_FC,
        description: "Beat Dark Tunnel",
        image: "src/images/achievements/beat_dt.png",
        description_locked: "Beat level 2"
    },
    {
        id: ACHIEVEMENT_ID.BEAT_ANY_BOSS_NO_DAMAGE,
        description: "Beat any boss without taking damage",
        image: "src/images/achievements/beat_any_boss_no_damage.png"
    }];


export function completeBeatStageAchievements(stage) {
    switch (stage) {
        case STAGE.FLOODED_CAVE:
            completeAchievement(ACHIEVEMENT_ID.BEAT_FC);
            break;
        case STAGE.DARK_TUNNEL:
            completeAchievement(ACHIEVEMENT_ID.BEAT_DT);
            break;
    }
}

export function completeAchievement(achievement_id) {
    const storage = JSON.parse(window.localStorage[STORAGE.ACHIEVEMENTS]);
    if (storage[achievement_id] === 0) {
        storage[achievement_id] = 1;
        showAchievementAnimation(achievements.find(achievement => achievement.id === achievement_id));
        window.localStorage[STORAGE.ACHIEVEMENTS] = storage;
    }
}

export function showAchievementAnimation(achievement) {

}
