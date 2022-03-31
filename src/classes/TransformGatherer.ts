// import { noSign } from "src/ui/noSign";

export class TransformGatherer {
	axis: boolean[] = []
	positions: Vector3[] = []
	rotations: Vector3[] = []

	testEntity = new Entity('transform-gatherer-test-entity')

	constructor(){
		this.testEntity
		Input.instance.subscribe(
			'BUTTON_DOWN',
			ActionButton.SECONDARY,
			true,
			event => {
				if (event.hit) {
					if (event.hit.normal.y > 0.99) {
						const hitEntity = engine.entities[event.hit.entityId]
						const o = event.origin
						const origin = new Vector3(o.x, o.y, o.z)
						this.add(hitEntity.getComponent(Transform).position, origin)
					} else {
						// noSign.show(1);
					}
				}
			}
		);
		Input.instance.subscribe(
			'BUTTON_DOWN',
			ActionButton.PRIMARY,
			true,
			event => {
				log(this.get())
			}
		);

	}

	add(position: Vector3, origin: Vector3): void {
		this.positions.push(position)
		this.testEntity.addComponentOrReplace(new Transform({position}))
		const tf = this.testEntity.getComponent(Transform)
		tf.lookAt(origin)
		const rotation = tf.rotation
		this.rotations.push(rotation.eulerAngles)
		log(`added transform !`)
	}

	get(){
		let res:[position:Vector3, rotation:Vector3][] = []
		for(let i = 0; i < this.positions.length; i++){
			res.push([this.positions[i],this.rotations[i]])
		}
		this.unsubscribe()
		return res
	}

	unsubscribe(){
		Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.SECONDARY,(e:any)=>{
			log("unsubscribled secondary",e)
		})
		Input.instance.unsubscribe('BUTTON_DOWN', ActionButton.PRIMARY,(e:any)=>{
			log("unsubscribled primary",e)
		})
	}
}