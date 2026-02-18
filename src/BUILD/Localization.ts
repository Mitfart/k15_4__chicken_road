export enum LocalKey {
    // "YOUR_KEY" = "YOUR_KEY_AGAIN",
}

export function GetLocal(key: LocalKey): string {
    // @ts-expect-error API
    return LOCALIZATION[key][LANGUAGE];
}