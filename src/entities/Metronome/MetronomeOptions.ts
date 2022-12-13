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
        public callback: (id: string, actionId: string) => void,
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
        this.activeBtn.addComponentOrReplace(new OnPointerDown(() => {
            const val = !this.active;
            this.setActive(this.id, val);
        }, {
            hoverText: this.activeLabel
        }))
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
                list.setId(name);
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

    activate(active: boolean) {
        this.active = active;
        const color = active ? `Green` : `Red`;
        this.setActiveColor(color);
        this.setActiveLabel(`Active:\n${this.active}`);
        const sub = this.metronome.subscriptions.filter(x => x.id === this.id)[0];
        sub.active = this.active;
    }

    setActiveLabel(label: string) {
        this.activeLabel = label;
    }

    setActiveColor(color: string) {
        this.activeBtn.addComponentOrReplace(ZooTools_Materials[color]);
    }
}