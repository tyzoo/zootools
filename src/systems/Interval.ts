export class Interval implements ISystem {
    system: ISystem;
    timer = 0;
    constructor(
        private callback: () => Promise<void> | void, 
        private intervalInSeconds: number
    ){ 
        this.system = this;
        if(!this.system.active){
            engine.addSystem(this.system);
        }
    }
    public update(dt: number ): void {
        this.timer += dt;
        if(this.timer >= this.intervalInSeconds){
            this.timer = 0;
            this.callback()
        }
    }
    public clear(): void {
        if(this.system.active){
            engine.removeSystem(this.system)
        }
    }
}