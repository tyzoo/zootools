import { Dash_Wait as Wait } from "dcldash"

export class CameraChecker implements ISystem {
	public timer = 0;
	constructor(private onMove: OnMove) {}
	public update(dt: number): void {
		this.timer += dt;
		if (this.timer > 0.5) {
			this.timer = 0;
			// log('waitingmove', dt);
			if (this.onMove.hasMoved()) {
				log(`ZooTools: MOVEMENT DETECTED!  ${this.onMove.queue.length} delayed items`);
				this.onMove.movement = true;
				engine.removeSystem(this.onMove.cameraChecker);
				this.onMove.queue.forEach(fn => {
					fn();
				});
				this.onMove.queue = [];
			}
		}
	}
}

export class PersistUntil implements ISystem {
	public timer = 0;
	constructor(private onMove: OnMove, private onDone: Function, private interval: number = 0.5) {}
	public update(dt: number): void {
		this.timer += dt;
		if (this.timer > this.interval) {
			this.timer = 0;
			this.onMove.setCamera();
			if (this.onMove.hasLoaded()) {
				this.onMove.loading = false;
				this.onDone();
				engine.removeSystem(this.onMove.persistUntil);
			}
		}
	}
}

export class OnMove {
	public loading: boolean = true;
	public movement: boolean = false;
	public queue: Function[] = [];
	public cameraChecker = new CameraChecker(this);
	public persistUntil = new PersistUntil(this, () => {
		engine.addSystem(this.cameraChecker);
	});
	private initialFeetPositionX: number = 0;
	private initialFeetPositionY: number = 0;
	private initialFeetPositionZ: number = 0;
	private initialRotationX: number = 0;
	private initialRotationY: number = 0;
	private initialRotationZ: number = 0;
	constructor() {
		// log(`initialx`, this.initialFeetPositionX);
		Wait(() => {
			// log('INITIALIZING MOVEMENT TRACKER');
			Wait(() => {
				engine.addSystem(this.persistUntil);
			}, 1);
		}, 0);
	}
	private round = 0;
	public setCamera(): void {
		this.round++;
		const instance = { ...Camera.instance };
		this.initialFeetPositionX = instance.feetPosition.x;
		this.initialFeetPositionY = instance.feetPosition.y;
		this.initialFeetPositionZ = instance.feetPosition.z;
		this.initialRotationX = instance.rotation.x;
		this.initialRotationY = instance.rotation.y;
		this.initialRotationZ = instance.rotation.z;
	}
	public hasLoaded(): boolean {
		return (
			this.initialFeetPositionX !== 0 ||
			this.initialFeetPositionY !== 0 ||
			this.initialFeetPositionZ !== 0 ||
			this.initialRotationX !== 0 ||
			this.initialRotationY !== 0 ||
			this.initialRotationZ !== 0
		);
	}
	public hasMoved(): boolean {
		if(this.round < 5) {
			this.setCamera();
			return false;
		}
		const instance = Camera.instance;
		// log(`instancex`, instance.feetPosition.x);
		if (instance.feetPosition.x !== this.initialFeetPositionX) return true;
		if (instance.feetPosition.y !== this.initialFeetPositionY) return true;
		if (instance.feetPosition.z !== this.initialFeetPositionZ) return true;
		if (instance.rotation.x !== this.initialRotationX) return true;
		if (instance.rotation.y !== this.initialRotationY) return true;
		if (instance.rotation.z !== this.initialRotationZ) return true;
		return false;
	}
	public addToQueue(fn: Function): boolean {
		if (!this.movement) {
			this.queue.push(fn);
			return true;
		} else {
			fn();
			return false;
		}
	}
}
