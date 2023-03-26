export abstract class ZooTools_ToggleSystem implements ISystem {
  system: ISystem
  constructor() {
    this.system = this
  }
  abstract update: (dt: number) => void;
  start() {
    if (!this.system.active) {
      engine.addSystem(this.system)
    }
  }
  stop() {
    if (this.system.active) {
      engine.removeSystem(this.system)
    }
  }
}