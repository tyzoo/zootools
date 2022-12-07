import { Dash_Ease, Dash_GlobalCanvas, Dash_Wait } from "dcldash";
import { DynamicContainerRect } from "../dclconnect/DynamicContainerRect";
import { DynamicImage } from "../dclconnect/DynamicImage";
import { sanitizeInputString } from "../utils/index";

export interface IConfirmCodeOptions {
	modal_bg_image_url: string;
    poap_image_x_y_offset: [x:number,y:number],
    secret_code_x_y_offset: [x:number,y:number],
    secret_code_color: Color4,
    secret_input_x_y_offset: [x:number,y:number],
}

const canvas = Dash_GlobalCanvas

export class ConfirmCodeUI {
	private container: DynamicContainerRect;
	private texture: Texture;
	private images: DynamicImage[] = [];
	private captcha: UIImage | undefined;
	private poapImage: UIImage | undefined;
	private textInput: UIInputText;
	private attempts: number = 0;
	private active: boolean = false
	constructor(
		private onAttemptCompleteCallback: (val:string)=>void, 
        private options: Partial<IConfirmCodeOptions>,
        private alert: {
            new: (text:  string | string[],  pinMS?: number) => void
        },
		private cdn: string
	){
        if(this.options.modal_bg_image_url === undefined)
            this.options.modal_bg_image_url = 'poap_assets/images/popup.png';
        if(this.options.poap_image_x_y_offset === undefined)
            this.options.poap_image_x_y_offset = [0,0];
        if(this.options.secret_code_x_y_offset === undefined)
            this.options.secret_code_x_y_offset = [0,0];
        if(this.options.secret_input_x_y_offset === undefined)
            this.options.secret_input_x_y_offset = [0,0];
        if(this.options.secret_code_color === undefined)
            this.options.secret_code_color = Color4.FromHexString('#FFFFFF00');
		this.texture = new Texture(`${this.cdn}${this.options.modal_bg_image_url}`);
		this.container = new DynamicContainerRect(new UIContainerRect(canvas));
		this.container.rect.hAlign = 'center';
		this.container.rect.vAlign = 'center';
		this.container.rect.positionX = 50;
		this.container.rect.positionY = 0;
		this.container.rect.opacity = 0;
		this.container.rect.isPointerBlocker = false;
		const slices = [
			{ x: 0, y: 0, w: 600, h: 443, px: -600/2, py: 0, name: 'topsection' },
			{ x: 0, y: 426, w: 300, h: 74, px:-300, py:-426/2, name: 'left' },
			{ x: 300, y: 426, w: 300, h: 74, px:0, py:-426/2, name: 'right' },
		]
		const adj = 1.5
		slices.forEach(slice => {
			if (this.container && this.texture) {
				const part = new DynamicImage(new UIImage(this.container.rect, this.texture));
				part.image.sourceLeft = slice.x;
				part.image.sourceTop = slice.y;
				part.image.sourceWidth = slice.w;
				part.image.sourceHeight = slice.h;
				part.image.positionY = slice.py/adj;
				part.image.positionX = slice.px/adj;
				part.image.width = slice.w/adj;
				part.image.height = slice.h/adj;
				part.image.vAlign = 'center';
				part.image.hAlign = 'center';
				part.image.opacity = 1;
				if(slice.name==="left"){
					part.image.isPointerBlocker = true;
					part.image.onClick = new OnPointerDown(() => {
						this.onHelp()
					});
				}else if(slice.name==="right"){
					part.image.isPointerBlocker = true;
					part.image.onClick = new OnPointerDown(() => {
						let text = sanitizeInputString(this.text.replace("Code",""))
						if(!text.length) return
						if(text === "Code") return
						this.onHide();
						this.onSubmit();
					});
				}
				this.images.push(part);
			}
		});
		this.textInput = new UIInputText(this.container.rect);
		this.textInput.width = '125px';
		this.textInput.height = '25px';
		this.textInput.fontSize = 10;
		this.textInput.placeholder = 'Code';
		
	
		const [six, siy] = this.options.secret_input_x_y_offset;
		this.textInput.color = this.options.secret_code_color ? this.options.secret_code_color : Color4.White();
		this.textInput.vTextAlign = 'center';
		this.textInput.positionX = -65+six;
		this.textInput.positionY = -130+siy;
		this.textInput.isPointerBlocker = true;
		this.textInput.paddingLeft = 10;
		this.textInput.paddingRight = 10;
		this.textInput.vAlign = 'center';
		this.textInput.hAlign = 'center';
		this.textInput.onChanged = new OnChanged((event:any) => {
			this.text = event.value;
		})
		this.textInput.opacity = 0.35;
		this.textInput.onTextSubmit = new OnTextSubmit(async x => {
			let text = sanitizeInputString(this.text.replace("Code","").trim())
			if(!text.length) return
			if(text === "Code") return
			this.onHide();
			this.onSubmit();
		});
	}
	text:string = ''

	public async onHelp(): Promise<void> {
		openExternalURL(`https://poap.help/`)
	}

	public onSubmit(code?:string):void {
		this.attempts++;
		this.onAttemptCompleteCallback(code?code:this.text)
	}

	public setCaptcha(hash:string):void {
		const [scx, scy] = this.options.secret_code_x_y_offset!;
		if(!this.captcha){
			this.captcha = new UIImage(
				this.container.rect,
				new Texture(`https://services.poap.cc/captcha/get/${hash}`)
			);	
		}else{
			this.captcha.source = new Texture(`https://services.poap.cc/captcha/get/${hash}`)
		}
		this.captcha.width = 150;
		this.captcha.height = 50;
		this.captcha.sourceWidth = 150;
		this.captcha.sourceHeight = 50;
		this.captcha.positionX = -70+scx;
		this.captcha.positionY = -100+scy;
		this.captcha.isPointerBlocker = false;
	}

	public onShow():void {
		this.active = true
		this.container.rect.isPointerBlocker = true;
		this.container.scaleIn(0.5, Dash_Ease.easeInOutSine);
		this.container.fadeIn(0.25);
		this.textInput.value = '';
		this.images.forEach(img=>img.image.isPointerBlocker = true);
		Dash_Wait(()=>{
			if(this.active){
				this.alert.new(`Your token expired. Try again soon.`)
				this.onHide()
			}
		},20)
	}

	public onHide():void {
		this.active = false
		this.container.rect.isPointerBlocker = false;
		this.container.scaleOut(0.5, Dash_Ease.easeInOutSine);
		this.container.fadeOut(0.25);
		this.images.forEach(img=>img.image.isPointerBlocker = false);
	}

	public showUI():void {
		this.onShow()
	}
	
	public setImageSrc(src:string, width:number, height:number):void {
		if(!this.poapImage){
			this.poapImage = new UIImage(
				this.container.rect,
				new Texture(src)
			);
		}else{
			this.poapImage.source = new Texture(src);
		}
		const [pix, piy] = this.options.poap_image_x_y_offset!;
		this.poapImage.width = '150px';
		this.poapImage.height = '150px';
		this.poapImage.sourceWidth = width+pix;
		this.poapImage.sourceHeight = height+piy;
		this.poapImage.positionX = -80;
		this.poapImage.positionY = 30;
	}

}
