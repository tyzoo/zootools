declare const Map: any

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

export class SoundPlayer {
    sounds = new Map()
    constructor(sounds: {name:string, path:string}[]){
        sounds.forEach(sound => {
            const _sound = new Sound(sound.path)
            this.registerSound(sound.name, _sound)
        });
    }
    registerSound(name: string, sound: Sound):void {
        this.sounds.set(name, sound)
    }
    playSound(registeredName:string):void {
        if(this.sounds.has(registeredName)){
            this.sounds.get(registeredName).playOnce()
        }
    }
}
