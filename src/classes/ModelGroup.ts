import { makeid, Model } from 'src/index';

declare const Set: any;

export interface IModelGroupProps {
	host?: Entity;
	name: string | string[];
	path: string | string[];
	transform?: TransformConstructorArgs;
}

export class ModelGroup extends Entity {
	public items: typeof Set = new Set();

	constructor(private props: IModelGroupProps) {
		super();
		this.addComponent(
			new Transform({
				position: new Vector3(0, 0, 0),
				rotation: Quaternion.Euler(0, 0, 0),
				scale: new Vector3(1, 1, 1),
			})
		);
		if (typeof this.props.name === 'string')
			this.props.name = [this.props.name];
		if (typeof this.props.path === 'string')
			this.props.path = [this.props.path];
		const hasNames = this.props.name.length === this.props.path.length;
		this.props.path.forEach((_path: string, idx: number) => {
			this.items.add(
				new Model({
					path: _path,
					transform: this.props.transform
						? this.props.transform
						: {
								position: new Vector3(0, 0, 0),
								rotation: Quaternion.Euler(0, 0, 0),
								scale: new Vector3(1, 1, 1),
						  },
					options: {
						name: hasNames
							? `${this.props.name[idx]}-${makeid(5)}`
							: `${this.props.name[0]}-${makeid(5)}`,
					},
				})
			);
		});
		this.init();
	}

	init() {
		this.items.forEach((model: Model) => model.setParent(this));
		if (this.props.host) {
			this.enable();
		}
	}

	enable(_host?: Entity) {
		if (_host) {
			this.setParent(_host);
		} else if (this.props.host) {
			this.setParent(this.props.host);
			_host = this.props.host;
		} else {
			log(`ModelGroup ${this.name} has no host`);
		}
		if (_host && _host.alive) if (!this.alive) engine.addEntity(this);
	}

	destroy() {
		engine.removeEntity(this);
		this.setParent(null);
	}
}
