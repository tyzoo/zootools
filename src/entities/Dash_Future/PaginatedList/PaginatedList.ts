import { AdminConsoleListButton } from "../AdminConsole/AdminConsoleListButton"
import { AdminScrollbar } from "../AdminConsole/AdminScrollbar"
import { Dash_Utils_Chunk } from "../Utils/chunk"
import { PaginatedListItem } from "./types"

const amount = 10
const xPadding = .2
const yPadding = .045
const rowCount = 10
const calcYPosition = (i: number, a: number, p: number) => ((i*.3)+(p*i)) - ((.3+p)*((a-1)/2))

export class Dash_PaginatedList extends Entity {
    public active: boolean = false;
    public id: string | null = null;
    public background: Entity | undefined
    public onClickAllCallback: ()=>void = () => {
        this.active = false;
    }
    private itemData: PaginatedListItem[][] = []
    private itemRow: AdminConsoleListButton[] = []
    private scroller: AdminScrollbar
    private readonly rowCount: number = 10
    private readonly initialTransform: Transform

    constructor(
        private readonly transform: Transform, 
        public options: {
            closeOnClick: boolean,
        } = {
            closeOnClick: true,
        },
        public onChange: (id: string, newValue: string) => void,
    ){
        super()
        this.initialTransform = transform
        this.addComponent(new Transform(transform))
        this.renderBackground()
        this.createListItems()
        
        const s = .9
        this.scroller = new AdminScrollbar(new Transform({
            position: new Vector3(-2.870, 0.000, 0.1),
            scale: new Vector3(0.360*s, 3.740*s, 0.0300*s),
            rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
        }))
        this.scroller.loadPage = this.loadPage.bind(this)
        this.scroller.setParent(this)
    }

    public setId(id: string){
        this.id = id;
    }

    private renderBackground(){
        if(!this.background) this.background = new Entity()
        this.background?.addComponentOrReplace(new BoxShape())
        this.background?.addComponentOrReplace(new Transform({
            position: new Vector3(0.000, 0.000, 0.100),
            scale: new Vector3(5.260, 3.740, 0.100),
            rotation: new Quaternion().setEuler(0.000, 0.000, 0.000),
        }))
        this.background?.addComponentOrReplace(new Material())
        this.background.getComponent(Material).albedoColor = Color3.Black();
        this.background?.setParent(this)
    }

    private createListItems(){
        for(let i=0; i<this.rowCount; i++){
            const button = new AdminConsoleListButton("", new Transform({
                position: new Vector3(0, calcYPosition(i, rowCount, yPadding), 0), // 0.010),
                scale: new Vector3(5,.3,.05)
            }))
            button.textShape.fontSize = 20
            button.textShape.hTextAlign = "left"
            button.setParent(this)
            this.itemRow.push(button)
        }
    }

    show(){
        // const { scale } = this.initialTransform
        // Dash_AnimationQueue.add({
        //     duration: 1.5,
        //     data: { entity: this },
        //     onFrame(progress: number, data: any) {
        //         log('DATA ENTITY', data)
        //         // const { scale } = data.oTransform
        //         data.entity.getComponent(Transform).scale.setAll(
        //             Scalar.Lerp(scale.x*1.2, scale.x, Dash_Ease.easeOutElastic(progress)),
        //         )
        //     },
        //     onComplete(data: any){
        //         data.entity.loadPage(0)
        //     }
        // })
        engine.addEntity(this)
    }

    hide(){
        // const { scale } = this.initialTransform
        // Dash_AnimationQueue.add({
        //     duration: 1,
        //     data: { entity: this, oTransform: this.transform },
        //     onFrame(progress: number, data: any) {
        //         log('DATA ENTITY', data)
        //         const t = data.entity.getComponent(Transform)
        //         t.scale.setAll(Scalar.Lerp(scale.x, 0, Dash_Ease.easeInOutElastic(progress)))
        //     },
        //     onComplete(data: any){
        //         const { entity } = data
        //         if(entity.onClose){ entity.onClose() }
        //         engine.removeEntity(data.entity)
        //     }
        // })
        engine.removeEntity(this);
    }

    setContent(items: PaginatedListItem[]){
        this.itemData = Dash_Utils_Chunk(items, this.rowCount).map((page: PaginatedListItem[])=> {
            while(page.length < this.rowCount){ page.push({ label: '' })}
            return page.reverse()
        })
        log('Pagetest', this.itemData)
        this.scroller.setState(this.itemData.length, 0)
    }

    getItemData(){ return this.itemData }

    loadPage(pageIndex: number){
        // log('Pagination', 'this.itemData', this.itemData)
        // log('Pagination', 'IN PaginatedList.ts Loading Page', pageIndex)
        const items = this.itemData[pageIndex] // this.getItemData()[pageIndex]

        // log('Pagination', items)
        if(items){
            const rows = [...items]
            if(rows){
                for(let i=0; i<this.rowCount; i++){
                    const row = this.itemRow[i]
                    // log(row)
                    const item = this.itemData[pageIndex][i]
                    // log('DATA ENTITY', this)
                    if(item && item.label && item.onClick){
                        row.textShape.value = item.label.slice(0,45)
                        row.button.onClick = ()=>{
                            if(item.onClick) item.onClick()
                            this.onChange(this.id!, item.label)
                            if(this.onClickAllCallback){
                                this.onClickAllCallback()
                            }
                            if(!this.options.closeOnClick){
                                return;
                            }
                            if(!item.preventClose) this.hide()
                        }
                    }else{ row.textShape.value = "" }
                }
            }
        }
    }
}
