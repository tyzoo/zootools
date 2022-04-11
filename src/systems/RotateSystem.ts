export class RotateSystem implements ISystem {
    constructor(public rotateLeft: Entity[], public rotateRight: Entity[]) {}
    update() {
      this.rotateLeft.forEach(e=>e.getComponent(Transform).rotate(Vector3.Up(), 1.5));
      this.rotateRight.forEach(e=>e.getComponent(Transform).rotate(Vector3.Down(), 1));
    }
}