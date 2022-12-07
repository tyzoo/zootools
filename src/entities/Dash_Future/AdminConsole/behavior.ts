import { Dash_Ease } from "dcldash"
import { Dash_AnimationQueue } from "../AnimationQueue/AnimationQueue"
import { AdminButtonClickAnimationSetting, AdminButtonMaterialConfig } from "./interfaces"
import { AdminButtonClickAnimationDefault, AdminButtonMaterialDefault } from "./presets"

export class AdminButtonBehavior {
    private isMouseDown: boolean = false
    private isHovering: boolean = false 
    private isDisabled: boolean = false
    public onClick: (()=>void) | null | undefined = null

    constructor(
        private entity: Entity,
        private colliderEntityShape: Entity,
        private readonly transform: Transform,
        private readonly materials: AdminButtonMaterialConfig = AdminButtonMaterialDefault,
        private readonly scaleOptions: AdminButtonClickAnimationSetting = AdminButtonClickAnimationDefault
    ){

        colliderEntityShape.getComponentOrCreate(Transform).scale = transform.scale.clone()
        colliderEntityShape.addComponentOrReplace(materials.off)

        colliderEntityShape.addComponentOrReplace(new OnPointerDown(()=>{
            if(this.isDisabled) {
                if(!this.onClick) return
                this.setMaterial(this.materials.disabled, 'Disabled')
                return
            }
            if(!this.onClick) return
            this.isMouseDown = true
            this.setMaterial(this.materials.on, 'On')
        },{
            showFeedback: false,
        }))

        colliderEntityShape.addComponentOrReplace(new OnPointerUp(()=>{
            this.isMouseDown = false
            if(this.isDisabled) {
                this.setMaterial(this.materials.disabled, 'Disabled')
                return
            }

            if(!this.onClick) return

            if(this.isHovering && !this.isDisabled){
                this.onClickAnimation()
                if(this.onClick) this.onClick()
                this.setMaterial(this.materials.hover, 'Hover - 3')
            }else{
                if(!this.isDisabled){ this.setMaterial(this.materials.off, 'Off') }
            }
            
        },{
            showFeedback: false
        }))

        colliderEntityShape.addComponentOrReplace(new OnPointerHoverEnter(()=>{
            if(this.isDisabled) {
                this.setMaterial(this.materials.disabled, 'Disabled')
                if(!this.onClick) return
            }
            if(!this.onClick || this.isDisabled) return
            this.isHovering = true
            if(this.isMouseDown){
                this.setMaterial(this.materials.on, 'On')
            }else{
                this.setMaterial(this.materials.hover, 'Hover - 2')
            }
        }))

        colliderEntityShape.addComponentOrReplace(new OnPointerHoverExit(()=>{
            if(this.isDisabled) {
                this.setMaterial(this.materials.disabled, 'Disabled')
                if(!this.onClick) return
            }
            if(!this.onClick || this.isDisabled) return
            this.setMaterial(this.materials.off, 'Off')
            this.isHovering = false
        }))
    }

    setDisabled(disabled: boolean){
        this.isDisabled = disabled
        const state = {
            isHovering: this.isHovering,
            isMouseDown: this.isMouseDown,
            isDisabled: this.isDisabled,
        }

        if(disabled){
            this.isHovering = false
            this.isMouseDown = false
            this.setMaterial(this.materials.disabled, 'Disabled')
            return
        }else{
            if(this.isHovering){
                this.setMaterial(this.materials.hover, 'Hover - 1')
            }else if(this.isMouseDown){
                this.setMaterial(this.materials.on, 'On')
            }else {
                this.setMaterial(this.materials.off, 'Off')
            }
        }
    }

    logState(event?: string){
        // log('LOG STATE', event, { isHovering: this.isHovering, isMouseDown: this.isMouseDown, isDisabled: this.isDisabled })
    }

    private setMaterial(material: Material, name: string){
    //     log('Setting the material to', name, 'disabled?', this.isDisabled)
        this.colliderEntityShape.addComponentOrReplace(material)
    }

    private onClickAnimation(){
        let size = 1.1
        const { scale, position } = this.transform
        Dash_AnimationQueue.add({
            duration: 1,
            onFrame: (progress: number) => {
                const t = this.entity.getComponentOrCreate(Transform)
                t.scale.set(
                    this.scaleOptions.x ? Scalar.Lerp(
                        size,
                        1,
                        Dash_Ease.easeOutElastic(progress)
                    ): scale.x,
                    this.scaleOptions.y ? Scalar.Lerp(
                        size,
                        1,
                        Dash_Ease.easeOutElastic(progress)
                    ) : scale.y,
                    this.scaleOptions.z ? Scalar.Lerp(
                        size,
                        1,
                        Dash_Ease.easeOutElastic(progress)
                    ) : scale.z,
                )
            }
        })
    }
}