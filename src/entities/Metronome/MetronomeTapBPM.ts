import { ZooTools_Metronome } from "./Metronome";

export class ZooTools_MetronomeTapBPM {
    clicks: number[] = [];
    tapping: boolean = false;
    count: number = 0;
    constructor(public metronome: ZooTools_Metronome){}
    tap(){
        this.count++;
        if(!this.tapping){
            this.tapping = true;
        }
        this.clicks.push(Date.now())
        if(this.count >= 4){
            const bpm = Math.floor(this.calculate(this.clicks))
            this.metronome.setBPM(bpm);
            this.reset()
        }
    }

    calculate(clicks: number[]){
        const timeBetweenTaps = (clicks[3] - clicks[0]) / 3;
        const bpm = 60000 / timeBetweenTaps;
        return bpm;
    }

    reset() {
        this.clicks = [];
        this.count = 0;
        this.tapping = false;
    }
}