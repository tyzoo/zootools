import { Dash_UV_Image, Dash_Wait } from "dcldash";
import { makeid } from "../../utils/index";
import { RotateSystem } from "../../systems/RotateSystem";

export interface IBoothProps {
	transformArgs: TransformConstructorArgs, 
	buttonText: string, 
	onButtonClick: () => void,
	wrapTexturePath: string, 
	dispenserModelPath: string,
	buttonModelPath: string,
}

export class Booth extends Entity  {
	public name = `${makeid(5)}`
	private booth = new Entity(`booth-${this.name}`);
	private cylinder = new Entity(`cylinder-${this.name}`);
	private button = new Entity(`button-${this.name}`);
	private wrapTexture: Texture
	private rotateSystem: RotateSystem;
	public image: Entity | undefined;
	public item: Entity | undefined;
	constructor(
	  props: IBoothProps
	){
	  super()
	  this.wrapTexture = new Texture(props.wrapTexturePath)
	  this.addComponent(new Transform(props.transformArgs));
	  this.booth.addComponent(new GLTFShape(props.dispenserModelPath));
	  this.booth.getComponent(GLTFShape).isPointerBlocker = false;
	  this.booth.addComponent(new Transform({
		rotation: new Quaternion().setEuler(0,180,0)
	  }));
	  this.booth.setParent(this)
	  this.cylinder.addComponent(new Transform({
		position: new Vector3(0,0.625,0),
		scale: new Vector3(-0.5,0.57,0.5),
		rotation: new Quaternion().setEuler(0,270,0)
	  }))
	  this.cylinder.addComponent(new CylinderShape());
	  this.cylinder.addComponent(new Material())
	  this.cylinder.getComponent(Material).albedoTexture = this.wrapTexture;
	  this.cylinder.getComponent(Material).emissiveTexture = this.wrapTexture;
	  this.cylinder.getComponent(Material).emissiveColor = Color3.White();
	  this.cylinder.getComponent(Material).emissiveIntensity = 1;
	  this.cylinder.setParent(this)
	  this.button.addComponent(new Transform({
		position: new Vector3(0, -0.18, 0.12),
		scale: new Vector3().setAll(1.25),
		rotation: new Quaternion().setEuler(0,180,0)
	  }))
	  this.button.addComponent(new Animator())
	  this.button.getComponent(Animator).addClip(new AnimationState("Button_Action", { looping: false }));
	  this.button.addComponent(new GLTFShape(props.buttonModelPath))
	  this.button.setParent(this)
	  this.button.addComponent(new OnPointerDown(()=>{
		props.onButtonClick();
		this.button.getComponent(Animator).getClip('Button_Action').play();
		Dash_Wait(()=>{
		  this.button.getComponent(Animator).getClip('Button_Action').stop();
		},1)
	  }, {
		hoverText: props.buttonText,
	  }))
	  this.rotateSystem = new RotateSystem([],[this.cylinder]);
	  engine.addSystem(this.rotateSystem)
	}
  
	public setImage(path: string, url: string, hoverText: string): void{
	  if(!path) return;
	  const texture = new Texture(path)
	  const circle = new Texture("poap_assets/images/alpha-circle.png");
	  this.image = new Entity(`image-${this.name}`);
	  this.image.addComponent(new PlaneShape());
	  this.image.getComponent(PlaneShape).uvs = Dash_UV_Image()
	  this.image.addComponent(new Material());
	  this.image.getComponent(Material).metallic = 0;
	  this.image.getComponent(Material).roughness = 1;
	  this.image.getComponent(Material).specularIntensity = 0;
	  this.image.getComponent(Material).emissiveColor = Color3.White();
	  this.image.getComponent(Material).emissiveIntensity = 1;
	  this.image.getComponent(Material).alphaTexture = circle;
	  this.image.getComponent(Material).albedoTexture = texture;
	  this.image.getComponent(Material).emissiveTexture = texture;
	  this.image.getComponent(Material).transparencyMode = 1;
	  this.image.addComponent(new Transform({
		position: new Vector3(0,1.8,0),
		scale: new Vector3().setAll(0.69)
	  }));
	  this.image.addComponent(new OnPointerDown(()=>{
		openExternalURL(url);
	  }, { hoverText }));
	  this.image.setParent(this)
	} 
  
	public setItem(model: GLTFShape): void{
	  if(!model) return;
	  this.item = new Entity(`item-${this.name}`);
	  this.item.addComponent(model);
	  this.item.getComponent(GLTFShape).isPointerBlocker = true;
	  this.item.getComponent(GLTFShape).withCollisions = true;
	  this.item.addComponent(new Transform({
		position: new Vector3(0,0.5,0),
		scale: new Vector3(1,1,1),
		rotation: new Quaternion().setEuler(0,180,0)
	  }));
	  this.item.setParent(this)
	} 
	
	public setRotation(entity: Entity, dir: "right" | "left"): void{
	  switch(dir){
		case "right": this.rotateSystem.rotateRight.push(entity); break;
		case "left": this.rotateSystem.rotateLeft.push(entity); break;
	  }
	}
  }