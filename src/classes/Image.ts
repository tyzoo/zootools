export class Image extends Entity {
    url: string | null = null;
    constructor(
        transform: TransformConstructorArgs,
        imageUrl?: string,
        onClick?: OnPointerDown,
        private alpha?: boolean
    ) {
        super();
        this.addComponentOrReplace(
            new Transform({ rotation: Quaternion.Euler(0, 180, 180), ...transform })
        );
        if (imageUrl) {
            this.setUrl(imageUrl);
        }
        if (onClick) {
            this.addComponent(onClick);
        }
    }
    setUrl(url: string): void {
        this.url = url;
        const tx = new Texture(this.url);
        const mt = new Material();
        mt.metallic = 0;
        mt.roughness = 1;
        mt.specularIntensity = 0;
        mt.emissiveColor = Color3.White()
        mt.emissiveIntensity = 1
        mt.emissiveTexture = tx;
        mt.albedoTexture = tx;
        if (this.alpha) {
            mt.alphaTexture = tx;
            mt.transparencyMode = 1;
        }
        this.addComponentOrReplace(new PlaneShape());
        this.addComponentOrReplace(mt);
    }
}