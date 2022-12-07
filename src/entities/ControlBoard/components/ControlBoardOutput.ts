import { Dash_Wait } from "dcldash";
import { ZooTools_Materials } from "src/utils/Materials";

export class ZooTools_ControlBoardOutput extends Entity {
    label: Entity;
    constructor(
        text: string,
        fontSize: number,
        transform: TranformConstructorArgs,
        callback: () => void,
    ) {
        super()
        this.addComponent(new Transform(transform));
        this.addComponent(new BoxShape());
        this.addComponent(new Material());
        this.addComponent(new OnPointerDown(()=>{
            callback()
            this.action()
        }, {
            hoverText: text,
        }));
        this.setColor(`Black`);
        this.label = new Entity();
        this.label.addComponent(new Transform({
            position: new Vector3(0, 0.51, 0),
            rotation: new Quaternion().setEuler(90, 0, 0),
        }));
        this.label.addComponent(new TextShape(text));
        this.label.getComponent(TextShape).fontSize = fontSize;
        this.label.setParent(this);
    }
    action(){
        this.setColor(`Blue`)
        Dash_Wait(() => {
            this.setColor(`Black`)
        }, 0.5)
    }
    setColor(color: string){
        this.addComponentOrReplace(ZooTools_Materials[color]);
    }
}