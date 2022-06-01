import { UserData } from "@decentraland/Identity";
import { Realm } from "@decentraland/EnvironmentAPI";
import { ConfirmCodeUI, IConfirmCodeOptions } from "../../classes/ConfirmCodeUI";
import { ETHSigner } from "../../classes/EthSigner";
import { SignedFetchAPI } from "../../classes/SignedFetch";
import { SoundPlayer } from "../../classes/SoundPlayer";
import { Booth, IBoothProps } from "./Booth"
import { CallbackDebouncer } from "../../classes/CallbackDebouncer";
import { parse } from "../../utils/index";

export interface IWearableBoothProps {
    booth_number: number;
    property: string;
    api_key: string;
    _giveawayId: string;
    userData: UserData,
    realm: Realm
}

export class WearableBooth extends Booth {
    servicesAPI: SignedFetchAPI;
    confirmCodeUI: ConfirmCodeUI;
    ethSigner: ETHSigner;
    access_token: string | null = null;
    secret_code: string | null = null;
    soundPlayer: SoundPlayer;
    constructor(
        props: Partial<IBoothProps>,
        private wearableProps: IWearableBoothProps,
        private alertSystem: {
            new: (text:  string | string[],  pinMS?: number) => void
        },
        private signedFetch: (url: string, init?: any | undefined) => Promise<any>,
        private confirmCodeOptions: Partial<IConfirmCodeOptions> = {},
    ){
        super({
            //Default booth props:
            transformArgs: {
                position: new Vector3(8, 0, 8),
                rotation: new Quaternion().setEuler(0,0,0),
            },
            buttonText: `Get Wearable`,
            onButtonClick: () => {
                this.mintItem()
            },
            wrapTexturePath: `poap_assets/images/wrap1.png`, 
            dispenserModelPath: `poap_assets/models/POAP_dispenser.glb`,
            buttonModelPath: `poap_assets/models/POAP_button.glb`,
            ...props
        })
        this.servicesAPI = new SignedFetchAPI("https://services.poap.cc/", this.signedFetch);
        this.ethSigner = new ETHSigner(this.alertSystem);
        this.confirmCodeUI = new ConfirmCodeUI(
            (secret:string)=>{
                this.secret_code = secret;
                executeTask(async ()=>{
                    this.processItem()
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
        if(this.wearableProps._giveawayId){
            this.setGivewayId(this.wearableProps._giveawayId);
        }
    }

    public setModel(localPathToModel:string): void{
        if(this.props.disablePreview) return;
        this.setItem(new GLTFShape(localPathToModel));
        this.setRotation(this.item!, "left");
    }
   
    public async mintItem() {
        this.mintDebouncer.execute();
    }
    
    private mintDebouncer = new CallbackDebouncer(() => {
        this.mintItemInternal()
    },5000,false);

    public setRealm(realm: Realm) {
        this.wearableProps.realm = realm;
    }

    private async mintItemInternal(): Promise<void> {
        if (!this.wearableProps._giveawayId) return this.alertSystem.new('Missing Giveaway ID', 1000);
        executeTask(async () => {
            try {
                const name = this.wearableProps.userData?.displayName;
                const address = this.wearableProps.userData?.userId;
                const realm = this.wearableProps.realm?.serverName;
                const api_key = this.wearableProps.api_key;
                const property = this.wearableProps.property;
                let message: string | undefined;
                let signature: string | undefined;
                this.soundPlayer.playSound('openDialog');
                let params: any = { name, address, realm, api_key, property };
                if (!this.wearableProps.userData.hasConnectedWeb3)
                    return this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
                if (signature && message) { params.signature = signature, params.message = message; }
                let response:any = await this.servicesAPI.request("POST",`dcl/verify/${this.wearableProps._giveawayId}`,params)
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
                                this.processItem();
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

    private async processItem() {
        if (this.wearableProps.userData!.hasConnectedWeb3) {
            let item:any = await this.sendItem(this.wearableProps.userData.displayName, this.wearableProps.userData!.publicKey!);
            if (item.success === true) {
                this.soundPlayer.playSound('coin')
                let text = item.message ? item.message : "An item for today's event will arrive to your account very soon!";
                this.alertSystem.new(text, 5000);
            } else {
                this.soundPlayer.playSound('closeDialog');
                this.alertSystem.new(item.message ? item.message : 'Something is wrong with the server, please try again later.', 5000);
            }       
        } else {
            this.soundPlayer.playSound('closeDialog')
            this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
        }
    }

    private async sendItem(name: string, address: string): Promise<unknown> {
        try {
            let response = await this.servicesAPI.request("POST", 'quest/complete', {
                name, 
                address,
                _giveawayId: this.wearableProps._giveawayId,
                property: this.wearableProps.property,
                booth_number: this.wearableProps.booth_number,
                api_key: this.wearableProps.api_key,
                access_token: this.access_token,
                secret_code: this.secret_code
            });
            return response;
        } catch (err:any) {
            log('Failed to reach URL', err);
            this.alertSystem.new('Failed to reach URL.', 1000);
        }
    }
    
    public setGivewayId(_giveawayId: string): void{
        this.wearableProps._giveawayId = _giveawayId;
        executeTask(async () => {
            let response:any = await this.servicesAPI.request("GET",`quest/info/${_giveawayId}?api_key=${this.wearableProps.api_key}`)
            const { success, data } = response;
            if (success) {
                const { image_info } = data, { image_url, height, width } = image_info;
                this.confirmCodeUI.setImageSrc(image_url,width,height);
            }
        });
    }
}

