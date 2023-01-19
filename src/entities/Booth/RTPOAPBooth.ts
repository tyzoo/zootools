import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getUserData } from "@decentraland/Identity";
import { signedFetch } from "@decentraland/SignedFetch";
import { AlertSystem } from "src/index";
import { Booth, IBoothProps } from "./Booth";

export class RTPOAPBooth extends Entity {
    public booth: Booth;
    constructor(
        public props: Partial<IBoothProps>,
        public rewardId: string,
        public alertSystem: AlertSystem,
    ) {
        super()
        this.addComponent(new Transform({}));
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
                        const callUrl = `https://api.reward.tools/v1/poap/claim`;
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
                        log("Reward claim",{json})
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
        this.booth.setParent(this);
    }
    setRewardId(rewardId: string){
        this.rewardId = rewardId;
    }
}