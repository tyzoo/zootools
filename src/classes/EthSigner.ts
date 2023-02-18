import * as EthereumController from '@decentraland/EthereumController';

let eth = EthereumController;

function keyValueObjToString(keyValueObj: any = {}): string {
    let variables = '';
    Object.keys(keyValueObj).map(key => {
        variables += `${key}: ${keyValueObj[key]}\n`;
    });
    return `# DCL Signed message\n${variables}Timestamp: ${new Date().getTime()}`;
}

export class ETHSigner {
    constructor(private alertSystem: {
        new: (text:  string | string[],  pinMS?: number) => void
    }){}
    public signKeyValue(obj:any): Promise<{message:string, signature:string}>{
        return new Promise((resolve, reject) =>{
            try {
                executeTask(async () => {
                    this.alertSystem.new(
                        'Open MetaMask and sign the message to complete the transaction.',
                        5000
                    );
                    const messageToSign = keyValueObjToString(obj);
                    const convertedMessage = await eth.convertMessageToObject(
                        messageToSign
                    );
                    const { hexEncodedMessage: message, signature } =
                        await eth.signMessage(convertedMessage);
                    resolve({message, signature});
                })
            }catch(err:any){
                this.log(`Error`, err)
                reject(`An error occurred`)
            }
        })
    }
    private log(...props:any){ log('[ 🦁 ZooTools 🐒 ]', '[ ETHSigner ]', ...props)}
}