import {GameConfig, LevelConfig} from "./GAME/game/game.types.ts";

export const LEVEL_CONFIG: LevelConfig = {
    startSize: 150,
    segmentSize: 200,
    finishOffset: -18,
    spawnOffset: 100,
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
        "x2",
        "x4",
        "x11",
        "x18",
        "-",
        "x31",
    ],
};

export const GAME_CONFIG: GameConfig = {
    initialBalance: 1500,
    betAmount: 0,
    level: LEVEL_CONFIG
};
