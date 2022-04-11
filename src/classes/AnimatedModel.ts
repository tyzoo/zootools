declare const Map: any

export class AnimatedModel extends Entity {
    private index = -1;
    private animations = new Map()
    constructor(path:string, tf:TranformConstructorArgs, animations: string[] = [], options: any[] = []){
        super()
        this.addComponent(new Transform(tf))
        this.addComponent(new GLTFShape(path))
        this.addComponent(new Animator())
        const hasOptionsForEachAnim = options && options.length && 
                                      animations && animations.length && 
                                      options.length === animations.length

        const shouldApplyAnimToAll =  options && options.length === 1 && 
                                      animations && animations.length > 1

        if(animations.length){
            for(let i = 0; i < animations.length; i++){
                let _options:any
                if( hasOptionsForEachAnim ){ _options = options[i]
                }else if(shouldApplyAnimToAll){ _options = options[0]
                }else{ _options = {} }
                this.registerAnimation(animations[i], _options)
            }
        }
    }
    private registerAnimation(name:string, options: any = {}): void {
        this.index++
        const animation = new AnimationState(name, {
            looping: false,
            layer: this.index,
            ...options
        });
        this.getComponent(Animator).addClip(animation);
        this.animations.set(name, animation);
    }
    public getClip(string: string): AnimationState {
        const anim = this.getComponent(Animator);
        return anim.getClip(string);
    }
    public playClip(string:string): void {
        this.stopAll()
        const clip = this.getClip(string);
        if(clip) clip.play()
    }
    public stopClip(string:string): void {
        const clip = this.getClip(string);
        if(clip) clip.stop()
    }
    public stopAll(): void {
        for(const [name, animation] of this.animations){
            (animation as AnimationState).stop()
        }
    }
}