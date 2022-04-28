import { Dash_Ease, Dash_GlobalCanvas, Dash_Wait, DynamicImage } from "dcldash";
import { objectAssign } from "../../utils/index";

export interface IWrappedDynamicImageOptions {
    hAlign: string;
    vAlign: string;
    startVisible: boolean;
    isPointerBlocker: boolean;
    hideAfter: number;
    fadeInTime?: number;
    fadeInEase?: (x: number) => number;
    scaleInStarting?: number;
    scaleInTime?: number;
    scaleInEase?: (x: number) => number;
    fadeOutTime?: number;
    fadeOutEase?: (x: number) => number;
    scaleOutEnding?: number;
    scaleOutTime?: number;
    scaleOutEase?: (x: number) => number;
}

export const defaultWrappedDynamicImageProps: IWrappedDynamicImageOptions = {
  hAlign: 'center',
  vAlign: 'center',
  startVisible: false,
  isPointerBlocker: false,
  hideAfter: 3,
  fadeInTime: 0.5,
  fadeInEase: Dash_Ease.easeInElastic,
  scaleInStarting: 0,
  scaleInTime: 0.5,
  scaleInEase: Dash_Ease.easeInBounce,
  fadeOutTime: 0.5,
  fadeOutEase: Dash_Ease.easeOutElastic,
  scaleOutEnding: 0,
  scaleOutTime: 0.5,
  scaleOutEase: Dash_Ease.easeOutBounce,
}

export class WrappedDynamicImage {
    di: DynamicImage
    constructor(
        private props: {
            src: string,
            demensions: Vector2,
            slice: Vector4,
            offset?: Vector2,
        },
        private options: IWrappedDynamicImageOptions = defaultWrappedDynamicImageProps
    ){
        this.options = objectAssign(defaultWrappedDynamicImageProps, this.options);
        if(!props.offset) this.props.offset = new Vector2(0,0);
        const img = new UIImage(Dash_GlobalCanvas, new Texture(this.props.src));
        img.positionX = this.props.offset!.x;
        img.positionY = this.props.offset!.y;
        img.width = this.props.demensions.x;
        img.height = this.props.demensions.y;
        img.sourceLeft = this.props.slice.x;
        img.sourceTop = this.props.slice.y;
        img.sourceWidth = this.props.slice.w;
        img.sourceHeight = this.props.slice.z;
        img.hAlign = options.hAlign;
        img.vAlign = options.vAlign;
        this.di = new DynamicImage(img);
        if(options.startVisible){
            this.show();
            if(!!!isNaN(options.hideAfter)) Dash_Wait(()=>{ this.hide(); }, options.hideAfter)
        }else{
          this.di.image.visible = false;
        }
    }
    show(seconds?: number):void {
        this.di.image.isPointerBlocker = this.options.isPointerBlocker;
        this.di.image.visible = true;
        this.di.fadeIn(this.options.fadeInTime!, this.options.fadeInEase!);
        this.di.scaleIn(this.options.scaleInStarting!, this.options.scaleInTime!, this.options.scaleInEase!);
        if(seconds || this.options.hideAfter) Dash_Wait(()=>{ this.hide(); }, seconds ? seconds : this.options.hideAfter);
    }
    hide():void {
        this.di.fadeOut(this.options.fadeOutTime!, this.options.fadeOutEase!);
        this.di.scaleOut(this.options.scaleOutEnding!, this.options.scaleOutTime!, this.options.scaleOutEase!);
        Dash_Wait(()=>{
            this.di.image.isPointerBlocker = false;
            this.di.image.visible = false;
        }, this.options.scaleOutTime!);
    }
}