import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getUserData, UserData } from "@decentraland/Identity";
import { parse } from "../../utils/JWT";
import { AlertSystem } from "../AlertSystem";
import { ConfirmCodeUI } from "../ConfirmCodeUI";
import { ETHSigner } from "../EthSigner";
import { SignedFetchAPI } from "../SignedFetch";
import { SoundPlayer } from "../SoundPlayer";
import { Booth, IBoothProps } from "./Booth"

interface IWearableBoothProps {
    booth_number: number;
    property: string;
    api_key: string;
    _giveawayId: number;
}

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

export class WearableBooth extends Booth {
    servicesAPI = new SignedFetchAPI("https://services.poap.cc/");
    confirmCodeUI: ConfirmCodeUI;
    lastClick: Date = new Date(new Date().getTime() - 5000);
    ethSigner: ETHSigner
    access_token: string | null = null;
    secret_code: string | null = null;
    constructor(
        props: Partial<IBoothProps>,
        private wearableProps: IWearableBoothProps,
        private alertSystem: AlertSystem,
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
    }
    setModel(localPathToModel:string){
        this.setItem(new GLTFShape(localPathToModel));
        this.setRotation(this.item!, "left");
    }
   
    public async mintItem() {
        if (!this.wearableProps._giveawayId) return this.alertSystem.new('Missing Giveaway ID', 1000);
        let prevClick = this.lastClick;
        this.lastClick = new Date();
        if (prevClick.getTime() + 5000 > this.lastClick.getTime()) {
            return;
        }
        const userData = await getUserData();
        const name = userData?.displayName;
        const address = userData?.userId;
        const realm = (await getCurrentRealm())?.serverName;
        const api_key = this.wearableProps.api_key;
        const property = this.wearableProps.property;
        let message: string | undefined;
        let signature: string | undefined;
        soundPlayer.playSound('openDialog');
        executeTask(async () => {
            try {
                let params: any = { name, address, realm, api_key, property };
                if (userData.hasConnectedWeb3)
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
                                this.processItem(userData);
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

    private async processItem(userData: UserData){
        if (userData!.hasConnectedWeb3) {
            let item:any = await this.sendItem(userData.displayName, userData.publicKey);
            if (item.success === true) {
                soundPlayer.playSound('coin')
                let text = item.message ? item.message : "An item for today's event will arrive to your account very soon!";
                this.alertSystem.new(text, 5000);
            } else {
                soundPlayer.playSound('closeDialog');
                this.alertSystem.new(item.message ? item.message : 'Something is wrong with the server, please try again later.', 5000);
            }       
        } else {
            soundPlayer.playSound('closeDialog')
            this.alertSystem.new( 'You need an in-browser Ethereum wallet (eg: Metamask) to claim this item.', 5000 );
        }
    }

    private async sendItem(name: string, address: string) {
        const body = JSON.stringify({
            name, 
            address,
            _giveawayId: this.wearableProps._giveawayId,
            property: this.wearableProps.property,
            booth_number: this.wearableProps.booth_number,
            api_key: this.wearableProps.api_key,
            access_token: this.access_token,
            secret_code: this.secret_code
        });
        try {
            let response = await this.servicesAPI.request("POST", 'quest/complete', body);
            return response;
        } catch (err:any) {
            log('Failed to reach URL', err);
            this.alertSystem.new('Failed to reach URL.', 1000);
        }
    }
    
    setEventId(_giveawayId: number){
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