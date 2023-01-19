import { getCurrentRealm, Realm } from "@decentraland/EnvironmentAPI";
import { getUserData, UserData } from "@decentraland/Identity";
import { signedFetch } from "@decentraland/SignedFetch";
import { Dash_Wait } from "dcldash";
import { AlertSystem } from "src/index";
import { Booth, IBoothProps } from "./Booth";

export class RTPOAPBooth extends Entity {
    public initialized: boolean = false;
    public booth!: Booth;
    public userData!: UserData | null;
    public realm!: Realm | undefined;
    public rewardData!: any;
    constructor(
        public props: Partial<IBoothProps>,
        public alertSystem: AlertSystem,
        public rewardId?: string,
        public endpoint: string = `https://api.reward.tools`,
    ) {
        super()
        this.addComponent(new Transform({}));
        executeTask(async () => {
            await this.loadUserData()
            this.booth = new Booth({
                transformArgs: { position: new Vector3(8, 0, 8) },
                buttonText: `Claim this POAP`,
                onButtonClick: () => {
                    void executeTask(async () => {
                        try {
                            log("Claiming POAP", { rewardId })
                            alertSystem.new("Attempting to claim POAP... Please wait...")
                            const userData = await getUserData();
                            const realm = await getCurrentRealm();
                            if (!userData?.hasConnectedWeb3) {
                                alertSystem.new(`Login with an Ethereum Wallet to claim this POAP`);
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
                            log("Reward claim", { json })
                            alertSystem.new(message)

                        } catch (err: any) {
                            alertSystem.new(err?.message ?? `An error has occcured`)
                        }
                    })
                },
                wrapTexturePath: `poap_assets/images/wrap1.png`,
                dispenserModelPath: `poap_assets/models/POAP_dispenser.glb`,
                buttonModelPath: `poap_assets/models/POAP_button.glb`,
                ...props,
            })
            this.initialized = true;
            if (this?.rewardId) {
                this.setRewardId(this.rewardId);
            }
            this.booth.setParent(this);
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
                    resolve(JSON.parse(response.text ?? ""));
                }catch {
                    resolve(null);
                }
            })
        })
    }
    async setRewardId(rewardId: string) {
        if (this.initialized) {
            this.rewardId = rewardId;
            const reward = await this.getReward(rewardId);
            if(!reward) this.alertSystem.new(`Reward not found`)
            this.rewardData = reward?.data;
            log(`Got Reward`, this.rewardData)
            this.booth.setImage(
                this.rewardData.imageUrl,
                `https://poap.gallery/event/${this.rewardData.event_id}`,
                `View Event on POAP.gallery`
            )
        } else {
            log(`RTPOAPBooth not initialized. Waiting 5 seconds to reattempt..`)
            Dash_Wait(() => {
                this.setRewardId(rewardId);
            }, 5)
        }
    }
}