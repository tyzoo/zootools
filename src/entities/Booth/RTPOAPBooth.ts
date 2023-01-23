import { getCurrentRealm, Realm } from "@decentraland/EnvironmentAPI";
import { getUserData, UserData } from "@decentraland/Identity";
import { signedFetch } from "@decentraland/SignedFetch";
import { Dash_Wait } from "dcldash";
import { AlertSystem } from "src/index";
import { Booth, IBoothProps } from "./Booth";

export class RTPOAPBooth extends Booth {
    public initialized: boolean = false;
    public userData!: UserData | null;
    public realm!: Realm | undefined;
    public rewardData!: any;
    constructor(
        public rtProps: Partial<IBoothProps>,
        public alertSystem: AlertSystem,
        public rewardId?: string,
        public endpoint: string = `https://api.reward.tools`,
        public debug: boolean = false,
    ) {
        super({
            ...rtProps,
            transformArgs: rtProps.transformArgs!,
            buttonText: `Claim this POAP`,
            onButtonClick: () => { },
            wrapTexturePath: `poap_assets/images/wrap1.png`,
            dispenserModelPath: `poap_assets/models/POAP_dispenser.glb`,
            buttonModelPath: `poap_assets/models/POAP_button.glb`,
        })
        executeTask(async () => {
            await this.loadUserData()
            this.onButtonClick = this.getButtonClick;
        })
    }

    async loadUserData() {
        this.userData = await getUserData();
        this.realm = await getCurrentRealm();
    }

    getReward(rewardId: string): Promise<any> {
        return new Promise((resolve) => {
            executeTask(async () => {
                try {
                    const address = this.userData?.publicKey;
                    const displayName = this.userData?.displayName;
                    const callUrl = `${this.endpoint}/v1/quest/fetch`;
                    const response = await signedFetch(callUrl, {
                        headers: { "Content-Type": "application/json" },
                        method: "POST",
                        body: JSON.stringify({
                            address,
                            displayName,
                            rewardId,
                        }),
                    })
                    const json = JSON.parse(response.text ?? "");
                    if(response.status !== 200) throw Error(json?.message);
                    resolve(json)
                } catch (err: any) {
                    this.debug && log(`RTPOAPBooth Fetch Error: ${err.message}`)
                    resolve(null)
                }
            })
        })
    }

    async getButtonClick() {
        void executeTask(async () => {
            try {
                this.debug && log("Claiming POAP", { rewardId: this.rewardId })
                this.alertSystem.new("Attempting to claim POAP... Please wait...")
                const userData = await getUserData();
                const realm = await getCurrentRealm();
                if (!userData?.hasConnectedWeb3) {
                    this.alertSystem.new(`Login with an Ethereum Wallet to claim this POAP`);
                    return;
                }
                const address = userData?.publicKey;
                const displayName = userData?.displayName;
                const callUrl = `${this.endpoint}/v1/poap/claim`;
                let response = await signedFetch(callUrl, {
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({
                        address,
                        displayName,
                        rewardId: this.rewardId,
                        realm,
                        timezone: new Date().toString(),
                    }),
                })
                let json = JSON.parse(response.text ?? "");
                const { message } = json;
                this.debug && log("Reward claim", { json })
                this.alertSystem.new(message)

            } catch (err: any) {
                this.alertSystem.new(err?.message ?? `An error has occcured`)
            }
        })
        if (this?.rewardId) {
            this.setRewardId(this.rewardId);
        }
    }

    async setRewardId(rewardId: string) {
        const reward = await this.getReward(rewardId);
        if (reward == null) {
            this.alertSystem.new(`Reward not found`);
            return;
        }
        if (!this.initialized) {
            this.initialized = true;
            this.rewardId = rewardId;
            this.rewardData = reward?.data;
            this.debug && log(`Got Reward`, this.rewardData)
            this.setImage(
                this.rewardData.imageUrl,
                `https://poap.gallery/event/${this.rewardData.event_id}`,
                `View Event on POAP.gallery`
            )
        } else {
            this.debug && log(`RTPOAPBooth not initialized. Waiting 5 seconds to reattempt..`)
            Dash_Wait(() => {
                this.setRewardId(rewardId);
            }, 5)
        }
    }
    
}