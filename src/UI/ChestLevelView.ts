import {AnimatedSprite, Assets} from "pixi.js";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";

export function ChestLevelView() {
    const chestData = Assets.get(AssetsDB.data.chest);
    const animations = chestData.animations;
    const closedFrames = animations["closed"];

    const chestSprite = AnimatedSprite.fromFrames(closedFrames);
    chestSprite.anchor.set(0.5);
    chestSprite.animationSpeed = 0;
    chestSprite.loop = false;
    chestSprite.scale.set(0.75);

    return chestSprite;
}