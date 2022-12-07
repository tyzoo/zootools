import { AdminButtonBehavior } from "./behavior"

export class AdminScrollbar extends Entity {
    private colliderShape: BoxShape = new BoxShape()
    private buttonColliderUp: Entity = new Entity()
    private buttonColliderDown: Entity = new Entity()
    private text: Entity = new Entity()
    private textShape: TextShape = new TextShape()
    private upButton: AdminButtonBehavior
    private downButton: AdminButtonBehavior
    public loadPage: (selectedPageId: number) => void = (selectedPageId: number)=>{
        // log('Pagination', '$$$$$$$$ LoadPage Default Function Called $$$$$$$$')
    }

    private pageCount: number = 0
    private selectedPageId: number = 0

    constructor(
        private readonly transform: Transform,
    ){
        super()
        this.addComponent(new Transform({
            position: transform.position.clone(),
            rotation: transform.rotation.clone(),
        }))

        const { scale: s } = transform

        const p = .05 // P for "p"adding, not position. Confusing? Yes.

        const buttonUpTransform = new Transform({
            position: new Vector3(0, (s.y/4)+p/2 ,0),
            scale: new Vector3(s.x, (s.y/2)-p/2, s.z),
        })
        this.buttonColliderUp.addComponent(this.colliderShape)
        this.buttonColliderUp.addComponent(buttonUpTransform)
        this.upButton = new AdminButtonBehavior(this, this.buttonColliderUp, buttonUpTransform)
        this.upButton.onClick = () => {
            // log('Pagination ---------------', 'GOING UP!')
            this.onPageUp()
        }
        this.buttonColliderUp.setParent(this)


        const buttonDownTransform = new Transform({
            position: new Vector3(0, ((s.y/4)*-1)-p/2 ,0),
            scale: new Vector3(s.x, (s.y/2)+p/2, s.z),
        })
        this.buttonColliderDown.addComponent(this.colliderShape)
        this.buttonColliderDown.addComponent(buttonDownTransform)
        this.downButton = new AdminButtonBehavior(this, this.buttonColliderDown, buttonDownTransform)
        this.downButton.onClick = () => {
            // log('Pagination +++++++++++++', 'GOING DOWN!')
            this.onPageDown()
        }
        this.buttonColliderDown.setParent(this)
    }

    onPageUp(){
        --this.selectedPageId
        this.loadPage(this.selectedPageId)
        this.updateButtons()
    }

    onPageDown(){
        ++this.selectedPageId
        this.loadPage(this.selectedPageId)
        this.updateButtons()
    }

    updateButtons(){
        // log('Disabled State (down, up)', this.selectedPageId+1 >= this.pageCount, this.selectedPageId <= 0)
        this.downButton.setDisabled(this.selectedPageId+1 >= this.pageCount)
        this.upButton.setDisabled(this.selectedPageId <= 0)
    }

    setState(pageCount: number, selectedPageId: number){
        this.pageCount = pageCount
        this.selectedPageId = selectedPageId
        log('Pagination', 'PageCount', this.pageCount)
        log('Pagination', 'SelectedPageId', this.selectedPageId)
        this.updateButtons()
    }

    setSelectedPageId(id: number){
        this.selectedPageId = id
    }
}