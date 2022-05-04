import { Dash_GlobalCanvas, Dash_Wait } from "dcldash";

@EventConstructor()
export class ConnectionSuccessEvent { 
    constructor(
        public connected: boolean = true,
    ){}
}

@EventConstructor()
export class ConnectionErrorEvent { 
    constructor(
        public message: string,
        public delay: number,
        public connected: boolean = false,
    ){} 
}

export class Reconnector {

    private attempts = 0
    private attemptDelay = 1000;
    private attemptDelayMultipler = 2
    private maxDelay = 15000  
    private uiMessage: UIText | null = null

    constructor(
        private eventManager: EventManager,
        private connect: () => Promise<void>,
        private onConnected: () => void,
        private useDebugger: boolean = true, // DCLConnect.previewMode
    ){
        this.connectWrapper();
    }

    private connectWrapper(){
        return new Promise<boolean>((resolve) => {
            executeTask(async () => {
                try {
                    if(this.useDebugger){
                        this.addConnectionDebugger("Connecting...");
                    }
                    await this.connect();
                    this.attempts = 0;
                    this.onConnected();
                    this.eventManager.fireEvent(new ConnectionSuccessEvent());
                    resolve(true);
                }catch(e:any){
                    log(`ZooTools: Connection Error: `, e.message)
                    log(e)
                    this.onConnectionLost(e.message); 
                    resolve(false)
                }
            })
        })
    }

    private addConnectionDebugger(endpoint: string) {
        if(!this.uiMessage) this.uiMessage = new UIText(Dash_GlobalCanvas)
        this.uiMessage.fontSize = 15
        this.uiMessage.width = 120
        this.uiMessage.height = 30
        this.uiMessage.hTextAlign = "center";
        this.uiMessage.vAlign = "bottom"
        this.uiMessage.positionX = -80
        this.updateConnectionMessage(`Connecting to ${endpoint}`, Color4.White());
    }

    private updateConnectionMessage(value: string, color: Color4) {
        if(!this.uiMessage) return
        this.uiMessage.value = value;
        this.uiMessage.color = color;
    }

    private onConnectionLost(errorMsg: string){
        this.updateConnectionMessage("Not connected", Color4.Red())
        let timeout = this.attempts * this.attemptDelay * this.attemptDelayMultipler
        if(timeout > this.maxDelay) timeout = this.maxDelay
        let wait = timeout / 1000;
        log(`ZooTools: Waiting ${wait} seconds for next attempt`)
        this.eventManager.fireEvent(new ConnectionErrorEvent(errorMsg, wait));
        Dash_Wait(()=>{ 
            this.connectWrapper(); 
        },wait);
    }
}

const eventManager = new EventManager();

const reconnector = new Reconnector(
    eventManager,
    async () => {
        log(`ZooTools: CONNECTION EXAMPLE STARTING`)
        //connect function
        await new Promise(resolve=>Dash_Wait(resolve, 4000))
        log(`ZooTools: throw connect error`)
        throw Error(`A connection error occurred!`)
    },
    () => {
        //onConnected callback
        log(`ZooTools: ONCONNECTED EXAMPLE CONNECTED`)
    },
    true, // show ui message // DCLConnect.previewMode
)