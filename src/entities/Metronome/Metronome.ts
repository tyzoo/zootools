import { Dash_OnUpdateFrame, Dash_OnUpdateFrame_Instance } from "dcldash";
import { ZooTools_ControlBoard } from "../ControlBoard/ControlBoard";
import { ZooTools_ControlBoardButton } from "../ControlBoard/components/ControlBoardButton";
import { ZooTools_MetronomeTapBPM } from "./MetronomeTapBPM";
import { ZooTools_Metronome_ISubscription } from "./types";
import { Dash_PaginatedList } from "../Dash_Future/PaginatedList/PaginatedList";
import { ZooTools_Metronome_DCLConnect_Assign_Commands_Instance } from "../../dclconnect/v3/plugins/ZootoolsMetronomeUtil";
import weightedRandom from "./WeightedRandom";

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

    list: Dash_PaginatedList;
    render: Dash_OnUpdateFrame_Instance;
    dclc: ZooTools_Metronome_DCLConnect_Assign_Commands_Instance;
    constructor(
        public transform: TransformConstructorArgs,
        public defaultBPM: number = 128,
        public onUserSetBPM: (bpm: number) => void = () => { },
        public onUserSetActive: (id: string, active: boolean) => void = () => { },
        public onUserTriggeredAction: (id: string, value: string) => void = () => { },
        public onUserStartedQueue: () => void = () => { },
        public onUserEndedQueue: () => void = () => { },
    ) {
        super()

        this.bpm = this.defaultBPM;
        this.dclc = new ZooTools_Metronome_DCLConnect_Assign_Commands_Instance(this);

        const { rotation } = transform;
        this.addComponent(new Transform({
            ...this.transform,
            rotation: rotation ? rotation : Quaternion.Euler(-90, 0, 0),
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
                this.render.start();
                this.onUserStartedQueue();
            } else {
                this.onUserEndedQueue();
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
        if (this.subscriptions.length) {
            this.subscribeOrUpdate(this.subscriptions)
        }

        this.list = new Dash_PaginatedList(new Transform({
            position: new Vector3(-0.6, 0.63, -.10),
            scale: new Vector3(0.2, 0.3, 0.2),
            rotation: new Quaternion().setEuler(90, 0, 0),
        }), { closeOnClick: true }, (id: string, newValue: any) => {
            const output = this.outputs.get(id);
            output?.highlightClick();
            output?.callback(newValue, true);
        })

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
            btn?.setColor(`Red`)
            btn?.setLabel(`Not\nActive`)

        } else {
            if (!this.initialized) {
                this.initialized = true;
                const btn: ZooTools_ControlBoardButton = this.buttons.get(`active`);
                btn?.setColor(`Green`)
                btn?.setLabel(`Active`)
                const b1 = this.markers.get(`bar1`);
                b1?.setColor(`Green`)
                this.onBarAction(1);
            }
        }
    }

    setActive(active: boolean) {
        this.active = active;
        if (active) {
            this.render.start();
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
            const { on, every, number, active } = x;
            if (!active) return false
            if (!on && !every) return false;
            if (on) return on === "beat" && number === beat
            else if (every) {
                return every === "beat" && number === 1
                    || every === "beat" && this.isDivisible(beat, number)
            }
        })
        actions?.forEach(action => {
            const output = this.outputs.get(action.id);
            const randomAction = weightedRandom(action.actions);
            output?.highlightClick();
            output?.callback(randomAction.name, false);
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
            const { on, every, number, active } = x;
            if (!active) return false
            if (!on && !every) return false;
            if (on) return on === "bar" && number === bar
            else if (every) {
                return every === "bar" && number === 1
                    || every === "bar" && this.isDivisible(bar, number)
            }
        });
        actions?.forEach(action => {
            const output = this.outputs.get(action.id);
            output?.highlightClick();
            const randomAction = weightedRandom(action.actions);
            output?.callback(randomAction.name, false);
        })
    }

    setBeatMarkers(beat: number) {
        const m1 = this.markers.get(`beat1`);
        const m2 = this.markers.get(`beat2`);
        const m3 = this.markers.get(`beat3`);
        const m4 = this.markers.get(`beat4`);
        if (m1 && m2 && m3 && m4) {
            const reset = () => {
                m1.setColor(`Gray`)
                m2.setColor(`Gray`)
                m3.setColor(`Gray`)
                m4.setColor(`Gray`)
            }
            switch (beat) {
                default: case 0: reset(); break;
                case 1: reset(); m1.setColor(`Green`); break;
                case 2: m2.setColor(`Green`); break;
                case 3: m3.setColor(`Green`); break;
                case 4: m4.setColor(`Green`); break;
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
                b1.setColor(`Gray`)
                b2.setColor(`Gray`)
                b3.setColor(`Gray`)
                b4.setColor(`Gray`)
                b5.setColor(`Gray`)
                b6.setColor(`Gray`)
                b7.setColor(`Gray`)
                b8.setColor(`Gray`)
            }
            switch (bar) {
                default: case 0: reset(); break;
                case 1: reset(); b1.setColor(`Green`); break;
                case 2:
                    b1.setColor(`Green`);
                    b2.setColor(`Green`); break;
                case 3: b3.setColor(`Green`); break;
                case 4: b4.setColor(`Green`); break;
                case 5: b5.setColor(`Green`); break;
                case 6: b6.setColor(`Green`); break;
                case 7: b7.setColor(`Green`); break;
                case 8: b8.setColor(`Green`); break;
            }
        }
    }
    subscribed: boolean = false;
    subscribeOrUpdate(subs: ZooTools_Metronome_ISubscription[]) {
        if (!this.subscribed) {
            //create
            this.subscribed = true
            subs.forEach(sub => this.subscriptions.push(sub));
            for (let i = 1; i < subs.length + 1; i++) {
                const sub = subs[i - 1];
                this.addOutputMarker(
                    sub,
                    2,
                    {
                        position: new Vector3(-1.05 + (i - 1) * 0.3, 0.47, -0.65),
                        scale: new Vector3(0.25, 0.1, 0.25),
                    },
                );
                const options = this.addOptions(
                    sub,
                    2,
                    {
                        position: new Vector3(-1.05 + (i - 1) * 0.3, 0.43, -0.87),
                        rotation: new Quaternion().setEuler(-90, 0, 0),
                    },
                    this.onUserSetActive,
                );
            }
            this.list.setParent(null)
        }else{
            //update
            subs.forEach((sub, i) => {
                this.subscriptions[i].active = sub.active;
                const options = this.options.get(sub.id);
                options?.activate(sub.active);
                this.subscriptions[i].actions = sub.actions;
            })
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


