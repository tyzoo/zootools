import { Dash_UV_Image } from "dcldash";

export class Image extends Entity {
    public url: string | null = null;
    constructor(
        transform: TransformConstructorArgs,
        imageUrl?: string,
        onClick?: OnPointerDown,
        private alphaSrcUrl?: string
    ) {
        super();
        this.addComponentOrReplace(
            new Transform(transform)
        );
        if (imageUrl) {
            this.setUrl(imageUrl);
        }
        if (onClick) {
            this.addComponent(onClick);
        }
    }
    public setUrl(url: string): void {
        this.url = url;
        const tx = new Texture(this.url);
        const mt = new Material();
        mt.metallic = 0;
        mt.roughness = 1;
        mt.specularIntensity = 0;
        mt.emissiveColor = Color3.White();
        mt.emissiveIntensity = 1;
        mt.albedoTexture = tx;
        mt.emissiveTexture = tx;
        mt.transparencyMode = 1;
        if(this.alphaSrcUrl){
            mt.alphaTexture = new Texture(this.alphaSrcUrl);
        }else{
            mt.alphaTexture = tx;
        }
        mt.transparencyMode = 1;
        this.addComponentOrReplace(new PlaneShape());
        this.getComponent(PlaneShape).uvs = Dash_UV_Image()
        this.addComponentOrReplace(mt);
    }
}