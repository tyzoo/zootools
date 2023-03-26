import { Dash_BoxHighlight, Dash_OnUpdateFrame } from "dcldash";
// import * as ui from "@dcl/ui-scene-utils";

const playerHeight = 1.5 / 2

// interface Dash_OnUpdateFrame_Setting {
//   id?: number
//   data?: any
//   onFrame?: (data: any) => void
// }

// interface Dash_OnUpdateFrame_Instance {
//   setting: Dash_OnUpdateFrame_Setting
//   start: () => void
//   stop: () => void
// }

export class ZoneMaker extends Entity {

  private shape: BoxShape = new BoxShape()
  private material: Material = new Material()
  private minPosition: Vector3 = new Vector3()
  private maxPosition: Vector3 = new Vector3()
  private initialFeetPosition: Vector3 = new Vector3()
  private hasMoved: boolean = false
  private isOn: boolean = false
  private bh: Dash_BoxHighlight | undefined;
  private startPosition: Vector3 | undefined
  private onFrame: any | undefined
  private subscribed: boolean = false;
  // private prompt: ui.FillInPrompt | undefined

  constructor() {
    super()
    Input.instance.subscribe(
      'BUTTON_DOWN',
      ActionButton.SECONDARY,
      true,
      event => {
        if (!this.subscribed) {
          this.init()
          // if (this.prompt) this.prompt.close();
        } else {
          this.commitZone()
        }
      }
    );
    engine.addEntity(this)
  }

  init() {
    if (this.isOn) return;
    this.subscribed = true;
    this.startPosition = Camera.instance.feetPosition.clone();
    this.shape.withCollisions = false
    this.material.albedoColor = new Color4(0, 1, 1, .1)
    this.bh = new Dash_BoxHighlight(
      new Vector3(),
      new Vector3().setAll(1),
      'top'
    )
    this.bh.setParent(this);
    this.addComponentOrReplace(this.shape);
    this.addComponentOrReplace(this.material);
    this.addComponentOrReplace(new Transform({
      position: this.startPosition.clone(),
      scale: new Vector3(1, 1, 1)
    }))
    this.onFrame = Dash_OnUpdateFrame.add(() => {
      const currentPosition = Camera.instance.feetPosition
      if (!this.hasMoved && Vector3.Distance(currentPosition, this.initialFeetPosition) > .1) {
        this.hasMoved = true
      }
      if (this.hasMoved) {
        const { x: camX, y: camY, z: camZ } = currentPosition
        const { x: minX, y: minY, z: minZ } = this.minPosition
        const { x: maxX, y: maxY, z: maxZ } = this.maxPosition
        const x = this.startPosition!.x - camX
        const y = this.startPosition!.y - camY
        const z = this.startPosition!.z - camZ
        if (x < minX) this.minPosition.x = x
        if (y < minY) this.minPosition.y = y
        if (z < minZ) this.minPosition.z = z
        if (x > maxX) this.maxPosition.x = x
        if (y > maxY) this.maxPosition.y = y
        if (z > maxZ) this.maxPosition.z = z
        const minPosition = Vector3.Add(this.minPosition.negate(), this.startPosition!).clone()
        const maxPosition = Vector3.Add(this.maxPosition.negate(), this.startPosition!).clone()
        const center = Vector3.Center(minPosition, maxPosition)
        this.getComponent(Transform).position = Vector3.Add(center, new Vector3(0, playerHeight, 0))
        this.getComponent(Transform).scale = new Vector3(
          (this.maxPosition.x - this.minPosition.x),
          (this.maxPosition.y - this.minPosition.y) + playerHeight * 2,
          (this.maxPosition.z - this.minPosition.z),
        )
      }
    })
    this.onFrame.start()
    this.isOn = true
    this.addComponentOrReplace(new OnPointerDown(() => {
      this.commitZone()
    }, {
      hoverText: `Commit zone`,
      button: ActionButton.POINTER
    }))
  }

  commitZone() {
    this.isOn = false;
    this.hasMoved = false;
    this.subscribed = false;
    this.onFrame?.stop()
    this.onStop();
    this.destroy();
  }

  onStop() {
    // if(this.prompt) this.prompt.close();
    // this.prompt = new ui.FillInPrompt("Name your Zone", (zoneName:string)=>{
    const { position, scale, rotation } = this.getComponent(Transform);
    const { x: px, y: py, z: pz } = position;
    const { x: sx, y: sy, z: sz } = scale;
    const { x: rx, y: ry, z: rz } = rotation;
    log([
      `\n const transform = new Transform({`,
      `\n   position: new Vector3(${px},${py},${pz}),`,
      `\n   scale: new Vector3(${sx},${sy},${sz}),`,
      `\n   rotation: new Quaternion().setEuler(${rx},${ry},${rz}),`,
      `\n });`,
    ].join(""))
    // });
  }

  destroy() {
    if (this.bh) {
      this.bh.hide()
      if (this.bh.alive) {
        engine.removeEntity(this.bh)
      }
    }
    this.bh = undefined;
    this.minPosition = new Vector3()
    this.maxPosition = new Vector3()
    this.initialFeetPosition = new Vector3()
    this.startPosition = undefined
  }

  disable() {
    Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.SECONDARY, (e: any) => {
      log("Disabled ZoneMaker")
    })
  }
}
