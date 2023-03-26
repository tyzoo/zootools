import { Dash_Wait } from "dcldash";
import { makeid } from "../../utils/index";
import { RotateSystem } from "../../systems/RotateSystem";

export interface IBoothProps {
	transformArgs: TransformConstructorArgs,
	buttonText: string,
	onButtonClick: () => void,
	wrapTexturePath: string,
	dispenserModelPath: string,
	buttonModelPath: string,
	useHostedAssets?: boolean,
	disableCylinder?: boolean,
	disablePreview?: boolean,
	useBoothAsButton?: boolean,
	buttonOffset?: Transform,
	boothRotationDir?: 'left' | 'right',
	itemRotationDir?: 'left' | 'right',
}

export class Booth extends Entity {
	public name = `${makeid(5)}`;
	public button = new Entity(`button-${this.name}`);
	private booth = new Entity(`booth-${this.name}`);
	private cylinder = new Entity(`cylinder-${this.name}`);
	private wrapTexture: Texture;
	private rotateSystem: RotateSystem;
	public image: Entity | undefined;
	public item: Entity | undefined;
	public cdn: string;
	public onButtonClick: () => void;
	constructor(
		public props: IBoothProps
	) {
		super()
		if (props.useHostedAssets === undefined) props.useHostedAssets = true;
		if (props.disableCylinder === undefined) props.disableCylinder = false;
		if (props.useBoothAsButton === undefined) props.useBoothAsButton = false;
		if (props.disablePreview === undefined) props.disablePreview = false;
		if (props.boothRotationDir === undefined) props.boothRotationDir = 'right';
		if (props.itemRotationDir === undefined) props.itemRotationDir = 'left';
		this.cdn = props.useHostedAssets ? `https://tyzoo.github.io/assets/` : ``;
		this.wrapTexture = new Texture(`${this.cdn}${props.wrapTexturePath}`)
		this.addComponent(new Transform(props.transformArgs));
		this.booth.addComponent(new GLTFShape(props.dispenserModelPath));
		this.booth.getComponent(GLTFShape).isPointerBlocker = props.useBoothAsButton;
		this.booth.addComponent(new Transform({
			rotation: new Quaternion().setEuler(0, 180, 0)
		}));
		this.booth.setParent(this)
		this.cylinder.addComponent(new Transform({
			position: new Vector3(0, 0.625, 0),
			scale: new Vector3(-0.5, 0.57, 0.5),
			rotation: new Quaternion().setEuler(0, 270, 0)
		}))
		this.onButtonClick = props.onButtonClick;
		if (!props.disableCylinder) {
			this.cylinder.addComponent(new CylinderShape());
			this.cylinder.addComponent(new Material())
			this.cylinder.getComponent(Material).albedoTexture = this.wrapTexture;
			this.cylinder.getComponent(Material).emissiveTexture = this.wrapTexture;
			this.cylinder.getComponent(Material).emissiveColor = Color3.White();
			this.cylinder.getComponent(Material).emissiveIntensity = 1;
			this.cylinder.setParent(this)
		}
		if (!props.useBoothAsButton) {
			const offset = this.props.buttonOffset ? this.props.buttonOffset : new Transform();
			const buttonPosition = new Vector3(0, -0.18, 0.12).add(offset.position);
			const buttonRotation = 180 + offset.rotation.eulerAngles.y;
			this.button.addComponent(new Transform({
				position: buttonPosition,
				scale: new Vector3().setAll(1.25),
				rotation: new Quaternion().setEuler(0, buttonRotation, 0)
			}))
			this.button.addComponent(new Animator())
			this.button.getComponent(Animator).addClip(new AnimationState("Button_Action", { looping: false }));
			this.button.addComponent(new GLTFShape(props.buttonModelPath))
			this.button.setParent(this)
			this.button.addComponent(new OnPointerDown(() => {
				this.onButtonClick();
				this.button.getComponent(Animator).getClip('Button_Action').play();
				Dash_Wait(() => {
					this.button.getComponent(Animator).getClip('Button_Action').stop();
				}, 1)
			}, {
				hoverText: props.buttonText,
			}))
		} else {
			this.booth.addComponent(new OnPointerDown(() => {
				this.onButtonClick();
			}, {
				hoverText: props.buttonText,
			}))
		}
		this.rotateSystem = new RotateSystem([], []);
		this.setRotation(this.cylinder, this.props.boothRotationDir!);
		engine.addSystem(this.rotateSystem);
	}

	public setImage(path: string, url: string, hoverText: string): void {
		if (!path) return;
		if (this.props.disablePreview) return;
		const texture = new Texture(path)
		const circle = new Texture(`${this.cdn}images/alpha-circle.png`);
		if (!this.image) {
			this.image = new Entity(`image-${this.name}`);
			this.image.addComponent(new PlaneShape());
			this.image.getComponent(PlaneShape).uvs = [
				0, 0,
				1, 0,
				1, 1,
				0, 1,

				1, 0,
				0, 0,
				0, 1,
				1, 1,
			]
			this.image.addComponent(new Material());
			this.image.getComponent(Material).metallic = 0;
			this.image.getComponent(Material).roughness = 1;
			this.image.getComponent(Material).specularIntensity = 0;
			this.image.getComponent(Material).emissiveColor = Color3.White();
			this.image.getComponent(Material).emissiveIntensity = 1;
			this.image.getComponent(Material).alphaTexture = circle;
			this.image.getComponent(Material).transparencyMode = 2;
			this.image.addComponent(new Transform({
				position: new Vector3(0, 1.8, 0),
				scale: new Vector3().setAll(0.69)
			}));
			this.image.addComponent(new OnPointerDown(() => {
				openExternalURL(url);
			}, { hoverText }));
			this.image.setParent(this);
			this.setRotation(this.image, this.props.itemRotationDir!);
		}
		this.image.getComponent(Material).albedoTexture = texture;
		this.image.getComponent(Material).emissiveTexture = texture;
	}

	public setItem(model: GLTFShape): void {
		if (!model) return;
		if (this.props.disablePreview) return;
		this.item = new Entity(`item-${this.name}`);
		this.item.addComponent(model);
		this.item.getComponent(GLTFShape).isPointerBlocker = true;
		this.item.getComponent(GLTFShape).withCollisions = true;
		this.item.addComponent(new Transform({
			position: new Vector3(0, 0.5, 0),
			scale: new Vector3(1, 1, 1),
			rotation: new Quaternion().setEuler(0, 180, 0)
		}));
		this.item.setParent(this)
	}
	public setRotation(entity: Entity, dir: "right" | "left"): void {
		switch (dir) {
			case "right": this.rotateSystem.rotateRight.push(entity); break;
			case "left": this.rotateSystem.rotateLeft.push(entity); break;
		}
	}
}