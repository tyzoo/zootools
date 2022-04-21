export class CallbackDebouncer {
    lastClick: Date = new Date(new Date().getTime() - 5000);
    constructor(
        private cb: ([...any]?:any[]) => void,
        private debounceMS: number = 5000,
        exeute: boolean = true
    ){
        if(exeute){
            this.execute();
        }
    }
    execute(){
        let prevClick = this.lastClick;
        this.lastClick = new Date();
        if (prevClick.getTime() + this.debounceMS > this.lastClick.getTime()) {
            return;
        }
        this.cb();
    }
}