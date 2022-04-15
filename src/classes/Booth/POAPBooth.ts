import { UserData } from "@decentraland/Identity";
import { Realm } from "@decentraland/EnvironmentAPI";
import { AlertSystem } from "../AlertSystem";
import { ConfirmCodeUI, IConfirmCodeOptions } from "../ConfirmCodeUI";
import { SignedFetchAPI } from "../SignedFetch";
import { Booth, IBoothProps } from "./Booth"
import { parse } from "../../utils/JWT"
import { SoundPlayer } from '../SoundPlayer';
import { ETHSigner } from '../EthSigner';

export type Props = {
    booth_number: number;
    property: string;
    api_key: string;
    event_id: number;
    userData: UserData,
    realm: Realm
};

const soundPlayer = new SoundPlayer([
    {
        name: `openDialog`,
        path: `poap_assets/sounds/navigationForward.mp3`
    },
    {
        name: `closeDialog`,
        path: `poap_assets/sounds/navigationBackward.mp3`
    },
    {
        name: `coin`,
        path: `poap_assets/sounds/star-collect.mp3`
    },
]);

export class POAPBooth extends Booth {
    servicesAPI = new SignedFetchAPI("https://services.poap.cc/");
    claimsAPI = new SignedFetchAPI("https://claims.poap.cc/");
    confirmCodeUI: ConfirmCodeUI;
    lastClick: Date = new Date(new Date().getTime() - 5000);
    ethSigner: ETHSigner
    access_token: string | null = null;
    secret_code: string | null = null;
    constructor(
        boothProps: Partial<IBoothProps>, 
        private poapProps: Props,
        private alertSystem: AlertSystem,
        private confirmCodeOptions: Partial<IConfirmCodeOptions> = {},
    ){
        super({
            //Default booth props:
            transformArgs: {
                position: new Vector3(8, 0, 8),
                rotation: new Quaternion().setEuler(0,0,0),
            },
            buttonText: `Get Attendance Token`,
            onButtonClick: () => {
                this.mintPOAP();
            },
            wrapTexturePath: `poap_assets/images/wrap1.png`, 
            dispenserModelPath: `poap_assets/models/POAP_dispenser.glb`,
            buttonModelPath: `poap_assets/models/POAP_button.glb`,
            ...boothProps
        })
        this.ethSigner = new ETHSigner(this.alertSystem);
        this.confirmCodeUI = new ConfirmCodeUI(
            (secret:string)=>{
                this.secret_code = secret;
                executeTask(async ()=>{
                    this.processPOAP()
                })
            },
            this.confirmCodeOptions,
            alertSystem
        );
        if(this.poapProps.event_id){
            this.setEventId(this.poapProps.event_id);
        }
        
    }
    public async mintPOAP() {
        if (!this.poapProps.event_id) return this.alertSystem.new('Missing Event ID', 1000);
        let prevClick = this.lastClick;
        this.lastClick = new Date();
        if (prevClick.getTime() + 5000 > this.lastClick.getTime()) {
            return;
        }
        executeTask(async () => {
            try {
                const name = this.poapProps.userData?.displayName;
                const address = this.poapProps.userData?.userId;
                const realm = this.poapProps.realm?.serverName;
                const api_key = this.poapProps.api_key;
                const property = this.poapProps.property;
                let message: string | undefined;
                let signature: string | undefined;
                soundPlayer.playSound('openDialog');

                let params: any = { name, address, realm, api_key, property };
                if (!this.poapProps.userData.hasConnectedWeb3)
                    return this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
                if (signature && message) { params.signature = signature, params.message = message; }
                let response:any = await this.servicesAPI.request("POST",`dcl/verify/${this.poapProps.event_id}`,params)
                const { message: msg, success, data } = response;
                if (msg) {
                    if (success && data) {
                        const { token } = data;                
                        if (token) {
                            this.access_token = token;
                            const { hash, sig_required } = parse(token)
                            if(sig_required){
                                try {
                                    const results = await this.ethSigner.signKeyValue({ address, realm, hash })
                                    message = results.message;
                                    signature = results.signature;
                                }catch (err:any){ return log(`An error occured with ETH Signer:`, err); }        
                            }
                            if(hash){
                                this.confirmCodeUI.setCaptcha(hash);
                                this.confirmCodeUI.showUI();
                            }else{
                                this.processPOAP();
                            }
                        }
                    }else{
                        this.alertSystem.new(msg, 5000);
                    }
                }
            } catch (err: any) {
                log('Failed to reach URL', err);
                this.alertSystem.new('Failed to reach URL.', 1000);
            }
        });
    }

    private async processPOAP(){
        if (this.poapProps.userData!.hasConnectedWeb3) {
            let poap:any = await this.sendPoap(this.poapProps.userData.displayName, this.poapProps.userData.publicKey, this.poapProps.realm.displayName);
            if (poap.success === true) {
                soundPlayer.playSound('coin')
                let text = poap.message ? poap.message : "A POAP token for today's event will arrive to your account very soon!";
                this.alertSystem.new(text, 5000);
            } else {
                soundPlayer.playSound('closeDialog');
                this.alertSystem.new(poap.message ? poap.message : 'Something is wrong with the server, please try again later.', 5000);
            }       
        } else {
            soundPlayer.playSound('closeDialog')
            this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
        }
    }

    private async sendPoap(name: string, address: string, realm: string) {
        try {
            let response = await this.claimsAPI.request("POST", 'send-poap', {
                name, 
                address,
                event_id: this.poapProps.event_id,
                property: this.poapProps.property,
                booth_number: this.poapProps.booth_number,
                api_key: this.poapProps.api_key,
                access_token: this.access_token,
                secret_code: this.secret_code
            });
            return response;
        } catch (err:any) {
            log('Failed to reach URL', err);
            this.alertSystem.new('Failed to reach URL.', 1000);
        }
    }
    
    setEventId(event_id: number){
        this.poapProps.event_id = event_id;
        executeTask(async () => {
            let response:any = await this.servicesAPI.request("GET",`poap/info/${event_id}?api_key=${this.poapProps.api_key}`)
            const { success, data } = response;
            if (success) {
                const { image_info } = data, { image_url, height, width } = image_info;
                this.confirmCodeUI.setImageSrc(image_url,width,height);
                this.setImage(
                    image_url, 
                    `https://poap.gallery/event/${event_id}`, 
                    `View Event on POAP.gallery`
                );
                this.setRotation(this.image!, "left");
            }
        });
    }
}