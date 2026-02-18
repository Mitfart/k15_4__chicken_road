export interface LevelConfig {
    startSize: number;
    segmentSize: number;
    finishOffset: number;
    spawnOffset: number;
    endOffset: number;
    barrierPos: number;
    carPos: number;
    carDuration: number;
    hatchDuration: number;
    values: number[];
    values_view: string[];
}

export interface GameConfig {
    initialBalance: number;
    betAmount: number;
    level: LevelConfig;
}