import { DynamicContainerRect } from "dclconnect";
import { Dash_Ease, Dash_GlobalCanvas, Dash_Wait } from "dcldash";
import { WrappedDynamicImage } from "./WrappedDynamicImage"
import { objectAssign } from "../../utils/index";

export interface IWrappedDynamicContainerOptions {
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

export const defaultWrappedDynamicContainerProps: IWrappedDynamicContainerOptions = {
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

export class WrappedDynamicContainer {
	public container: DynamicContainerRect
	public active = false;
	public bg: WrappedDynamicImage | undefined;
    constructor(
        public props: {
          parent?: UIShape,
          src: Texture | undefined,
          dimensions: Vector2,
          slice: Vector4,
          offset?: Vector2,
        },
        public options: Partial<IWrappedDynamicContainerOptions> = defaultWrappedDynamicContainerProps
    ){
    if(!props.offset) this.props.offset = new Vector2(0,0);
		this.options = objectAssign(defaultWrappedDynamicContainerProps, this.options);
		this.container = new DynamicContainerRect(new UIContainerRect(Dash_GlobalCanvas));
		this.container.rect.hAlign = this.options.hAlign!;
		this.container.rect.vAlign = this.options.vAlign!;
		this.container.rect.positionX = this.props.offset!.x!;
		this.container.rect.positionY = this.props.offset!.y!;
		this.container.rect.opacity = 1;
		this.container.rect.isPointerBlocker = this.options.isPointerBlocker!;
    this.container.rect.visible = this.options.startVisible!;
    if(this.props.src){
      this.setBg(this.props.src, this.props.slice.z!, this.props.slice.w!)
    }
    if(options.startVisible){
      this.show();
      if(!!!isNaN(options.hideAfter!)) Dash_Wait(()=>{ this.hide(); }, options.hideAfter!);
    }else{
      this.container.rect.visible = false;
    }
  }
	public setBg(src: Texture, sourceWidth: number, sourceHeight: number, scale: number = 2 ): void {
		this.bg = new WrappedDynamicImage({
			parent: this.container.rect,
			src,
			dimensions: new Vector2(sourceWidth, sourceHeight),
			slice: new Vector4(0, 0, sourceWidth, sourceHeight),
			offset: this.props.offset ? this.props.offset : new Vector2(0, 0)
		});
		this.container.rect.width = sourceWidth / scale;
		this.container.rect.height = sourceHeight / scale;
		this.bg.di.image.vAlign= "top";
		this.bg.di.image.hAlign= "left";
		this.bg.setScale(scale);
    this.bg.show()
	}
  public show(seconds?: number):void {
		if (this.container) {
			this.active = true;
			this.container.scaleIn(this.options.fadeInTime!, this.options.fadeInEase!);
			this.container.fadeIn(0.25);
			// this.container.fadeIn(this.options.fadeInTime!, this.options.fadeInEase!);
			// this.container.scaleIn(this.options.scaleInStarting!, this.options.scaleInTime!, this.options.scaleInEase!);
			this.container.rect.isPointerBlocker = this.options.isPointerBlocker!;
			this.container.rect.visible = true;
			if(seconds || this.options.hideAfter) Dash_Wait(()=>{ this.hide(); }, seconds ? seconds : this.options.hideAfter!);
		}
  }
  public hide():void {
		if (this.container) {
			this.active = false;
			this.container.scaleOut(this.options.fadeOutTime!, this.options.fadeOutEase!);
			this.container.fadeOut(0.25);
			// this.container.fadeOut(this.options.fadeOutTime!, this.options.fadeOutEase!);
			// this.container.scaleOut(this.options.scaleOutEnding!, this.options.scaleOutTime!, this.options.scaleOutEase!);
			Dash_Wait(()=>{
				this.container.rect.isPointerBlocker = false;
				this.container.rect.visible = false;
			}, 0.5);
		}
  }
}

// const container = new WrappedDynamicContainer({
//   parent: Dash_GlobalCanvas,
//   src: new Texture('https://tyzoo.github.io/assets/images/emote-ui.png'),
//   dimensions: new Vector2(200,600),
//   slice: new Vector4(0,0,600,200),
//   offset: new Vector2(0,0),
// }, {
//   startVisible: true
// })