export interface ZooTools_Command {
    name: string;
    callback: (newState: any) => void;
    active: boolean;
    weight?: number;
}

export interface ZooTools_Metronome_IOnSubscription {
    id: string;
    name: string;
    on: string;
    number: number;
    callback: (actionId: string) => void;
    active: boolean;
    actions: ZooTools_Command[];
}

export interface ZooTools_Metronome_IEverySubscription {
    id: string;
    name: string;
    every: string;
    number: number;
    callback: (actionId: string) => void;
    active: boolean;
    actions: ZooTools_Command[];
}

export type ZooTools_Metronome_ISubscription = ZooTools_Metronome_IOnSubscription | ZooTools_Metronome_IEverySubscription;