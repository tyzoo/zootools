/**
 * A set of basic entities
 */

import { Dash_UV_Image } from "dcldash";

class Image extends Entity {
    constructor(src: string, tf: TranformConstructorArgs){
        super()
        const txt = new Texture(src);
        const uv = [ 1,0, 0,0, 0,1, 1,1 ];
        this.addComponent(new Material());
        this.getComponent(Material).albedoTexture = txt;
        this.getComponent(Material).emissiveTexture = txt;
        this.getComponent(Material).emissiveColor = Color3.White();
        this.getComponent(Material).emissiveIntensity = 1;
        this.addComponent(new PlaneShape());
        this.getComponent(PlaneShape).uvs = Dash_UV_Image();
        this.addComponent(new Transform(tf));
    }
}

class Text extends Entity {
    constructor(text: string, tf: TranformConstructorArgs){
        super()
        this.addComponent(new TextShape(text));
        this.addComponent(new Transform(tf));
    }
    setValue(text: string): void {
        this.getComponent(TextShape).value = text;
    }
}

class Button extends Entity {
    bgEntity: Entity
    textEntity: Entity
    constructor(
        private tf: TransformConstructorArgs,
        private text: string, 
        private colorOrTexture: Color4 | Texture, 
        private onClick: () => void,
        private options: {
            hoverText?: string,
            distance?: number
        } = {
            hoverText: 'Intract',
            distance: 10
        }
    ){
        super()
        this.addComponent(new Transform(this.tf));
        this.bgEntity = new Entity()
        this.bgEntity.addComponent(new PlaneShape());
        this.bgEntity.getComponent(PlaneShape).uvs = Dash_UV_Image();
        this.bgEntity.addComponent(new Transform({
            scale: new Vector3(1,0.75,1)
        }));
        if(this.colorOrTexture instanceof Color4){
            this.bgEntity.addComponent(new Material());
            this.bgEntity.getComponent(Material).albedoColor = this.colorOrTexture;
        }else if(this.colorOrTexture instanceof Texture){
            this.bgEntity.addComponent(this.colorOrTexture);
        }
        this.bgEntity.setParent(this)
        this.textEntity = new Entity()
        this.textEntity.addComponent(new TextShape(this.text));
        this.textEntity.getComponent(TextShape).fontSize = 2;
        this.textEntity.addComponent(new Transform({
            position: new Vector3(0,0,-0.001)
        }));
        this.textEntity.setParent(this)
        const { hoverText, distance } = this.options;
        this.bgEntity.addComponent(new OnPointerDown(()=>{
            this.onClick();
        }, {
            hoverText,
            distance
        }));
    }
}

export const Elements = {
    Text,
    Image,
    Button
}