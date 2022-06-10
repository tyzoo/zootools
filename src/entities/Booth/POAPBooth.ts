import { UserData } from "@decentraland/Identity";
import { Realm } from "@decentraland/EnvironmentAPI";
import { ConfirmCodeUI, IConfirmCodeOptions } from "../../classes/ConfirmCodeUI";
import { SignedFetchAPI } from "../../classes/SignedFetch";
import { Booth, IBoothProps } from "./Booth"
import { SoundPlayer } from '../../classes/SoundPlayer';
import { ETHSigner } from '../../classes/EthSigner';
import { CallbackDebouncer } from "../../classes/CallbackDebouncer";
import { parse } from "../../utils/index";

export interface IPOAPBoothProps {
    booth_number: number;
    property: string;
    api_key: string;
    event_id: number | undefined;
    userData: UserData | undefined;
    realm: Realm | undefined;
};

export class POAPBooth extends Booth {
    servicesAPI: SignedFetchAPI;
    claimsAPI: SignedFetchAPI;
    confirmCodeUI: ConfirmCodeUI;
    ethSigner: ETHSigner;
    access_token: string | null = null;
    secret_code: string | null = null;
    soundPlayer: SoundPlayer;
    constructor(
        boothProps: Partial<IBoothProps>, 
        private poapProps: IPOAPBoothProps,
        private alertSystem: {
            new: (text:  string | string[],  pinMS?: number) => void
        },
        private signedFetch: (url: string, init?: any | undefined) => Promise<any>,
        private confirmCodeOptions: Partial<IConfirmCodeOptions> = {}
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
        this.servicesAPI = new SignedFetchAPI("https://services.poap.cc/", this.signedFetch);
        this.claimsAPI = new SignedFetchAPI("https://claims.poap.cc/", this.signedFetch);
        this.ethSigner = new ETHSigner(this.alertSystem);
        this.confirmCodeUI = new ConfirmCodeUI(
            (secret:string)=>{
                this.secret_code = secret;
                executeTask(async ()=>{
                    this.processPOAP()
                })
            },
            this.confirmCodeOptions,
            alertSystem,
            this.cdn
        );
        this.soundPlayer = new SoundPlayer([
            {
                name: `openDialog`,
                path: `${this.cdn}poap_assets/sounds/navigationForward.mp3`
            },
            {
                name: `closeDialog`,
                path: `${this.cdn}poap_assets/sounds/navigationBackward.mp3`
            },
            {
                name: `coin`,
                path: `${this.cdn}poap_assets/sounds/star-collect.mp3`
            },
        ]);
        if(this.poapProps.event_id){
            this.setEventId(this.poapProps.event_id);
        }
    }

    public async mintPOAP() {
        this.mintDebouncer.execute();
    }
    
    private mintDebouncer = new CallbackDebouncer(() => {
        this.mintPOAPInternal()
    }, 5000, false);

    private async mintPOAPInternal() {
        if (!this.poapProps.userData) return this.alertSystem.new('Missing User Data', 1000);
        if (!this.poapProps.realm) return this.alertSystem.new('Missing Realm Data', 1000);
        if (!this.poapProps.event_id) return this.alertSystem.new('Missing Event ID', 1000);
        executeTask(async () => {
            try {
                const name = this.poapProps.userData?.displayName;
                const address = this.poapProps.userData?.userId;
                const realm = this.poapProps.realm?.serverName;
                const api_key = this.poapProps.api_key;
                const property = this.poapProps.property;
                let message: string | undefined;
                let signature: string | undefined;
                this.soundPlayer.playSound('openDialog');

                let params: any = { name, address, realm, api_key, property };
                if (!this.poapProps.userData!.hasConnectedWeb3)
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
                const { message } = err;
                const error = message ? message : "Failed to reach URL."
                log(error, err);
                this.alertSystem.new(error, 1000);
            }
        });
    }

    private async processPOAP(){
        if (this.poapProps.userData?.hasConnectedWeb3) {
            let poap:any = await this.sendPoap(this.poapProps.userData.displayName, this.poapProps.userData!.publicKey!);
            if (poap.success === true) {
                this.soundPlayer.playSound('coin')
                let text = poap.message ? poap.message : "A POAP token for today's event will arrive to your account very soon!";
                this.alertSystem.new(text, 5000);
            } else {
                this.soundPlayer.playSound('closeDialog');
                this.alertSystem.new(poap.message ? poap.message : 'Something is wrong with the server, please try again later.', 5000);
            }       
        } else {
            this.soundPlayer.playSound('closeDialog')
            this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
        }
    }

    private async sendPoap(name: string, address: string) {
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
    
    public setEventId(event_id: number): void{
        this.poapProps.event_id = event_id;
        executeTask(async () => {
            let response:any = await this.servicesAPI.request("GET",`poap/info/${event_id}?api_key=${this.poapProps.api_key}`)
            const { success, data } = response;
            if (success) {
                const { image_info } = data, { image_url, height, width } = image_info;
                this.confirmCodeUI.setImageSrc(image_url,width,height);
                if(this.props.disablePreview) return;
                this.setImage(
                    image_url, 
                    `https://poap.gallery/event/${event_id}`, 
                    `View Event on POAP.gallery`
                );
                this.setRotation(this.image!, this.props.itemRotationDir!);
            }
        });
    }
    public setUserData(userData: UserData): void {
        this.poapProps.userData = userData;
    }
    public setRealm(realm: Realm): void {
        this.poapProps.realm = realm;
    }
}