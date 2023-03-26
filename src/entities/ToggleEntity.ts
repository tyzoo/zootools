
export class ZooTools_ToggleEntity extends Entity {
  hide() {
    if (this.isAddedToEngine()) engine.removeEntity(this)
  }
  show() {
    if (!this.isAddedToEngine()) engine.addEntity(this)
  }
}
