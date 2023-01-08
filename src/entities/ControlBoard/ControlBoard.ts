import { ZooTools_Materials } from "../../utils/Materials";
import { ZooTools_Metronome } from "../Metronome/Metronome";
import { ZooTools_MetronomeOptions } from "../Metronome/MetronomeOptions";
import { ZooTools_Metronome_ISubscription } from "../Metronome/types";
import { ZooTools_ControlBoardButton } from "./components/ControlBoardButton";
import { ZooTools_ControlBoardMarker } from "./components/ControlBoardMarker";
import { ZooTools_MetronomeOutput } from "../Metronome/MetronomeOutput";
import weightedRandom from "../Metronome/WeightedRandom";

declare const Map: any

export class ZooTools_ControlBoard extends Entity {

    base: Entity = new Entity();

    constructor() {
        super()

        this.base.addComponent(new Transform({
            position: new Vector3(0, 0.369, 0),
            scale: new Vector3(2.6, 1.7, 0.25),
            rotation: Quaternion.Euler(90, 0, 0)
        }))
        this.base.addComponent(new BoxShape())
        this.base.getComponent(BoxShape).isPointerBlocker = false;
        this.base.addComponent(ZooTools_Materials.Black)
        this.base.setParent(this);
    }

    labels: typeof Map = new Map();
    buttons: typeof Map = new Map();
    markers: typeof Map = new Map();
    outputs: typeof Map = new Map();
    options: typeof Map = new Map();

    addLabel(name: string, text: string, fontSize: number, transform: TranformConstructorArgs) {
        const label = new Entity();
        label.addComponent(new Transform({
            ...transform,
            rotation: Quaternion.Euler(90, 0, 0),
        }));
        label.addComponent(new TextShape(text));
        label.getComponent(TextShape).fontSize = fontSize;
        label.setParent(this);
        this.labels.set(name, label);
    };
    addButton(
        name: string,
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
        callback: () => void,
    ) {
        const button = new ZooTools_ControlBoardButton(text, fontSize, transform, callback)
        button.setParent(this)
        this.buttons.set(name, button);
        return button;
    };
    addMarker(
        name: string,
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
    ) {
        const marker = new ZooTools_ControlBoardMarker(text, fontSize, transform)
        marker.setParent(this)
        this.markers.set(name, marker);
        return marker;
    };
    addOutputMarker(
        sub: ZooTools_Metronome_ISubscription,
        fontSize: number,
        transform: TranformConstructorArgs,
    ) {
        const metronome = (this as unknown) as ZooTools_Metronome;
        const prev = this.outputs.get(sub.id);
        if (prev) engine.removeEntity(prev);
        const output = new ZooTools_MetronomeOutput(
            metronome,
            sub.id,
            sub.name,
            fontSize,
            transform,
            (actionId: string, userTriggered: boolean = false) => {
                if (userTriggered){

                } else {
                    sub.callback(actionId, userTriggered);
                    let action = sub.actions.filter(x => x.name === actionId)[0];
                    if (!action) {
                        action = weightedRandom(sub.actions)
                    }
                    action?.callback(action.name, userTriggered);
                }
            })
        output.setParent(this)
        this.outputs.set(sub.id, output);
        return output;
    };
    addOptions(
        sub: ZooTools_Metronome_ISubscription,
        fontSize: number,
        transform: TranformConstructorArgs,
        setActive: (id: string, active: boolean) => void,
    ) {
        if ((this as unknown) as ZooTools_Metronome) {
            const prev = this.options.get(sub.id);
            if (prev) engine.removeEntity(prev);
            const options = new ZooTools_MetronomeOptions(
                (this as unknown) as ZooTools_Metronome, 
                sub.id, 
                sub.name, 
                fontSize, 
                transform, 
                setActive, 
                sub.active, 
                // sub.callback,
            )
            options.setParent(this)
            this.options.set(sub.id, options);
            return options;
        }
    };

}