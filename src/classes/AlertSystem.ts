import { Dash_GlobalCanvas, Dash_Wait as Wait } from "dcldash"

@Component('AlertSystem')
/**
 * Create an alert system for your scene, and call alert.new() to make new notifications
 */
export class AlertSystem {
	private canvas: UICanvas;
	private parent: UIContainerStack;
	private rect: UIContainerRect;
	private recttext: UIText;
	private defaultMS: number = 5000;
	private notificationExpires: Date | null = null;
	constructor() {
		this.canvas = Dash_GlobalCanvas;
		this.parent = new UIContainerStack(this.canvas);
		this.parent.adaptWidth = true;
		this.parent.width = '40%';
		this.parent.positionY = 250;
		this.parent.color = Color4.Black();
		this.parent.opacity = 0.5;
		this.parent.hAlign = 'center';
		this.parent.vAlign = 'center';
		this.parent.stackOrientation = UIStackOrientation.VERTICAL;
		this.parent.adaptHeight = true;
		this.parent.visible = true;
		this.rect = new UIContainerRect(this.parent);
		this.rect.visible = true;
		this.recttext = new UIText(this.parent);
		this.recttext.vTextAlign = 'center';
		this.recttext.hTextAlign = 'center';
		this.recttext.textWrapping = true;
		this.recttext.width = '500px';
		this.recttext.paddingLeft = 30;
		this.recttext.paddingRight = 30;
		this.recttext.paddingTop = 0;
		this.recttext.paddingBottom = 0;
		this.recttext.fontSize = 15;
		this.recttext.positionY = 25;
		this.recttext.visible = true;
		this.hideNotification();
	}
	public new(
		notifyText: string | string[],
		pinMS: number = this.defaultMS
	): void {
		this.parent.visible = true;
		const thisExpiration = new Date(new Date().getTime() + pinMS);
		this.notificationExpires = thisExpiration;
		if (typeof notifyText === 'object') {
			this.recttext.value = notifyText[0];
			const numItemsToDelay = notifyText.length - 1;
			const delayPerItem = pinMS / notifyText.length;
			for (var i = 0; i < numItemsToDelay; i++) {
				const textIndex = i + 1;
				const playInMs = delayPerItem * textIndex;
				Wait(() => {
					this.recttext.value = notifyText[textIndex];
				}, playInMs / 1000);
			}
		} else {
			//killswitch
			if (notifyText === ' ') {
				this.parent.visible = false;
				this.recttext.value = '';
				return;
			}
			//alert 330 char max
			if (notifyText.length > 330) {
				notifyText = notifyText.substring(0, 330) + '...';
			}
			this.recttext.value = notifyText;
		}
		if (pinMS > -1) {
			Wait(() => {
				if (
					this.notificationExpires &&
					this.notificationExpires == thisExpiration
				) {
					this.hideNotification();
				}
			}, pinMS / 1000);
		}
	}
	public hideNotification(): void {
		this.recttext.value = '';
		this.parent.visible = false;
	}
}
