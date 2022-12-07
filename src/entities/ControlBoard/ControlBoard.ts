import { ZooTools_Materials } from "src/utils/Materials";
import { ZooTools_Metronome } from "src/Metronome/Metronome";
import { ZooTools_MetronomeOptions } from "src/Metronome/MetronomeOptions";
import { ZooTools_ControlBoardButton } from "./components/ControlBoardButton";
import { ZooTools_ControlBoardMarker } from "./components/ControlBoardMarker";
import { ZooTools_ControlBoardOutput } from "./components/ControlBoardOutput";

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
        name: string,
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
        callback: (actionId: string) => void,
    ) {
        const action = new ZooTools_ControlBoardOutput(text, fontSize, transform, callback)
        action.setParent(this)
        this.outputs.set(name, action);
        return action;
    };
    addOptions(
        name: string,
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
        setActive: (id: string, active: boolean) => void,
        startActive: boolean,
        callback: (actionId: string) => void,
    ) {
        if ((this as unknown) as ZooTools_Metronome) {
            const action = new ZooTools_MetronomeOptions((this as unknown) as ZooTools_Metronome, name, text, fontSize, transform, setActive, startActive, callback)
            action.setParent(this)
            this.options.set(name, action);
            return action;
        }
    };

}