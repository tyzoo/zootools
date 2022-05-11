export class ISystemCallback implements ISystem {
    constructor(
        private callback: () => void,
        private timerInSeconds: number = 0,
        private intervalInSeconds: number = 1,
    ){}
    update(dt: number): void {
        this.timerInSeconds += dt;
        if(this.intervalInSeconds >= this.timerInSeconds){
            this.timerInSeconds = 0;
            this.callback()
        }
    }
}