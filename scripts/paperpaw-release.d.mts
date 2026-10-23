// Types of paperpaw-release.mjs, for the tests.
export declare const RELEASE_KEYS: string[];
export declare const RELEASES: string;
export declare function checkAsset(data: Uint8Array, signature: Uint8Array, keys?: string[]): string | null;
export declare function checksum(text: string): string | null;
export declare function fetchEmulator(version: string, target: string, folder: string): Promise<string>;
