import { Dash_Wait as Wait } from "dcldash"

export class CameraChecker implements ISystem {
	timer = 0;
	constructor(private onMove: OnMove) {}
	update(dt: number) {
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
	timer = 0;
	constructor(private onMove: OnMove, private onDone: Function) {}
	update(dt: number) {
		this.timer += dt;
		if (this.timer > 0.5) {
			this.timer = 0;
			// log('persist', dt);
			this.onMove.setCamera();
			if (this.onMove.hasLoaded()) {
				this.onMove.loading = false;
				// log('LOADING DONE!!!');
				this.onDone();
				engine.removeSystem(this.onMove.persistUntil);
			}
		}
	}
}

export class OnMove {
	loading: boolean = true;
	movement: boolean = false;
	queue: Function[] = [];
	initialFeetPositionX: number = 0;
	initialFeetPositionY: number = 0;
	initialFeetPositionZ: number = 0;
	initialRotationX: number = 0;
	initialRotationY: number = 0;
	initialRotationZ: number = 0;
	cameraChecker = new CameraChecker(this);
	persistUntil = new PersistUntil(this, () => {
		engine.addSystem(this.cameraChecker);
	});
	constructor() {
		// log(`initialx`, this.initialFeetPositionX);
		Wait(() => {
			// log('INITIALIZING MOVEMENT TRACKER');
			Wait(() => {
				engine.addSystem(this.persistUntil);
			}, 1);
		}, 0);
	}
	round = 0;
	setCamera() {
		this.round++;
		const instance = { ...Camera.instance };
		// log(`Setting camera - round ${this.round}`,instance)
		this.initialFeetPositionX = instance.feetPosition.x;
		this.initialFeetPositionY = instance.feetPosition.y;
		this.initialFeetPositionZ = instance.feetPosition.z;
		this.initialRotationX = instance.rotation.x;
		this.initialRotationY = instance.rotation.y;
		this.initialRotationZ = instance.rotation.z;
	}
	hasLoaded(): boolean {
		return (
			this.initialFeetPositionX !== 0 ||
			this.initialFeetPositionY !== 0 ||
			this.initialFeetPositionZ !== 0 ||
			this.initialRotationX !== 0 ||
			this.initialRotationY !== 0 ||
			this.initialRotationZ !== 0
		);
	}
	hasMoved() {
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
	addToQueue(fn: Function): boolean {
		if (!this.movement) {
			this.queue.push(fn);
			return true;
		} else {
			fn();
			return false;
		}
	}
}
