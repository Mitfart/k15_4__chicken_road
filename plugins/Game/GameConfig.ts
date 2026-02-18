export interface GameConfig {
    readonly designSize: { x: number, y: number };
    readonly background: string,
    readonly padding: { x: number, y: number };
    readonly REM: number; // FONT SIZE AND RELATIVE SIZING
    readonly fontFamily: string;
    readonly uiScale?: { min: number, max: number };
}