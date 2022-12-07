export interface ZooTools_Metronome_IOnSubscription {
    id: string;
    name: string;
    on: string;
    number: number;
    callback: () => void;
}

export interface ZooTools_Metronome_IEverySubscription {
    id: string;
    name: string;
    every: string;
    number: number;
    callback: () => void;
}

export type ZooTools_Metronome_ISubscription = ZooTools_Metronome_IOnSubscription | ZooTools_Metronome_IEverySubscription;