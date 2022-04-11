import { makeid } from "../utils/index";

const defaultModelOptions = {
	useColliders: true,
};

export interface IModelProps {
	host?: Entity;
	path: string;
	transform: TransformConstructorArgs;
	options?: {
		name?: string;
		useColliders?: boolean;
	};
}

export class Model extends Entity {
	constructor(private props: IModelProps) {
		super();
		if (!this.props.options) this.props.options = defaultModelOptions;
		if (!this.props.options.name) {
			this.props.options.name = `model-${makeid(5)}`;
		} else {
			if (this.props.options.name.indexOf('-') === -1)
				this.props.options.name = `${this.props.options.name}-${makeid(5)}`;
		}
		this.name = this.props.options.name;
		const gltfShape = new GLTFShape(this.props.path);
		if (this.props.options.useColliders) {
			gltfShape.withCollisions = true;
			gltfShape.isPointerBlocker = true;
		}
		gltfShape.visible = true;
		this.addComponent(gltfShape);
		this.addComponent(new Transform(this.props.transform));
		if (this.props.host) this.setParent(this.props.host);
		log(`ZooTools: Created new Model entity ${this.name}`);
	}
	setPosition(vec3: Vector3 | [x: number, y: number, z: number]) {
		if (vec3 instanceof Vector3) {
			this.getComponent(Transform).position = vec3;
		} else {
			this.getComponent(Transform).position = new Vector3(
				vec3[0],
				vec3[1],
				vec3[2]
			);
		}
	}
	setScale(vec3: Vector3 | [x: number, y: number, z: number]) {
		if (vec3 instanceof Vector3) {
			this.getComponent(Transform).scale = vec3;
		} else {
			this.getComponent(Transform).scale = new Vector3(
				vec3[0],
				vec3[1],
				vec3[2]
			);
		}
	}
	setRotation(vec3: Vector3 | [x: number, y: number, z: number]) {
		if (vec3 instanceof Vector3) {
			this.getComponent(Transform).rotation = Quaternion.Euler(
				vec3.x,
				vec3.y,
				vec3.z
			);
		} else {
			this.getComponent(Transform).rotation = Quaternion.Euler(
				vec3[0],
				vec3[1],
				vec3[2]
			);
		}
	}

	enable(_host?: Entity) {
		if (_host) {
			this.setParent(_host);
		} else if (this.props.host) {
			this.setParent(this.props.host);
			_host = this.props.host;
		} else {
			log(`Model ${this.name} has no host`);
		}
		if (_host && _host.alive) if (!this.alive) engine.addEntity(this);
	}

	destroy() {
		engine.removeEntity(this);
		this.setParent(null);
	}
}
