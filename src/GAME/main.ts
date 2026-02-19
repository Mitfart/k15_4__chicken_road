import {Game} from "../../plugins/Game/Game.ts";
import {Level} from "./game/Level.ts";
import {Chicken} from "./game/Chicken.ts";
import Bank from "../UI/Bank.ts";
import Header, {HeaderScreen} from "../UI/Header.ts";
import Contols, {ControlsScreen} from "../UI/Contols.ts";
import {OnClick} from "../../plugins/Utils/UIEvents.ts";
import {AnimPulseIn, Play} from "../../plugins/Utils/Animations.ts";
import Packshot from "../UI/Packshot.ts";
import Chest from "../UI/Chest.ts";
import Wheel from "../UI/Wheel.ts";
import {sound} from "@pixi/sound";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import sdk from "@smoud/playable-sdk";


let _game!: Game;

let level!: Level;
const specials: ({ id: number, func: () => void })[] = [
    // { id: 5, (game) => { game.ui.add(...) } }
    { id: 2, func: async () => {
        blockInput = true;
        await Chest.Show(_game, () => blockInput = false);
    } },
    { id: 6, func: async () => {
        sound.play(AssetsDB.audio.wheel);

        blockInput = true;
        await Wheel.Show(_game, () => blockInput = false);
    } }
];

let chicken!: Chicken;
const chickenJump = {
    height: 25,
    duration: .5
};

let playFunction: () => void = () => { };
let blockInput: boolean = false;

let score: number = 0;

let header!: HeaderScreen;
let controls!: ControlsScreen;


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

        level.position.set(0, h * .4 / game.container.scale.y);

        chicken.position.set(level.currentPosition, level.position.y);
    });

    // ===========================================================================================

    game.ui.setFollowObject(chicken, {x: .3, y: .5});
    game.ui.setFollowBounds(level);

    // ===========================================================================================

    level.nextSegment?.target();
    level.startRandomDriveThrow();

    sound.play(AssetsDB.audio.music);

    // ===========================================================================================

    header = await Header.Construct(game);
    controls = await Contols.Construct(game);
    const playBtnAnim = Play(AnimPulseIn(controls.playBtn, .25, .5));

    OnClick(controls.playBtn, () => {
        if (blockInput) return;
        blockInput = true;

        playBtnAnim();
        play();
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

    sound.play(AssetsDB.audio.click);

    level.prevSegment?.complete();

    chicken.jumpTo(level.currentPosition, level.position.y, async () => {
        level.currentSegment?.activate();
        level.nextSegment?.target();

        const special = specials.find(s => s.id === level.currentSegmentID);
        if (special) {
            special.func();
            return;
        } else {
            setScore(level.currentSegment?.value || 0);
        }

        if (level.currentSegmentID >= level.length - 1) {
            await Bank.Show(_game, 2);

            await new Promise((resolve) => setTimeout(resolve, 500) );

            const packshot = await Packshot.Construct(_game);
            packshot.container.show();

            OnClick(packshot.btn, () => {
                sound.play(AssetsDB.audio.click);

                sdk.install();
            });

            await Bank.Hide();
        } else {
            blockInput = false;
        }
    });
}


async function setScore(value: number) {
    header.balanceTxt.setValue(score, value);
    controls.balanceTxt.setValue(score, value);
    chicken.balanceTxt.setValue(score, value);

    score = value;
}