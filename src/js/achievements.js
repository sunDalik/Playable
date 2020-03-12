import {ACHIEVEMENT_ID, STAGE, STORAGE} from "./enums";

export const achievements_default = [
    {id: ACHIEVEMENT_ID.BEAT_FC, description: "Beat Flooded Caves", image: "", completed: false},
    {
        id: ACHIEVEMENT_ID.BEAT_FC,
        description: "Beat Dark Tunnel",
        image: "",
        description_locked: "Beat level 2",
        completed: false
    },
    {
        id: ACHIEVEMENT_ID.BEAT_ANY_BOSS_NO_DAMAGE,
        description: "Beat any boss without taking damage",
        image: "",
        completed: false
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
    const achievement = storage.find(achievement => achievement.id === achievement_id);
    if (achievement.completed === false) {
        achievement.completed = true;
        showAchievementAnimation(achievement);
        window.localStorage[STORAGE.ACHIEVEMENTS] = storage;
    }
}

export function showAchievementAnimation(achievement) {

}
