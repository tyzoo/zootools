import { ZooTools_Materials } from "../../utils/Materials";
import { ZooTools_Metronome } from "./Metronome";

export class ZooTools_MetronomeOptions extends Entity {

    id: string;
    active!: boolean;
    activeBtn: Entity;
    activeLabel!: string;
    menuBtn: Entity;

    constructor(
        public metronome: ZooTools_Metronome,
        public name: string,
        public text: string,
        public fontSize: number,
        public transform: TranformConstructorArgs,
        public setActive: (id: string, active: boolean) => void,
        public startActive: boolean,
        public callback: (actionId: string) => void,
    ) {
        super()
        this.addComponent(new Transform(transform));
        this.id = name;
        this.activeBtn = new Entity();
        this.activeBtn.addComponent(new Transform({
            scale: new Vector3(0.25, 0.1, 0.05),
        }));
        this.activeBtn.addComponent(new BoxShape())
        this.activeBtn.setParent(this);
        this.activate(this.startActive);

        this.menuBtn = new Entity();
        this.menuBtn.addComponent(new Transform({
            position: new Vector3(0, 0, -0.10),
            scale: new Vector3(0.25, 0.1, 0.1),
        }));
        this.menuBtn.addComponent(new BoxShape())
        this.menuBtn.addComponent(new TextShape())
        this.menuBtn.addComponent(ZooTools_Materials.Gray);
        this.menuBtn.addComponent(new OnPointerDown(() => {
            const list = (this.getParent() as ZooTools_Metronome).list;
            if (!list.active) {
                list.setParent(this.getParent());
                list.setContent(
                    this.metronome.subscriptions
                        .filter(
                            x => x.id === name
                        )[0]
                        .actions.map(action => {
                            return {
                                label: action.name,
                                onClick: () => {
                                    action.callback(action.name);
                                    const output = this.metronome.outputs.get(name);
                                    if(output) output.highlightClick();
                                },
                            }
                        })
                );
                list.loadPage(0)
                list.setOnChange(this.callback)
                list.show()
                list.active = true;
            } else {
                list.hide()
                list.active = false;
                list.setParent(null);
            }

        }, {
            hoverText: `Menu`
        }));
        this.menuBtn.setParent(this);
    }
    onSetActive(id: string, active: boolean){
        const sub = this.metronome.subscriptions.filter(x => x.id === this.id)[0];
        sub.active = active;
        this.setActive(id, active);
    }

    activate(active: boolean) {
        this.active = active;
        const color = active ? `Green` : `Red`;
        this.setActiveColor(color);
        this.setActiveLabel(`Active:\n${this.active}`);
        this.onSetActive(this.id, active)
    }

    setActiveLabel(label: string) {
        this.activeLabel = label;
        this.activeBtn.addComponentOrReplace(new OnPointerDown(() => {
            const val = !this.active;
            this.activate(val);
            const color = val ? "Green" : "Red";
            this.setActiveColor(color);
        }, {
            hoverText: this.activeLabel
        }))
    }

    setActiveColor(color: string) {
        this.activeBtn.addComponentOrReplace(ZooTools_Materials[color]);
    }
}