import { AdminButtonBehavior } from "./behavior"
import { AdminPanelBackgroundMaterial } from "./presets"

export class AdminConsoleListButton extends Entity {
    public collider: Entity = new Entity()
    private colliderShape: BoxShape = new BoxShape()
    public text: Entity = new Entity()
    public textShape: TextShape = new TextShape()
    public button: AdminButtonBehavior

    constructor(label: string, private readonly transform: Transform){
        super()
        this.addComponent(new Transform({
            position: transform.position.clone(),
            rotation: transform.rotation.clone(),
        }))
        this.createLabel(label)
        this.createBackground()
        this.button = new AdminButtonBehavior(this, this.collider, transform)
    }

    createLabel(text: string){
        this.text.setParent(this)
        this.text.addComponent(this.textShape)
        this.text.addComponent(new Transform({
            position: new Vector3(0,0,(this.transform.scale.z/2*-1)-.01),
            scale: new Vector3().setAll(1/10)
        }))
        this.textShape.value = text
        this.textShape.width = (this.transform.scale.x)*10
        this.textShape.height = (this.transform.scale.y)*10
        this.textShape.textWrapping = true
        this.textShape.hTextAlign = "center"
        this.textShape.vTextAlign = "center"
        this.textShape.fontSize = 10
        const p = 1
        this.textShape.paddingTop = p
        this.textShape.paddingRight= p
        this.textShape.paddingBottom = p
        this.textShape.paddingLeft = p
    }

    createBackground(){
        this.collider.addComponent(this.colliderShape)
        this.collider.addComponent(new Transform({
            scale: this.transform.scale.clone()
        }))
        this.collider.addComponent(AdminPanelBackgroundMaterial)
        this.collider.setParent(this)
    }
}