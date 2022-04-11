import { Booth, IBoothProps } from "./Booth"

export class WearableBooth extends Booth {
    constructor(props: Partial<IBoothProps>){
        super({
            transformArgs: {
                position: new Vector3(8, 0, 8),
                rotation: new Quaternion().setEuler(0,0,0),
            },
            buttonText: `Get Wearable`,
            onButtonClick: () => {
                log('Claiming Wearable')
            },
            wrapTexturePath: `poap_assets/images/wrap1.png`, 
            dispenserModelPath: `poap_assets/models/POAP_dispenser.glb`,
            buttonModelPath: `poap_assets/models/POAP_button.glb`,
            ...props
        })
    }
}