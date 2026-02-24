import {AnimatedSprite} from "pixi.js";
import {AssetsDB} from "../../plugins/Assets/_DATA_BASE/AssetsDB.ts";
import {CreateVFX} from "../../plugins/Utils/CreateVFX.ts";


export default class VFX {
    public static confetti(): AnimatedSprite {
        return CreateVFX(AssetsDB.data.vfx_confetti, true, .25);
    }

    public static coins(): AnimatedSprite {
        return CreateVFX(AssetsDB.data.vfx_coins, true, 1);
    }
}