import {Game} from "../../plugins/Game/Game.ts";
import {Level} from "./game/Level.ts";
import {Chicken} from "./game/Chicken.ts";
import {Container, Text} from "pixi.js";
import Bank from "../UI/Bank.ts";
import Header from "../UI/Header.ts";
import Contols from "../UI/Contols.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimPulseIn, Play} from "../../plugins/Utils/Animations.ts";


let _game!: Game;

let level!: Level;
const specials: ({ id: number, func: () => void })[] = [
    // { id: 5, (game) => { game.ui.add(...) } }
];

let chicken!: Chicken;
const chickenJump = {
    height: 25,
    duration: .5
};

let playFunction: () => void = () => { };
let blockInput: boolean = false;

let cashBlock!: { container: Container, view: Text };

let score: number = 0;


export async function Main(game: Game) {
    // ===========================================================================================
    _game = game;

    level = game.container.addChild(new Level());
    chicken = game.container.addChild(new Chicken(chickenJump.height, chickenJump.duration));

    game.resizer.addResizeAction((w, h) => {
        game.container.scale.set(Math.max(
            1,
            w / level.width,
            h / level.height
        ));

        level.position.set(0, h * .5 / game.container.scale.y);

        chicken.position.set(level.currentPosition, level.position.y);
    });

    // ===========================================================================================

    game.ui.setFollowObject(chicken, {x: .3, y: .5});
    game.ui.setFollowBounds(level);

    // ===========================================================================================

    level.nextSegment?.target();
    level.startRandomDriveThrow();

    playFunction = play;

    // ===========================================================================================

    const header = await Header.Construct(game);
    const controls = await Contols.Construct(game);
    const playBtnAnim = Play(AnimPulseIn(controls.playBtn, .25, .5));

    OnClick(controls.playBtn, () => {
        if (blockInput) return;

        blockInput = true;
        playBtnAnim();
        playFunction();
    });

    // ===========================================================================================

}


async function play() {
    if (chicken.isJumping
        || level.nextSegment?.Available
        || level.currentSegment?.Available
        || level.currentSegmentID >= level.length - 1)
        return;

    level.currentSegmentID++;

    level.prevSegment?.complete();

    chicken.jumpTo(level.currentPosition, level.position.y, () => {
        level.currentSegment?.activate();
        level.nextSegment?.target();

        const special = specials.find(s => s.id === level.currentSegmentID);
        if (special) {
            special.func();
        } else {
            // setScore(level.currentSegment?.value || 0);
        }

        if (level.currentSegmentID >= level.length - 1) {
            Bank.Show(_game, 2);
        } else {
            blockInput = false;
        }
    });
}