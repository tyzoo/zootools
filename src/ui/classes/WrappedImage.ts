import { Dash_GlobalCanvas, Dash_Wait } from "dcldash";
import { objectAssign } from "../../utils/index";

export interface IWrappedImageOptions {
    hAlign: string;
    vAlign: string;
    startVisible: boolean;
    isPointerBlocker: boolean;
}

export const defaultWrappedImageProps: IWrappedImageOptions = {
  hAlign: 'center',
  vAlign: 'center',
  startVisible: true,
  isPointerBlocker: true,
}

export class WrappedImage {
    img: UIImage
    rect: UIContainerRect
    constructor(
        public props: {
            parent?: UIShape,
            src: Texture,
            dimensions: Vector2,
            slice: Vector4,
            offset?: Vector2,
        },
        public options: Partial<IWrappedImageOptions> = defaultWrappedImageProps
    ){
        this.options = objectAssign(defaultWrappedImageProps, this.options);
        if(!this.props.offset) this.props.offset = new Vector2(0,0);
        const parent = props.parent ? props.parent : Dash_GlobalCanvas;
        this.rect = new UIContainerRect(parent);
        this.rect.visible = true;
        this.rect.opacity = 1;
        this.rect.positionX = 0
        this.rect.positionY = 0
        this.img = new UIImage(this.rect, this.props.src);
        this.img.positionX = this.props.offset!.x;
        this.img.positionY = this.props.offset!.y;
        this.img.width = this.props.dimensions.x;
        this.img.height = this.props.dimensions.y;
        this.img.sourceLeft = this.props.slice.x * 2;
        this.img.sourceTop = this.props.slice.y * 2;
        this.img.sourceWidth = this.props.slice.w * 2;
        this.img.sourceHeight = this.props.slice.z * 2;
        this.img.hAlign = options.hAlign!;
        this.img.vAlign = options.vAlign!;
        this.img.sizeInPixels = true;
        if(options.startVisible){
            this.show();
        }else{
          this.img.visible = false;
        }
        this.img.opacity = 1;
        this.img.visible = true;
    }
    show(seconds?: number):void {
        this.img.isPointerBlocker = this.options.isPointerBlocker!;
        this.img.visible = true;
        if(seconds) Dash_Wait(()=>{ this.hide(); }, seconds);
    }
    hide():void {
        this.img.isPointerBlocker = false;
        this.img.visible = false;
    }
    setOnClick(cb?: () => void): void {
      if(cb){
        this.img.onClick = new OnPointerDown(() => { cb(); });
      }else{
        this.img.onClick = null;
      }
    }
}