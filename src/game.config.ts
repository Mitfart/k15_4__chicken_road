import {GameConfig, LevelConfig} from "./GAME/game/game.types.ts";

export const LEVEL_CONFIG: LevelConfig = {
    startSize: 362,
    segmentSize: 230,
    finishOffset: -18,
    spawnOffset: -65,
    endOffset: 100,
    barrierPos: 75,
    carPos: 150,
    carDuration: .75,
    hatchDuration: .25,
    values: [
        2120,
        3415,
        5100,
        7800,
        7800 + 5000,
        21000,
    ],
    values_view: [
        "x1.5",
        "-",
        "x4.5",
        "x5.5",
        "x11.5",
        "BONUS \n GAME",
    ],
};

export const GAME_CONFIG: GameConfig = {
    initialBalance: 1500,
    betAmount: 0,
    level: LEVEL_CONFIG
};
