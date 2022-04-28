import { Sound } from "../entities/Sound";

declare const Map: any


export class SoundPlayer {
    private sounds = new Map()
    constructor(sounds: {name:string, path:string}[]){
        sounds.forEach(sound => {
            const _sound = new Sound(sound.path)
            this.registerSound(sound.name, _sound)
        });
    }
    private registerSound(name: string, sound: Sound): void {
        this.sounds.set(name, sound)
    }
    public playSound(registeredName:string): void {
        if(this.sounds.has(registeredName)){
            this.sounds.get(registeredName).playOnce()
        }
    }
}
