import { Dash_OnUpdateFrame, Dash_OnUpdateFrame_Instance } from "dcldash";
import { ZooTools_ControlBoard } from "../ControlBoard/ControlBoard";
import { ZooTools_ControlBoardButton } from "../ControlBoard/components/ControlBoardButton";
import { ZooTools_MetronomeTapBPM } from "./MetronomeTapBPM";
import { ZooTools_Metronome_ISubscription } from "./types";

export class ZooTools_Metronome extends ZooTools_ControlBoard {

    base = new Entity();

    active: boolean = false;
    initialized: boolean = false;

    bpm: number = 128;
    beat: number = 0;
    bar: number = 1;
    timer: number = 0;

    tap: ZooTools_MetronomeTapBPM;
    
    subscriptions: ZooTools_Metronome_ISubscription[] = [];
    
    render: Dash_OnUpdateFrame_Instance;

    constructor(public defaultBPM: number = 128) {
        super()

        this.bpm = this.defaultBPM;

        this.addComponent(new Transform({
            position: new Vector3(5, 2, 5),
            rotation: Quaternion.Euler(-90, 0, 0),
        }))

        engine.addEntity(this);

        this.addLabel(`title`, `Metronome`, 3, {
            position: new Vector3(-0.6, 0.5, 0.6),
            scale: new Vector3().setAll(0.75),
        });

        this.addLabel(`bpm`, `BPM: ${this.defaultBPM}`, 2, {
            position: new Vector3(-0.835, 0.5, 0.3),
            scale: new Vector3().setAll(0.75),
        });
        this.tap = new ZooTools_MetronomeTapBPM(this);

        this.addButton(`active`, `Active`, 2, {
            position: new Vector3(0.3, 0.47, 0.15),
            scale: new Vector3(0.55, 0.1, 0.55),
        }, () => {
            const setTo = !this.active;
            this.active = setTo;
            if (setTo === true) {
                this.render.start()
            }
        });

        this.addButton(`tap`, `Tap BPM`, 2, {
            position: new Vector3(0.9, 0.47, 0.15),
            scale: new Vector3(0.55, 0.1, 0.55),
        }, () => {
            this.tap.tap();
        });

        /**
         * Beat markers
         */
        for (let i = 1; i < 5; i++) {
            this.addMarker(`beat${i}`, `${i}`, 2, {
                position: new Vector3(-1.05 + (i - 1) * 0.3, 0.47, 0),
                scale: new Vector3(0.25, 0.1, 0.25),
            });
        }

        /**
         * Bar markers
         */
        for (let i = 1; i < 9; i++) {
            this.addMarker(`bar${i}`, `${i}`, 2, {
                position: new Vector3(-1.05 + (i - 1) * 0.3, 0.47, -0.3),
                scale: new Vector3(0.25, 0.1, 0.25),
            });
        }

        /**
         * Actions markers
         */
        if(this.subscriptions.length){
            this.subscribe(this.subscriptions)
        }

        this.render = Dash_OnUpdateFrame.add((dt) => this.update(dt, this));
        this.render.start();
    }

    update(dt: number, instance: ZooTools_Metronome = this) {
        instance.checkActive();
        dt *= 1000;
        instance.timer += dt;
        if (instance.timer >= instance.calculateInterval(instance.bpm)) {
            instance.timer = 0;
            instance.beat += 1;
            if (instance.beat > 4) {
                instance.beat = 1;
                instance.bar += 1;
                if (instance.bar > 8) {
                    instance.bar = 1;
                }
                instance.onBarAction(instance.bar);
            }
            instance.onBeatAction(instance.beat);
        }
    }

    checkActive() {
        if (!this.active) {
            this.render.stop();
            this.initialized = false;
            this.setBeatMarkers(0);
            this.setBarMarkers(0);
            this.beat = 0;
            this.bar = 1;
            const btn: ZooTools_ControlBoardButton = this.buttons.get(`active`);
            btn?.setColor(Color3.Red())
            btn?.setLabel(`Not\nActive`)

        } else {
            if (!this.initialized) {
                this.initialized = true;
                const btn: ZooTools_ControlBoardButton = this.buttons.get(`active`);
                btn?.setColor(Color3.Green())
                btn?.setLabel(`Active`)
                const b1 = this.markers.get(`bar1`);
                b1?.setColor(Color3.Green())
                this.onBarAction(1);
            }
        }
    }

    setBPM(bpm: number) {
        this.bpm = bpm;
        const label = this.labels.get(`bpm`);
        if (label) {
            label.getComponent(TextShape).value = `BPM: ${bpm}`;
        }
    }

    onBeatCbs: ((beat: number) => void)[] = []
    onBeat(cb: (beat: number) => void) {
        this.onBeatCbs.push(cb);
    }
    onBeatAction(beat: number) {
        this.onBeatCbs.forEach(cb => cb(beat));
        this.setBeatMarkers(beat);
        const actions = this.subscriptions.filter((x: any) => {
            const { on, every, number } = x;
            if (on) return on === "beat" && number === beat
            else if (every) {
                return every === "beat" && number === 1 
                    || every === "beat" && this.isDivisible(beat, number)
            }
        });
        actions?.forEach(action => {
            this.outputs.get(action.id)?.action();
            action.callback();
        })
    }

    onBarCbs: ((bar: number) => void)[] = []
    onBar(cb: (bar: number) => void) {
        this.onBarCbs.push(cb);
    }
    onBarAction(bar: number) {
        this.onBeatCbs.forEach(cb => cb(bar));
        this.setBarMarkers(bar);
        const actions = this.subscriptions.filter((x: any) => {
            const { on, every, number } = x;
            if (on) return on === "bar" && number === bar
            else if (every) {
                return every === "bar" && number === 1 
                    || every === "bar" && this.isDivisible(bar, number)
            }
        });
        actions?.forEach(action => {
            this.outputs.get(action.id)?.action();
            action.callback();
        })
    }

    setBeatMarkers(beat: number) {
        const m1 = this.markers.get(`beat1`);
        const m2 = this.markers.get(`beat2`);
        const m3 = this.markers.get(`beat3`);
        const m4 = this.markers.get(`beat4`);
        if (m1 && m2 && m3 && m4) {
            const reset = () => {
                m1.setColor(Color3.Gray())
                m2.setColor(Color3.Gray())
                m3.setColor(Color3.Gray())
                m4.setColor(Color3.Gray())
            }
            switch (beat) {
                default: case 0: reset(); break;
                case 1: reset(); m1.setColor(Color3.Green()); break;
                case 2: m2.setColor(Color3.Green()); break;
                case 3: m3.setColor(Color3.Green()); break;
                case 4: m4.setColor(Color3.Green()); break;
            }
        }
    }

    setBarMarkers(bar: number) {
        const b1 = this.markers.get(`bar1`);
        const b2 = this.markers.get(`bar2`);
        const b3 = this.markers.get(`bar3`);
        const b4 = this.markers.get(`bar4`);
        const b5 = this.markers.get(`bar5`);
        const b6 = this.markers.get(`bar6`);
        const b7 = this.markers.get(`bar7`);
        const b8 = this.markers.get(`bar8`);
        if (b1 && b2 && b3 && b4 && b5 && b6 && b7 && b8) {
            const reset = () => {
                b1.setColor(Color3.Gray())
                b2.setColor(Color3.Gray())
                b3.setColor(Color3.Gray())
                b4.setColor(Color3.Gray())
                b5.setColor(Color3.Gray())
                b6.setColor(Color3.Gray())
                b7.setColor(Color3.Gray())
                b8.setColor(Color3.Gray())
            }
            switch (bar) {
                default: case 0: reset(); break;
                case 1: reset(); b1.setColor(Color3.Green()); break;
                case 2:
                    b1.setColor(Color3.Green());
                    b2.setColor(Color3.Green()); break;
                case 3: b3.setColor(Color3.Green()); break;
                case 4: b4.setColor(Color3.Green()); break;
                case 5: b5.setColor(Color3.Green()); break;
                case 6: b6.setColor(Color3.Green()); break;
                case 7: b7.setColor(Color3.Green()); break;
                case 8: b8.setColor(Color3.Green()); break;
            }
        }
    }

    subscribe(subs: ZooTools_Metronome_ISubscription[]){
        subs.forEach(sub => this.subscriptions.push(sub));
        for (let i = 1; i < subs.length + 1; i++) {
            this.addOutputMarker(subs[i - 1].id, subs[i - 1].name, 2, {
                position: new Vector3(-1.05 + (i - 1) * 0.3, 0.47, -0.65),
                scale: new Vector3(0.25, 0.1, 0.25),
            }, subs[i - 1].callback);
        }
    }

    calculateInterval(bpm: number) {
        const minMs = 1000 * 60;
        const beatMs = minMs / bpm;
        return beatMs
    }
    isDivisible(dividend: number, divisor: number): boolean {
        return dividend % divisor === 0;
    }
}


