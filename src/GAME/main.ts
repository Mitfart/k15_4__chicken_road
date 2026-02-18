import {Game} from "../../plugins/Game/Game.ts";
import sdk from "@smoud/playable-sdk";

export async function Main(game: Game) {
setTimeout(() => {
    sdk.install();
    console.log("INSTALL")
}, 3000);
}