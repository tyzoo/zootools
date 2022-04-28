export class Sound extends Entity {
    constructor(
        path: string,
        loop: boolean = false,
        transform?: Vector3
    ){
        super()
        this.addComponent(new AudioSource(new AudioClip(path)))
        this.getComponent(AudioSource).loop = loop
        this.addComponent(new Transform())
        if (transform) {
            this.getComponent(Transform).position = transform
        } else {
            this.getComponent(Transform).position = Camera.instance.position
        }
        engine.addEntity(this)
        this.setParent(Attachable.AVATAR)
    }
    playOnce(){
        this.getComponent(AudioSource).playOnce()
    }
}