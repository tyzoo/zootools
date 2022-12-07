import { ZooTools_Materials } from "../../../utils/Materials";

export class ZooTools_ControlBoardMarker extends Entity {
    label: Entity;
    constructor(
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
    ) {
        super()
        this.addComponent(new Transform(transform));
        this.addComponent(new BoxShape());
        this.setColor(`Gray`);
        this.label = new Entity();
        this.label.addComponent(new Transform({
            position: new Vector3(0, 0.51, 0),
            rotation: new Quaternion().setEuler(90, 0, 0),
        }));
        this.label.addComponent(new TextShape(text));
        this.label.getComponent(TextShape).fontSize = fontSize;
        this.label.setParent(this);
    }
    setColor(color: string){
        this.addComponentOrReplace(ZooTools_Materials[color]);
    }
    setLabel(label: string){
        this.label.getComponent(TextShape).value = label;
    }
}
