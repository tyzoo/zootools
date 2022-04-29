import { WrappedImage } from "./WrappedImage";

export type IImgSlice = [x: number, y: number, w: number, h: number]

export interface IImgSliceProps {
    x: number;
    y: number;
    w: number;
    h: number;
    onClick?: () => void;
}

export interface IImgSliceData {
    slice: IImgSlice,
    onClick?: () => void
}

export class ImageSlicer {
    imgs: WrappedImage[] = [];
    constructor(
        private parent: UIShape,
        private image: Texture,
        private slices: IImgSliceProps[],
        private offset: [x: number, y: number]
    ){
        let calcOffset: [ x: number, y: number ] = [ 0, 0 ]
        const _slices = this.parseSliceData(this.slices);
        for(let i = 0; i < _slices.length; i++){
            const { slice: thisSlice, onClick } = _slices[i];
            if(i === 0){
                calcOffset[0] = this.offset[0] || 0;
                calcOffset[1] = this.offset[1] || 0;
            }else if(i > 0){
                const prevSlice = _slices[i-1].slice;
                calcOffset[0] += (thisSlice[0] - prevSlice[0]);
                calcOffset[1] -= (thisSlice[1] - prevSlice[1]);
            }
            const _img = new WrappedImage({
                parent: this.parent,
                src: this.image,
                dimensions: new Vector2( thisSlice[2], thisSlice[3] ),
                slice: new Vector4(
                    thisSlice[0], thisSlice[1], thisSlice[3], thisSlice[2]
                ),
                offset: new Vector2(...calcOffset),
            },{
                hAlign: 'left',
                vAlign: 'top',
            });
            _img.setOnClick(onClick);
            this.imgs.push(_img);
        }
    }
    parseSliceData(slices: IImgSliceProps[]): IImgSliceData[] {
        return slices.map(s => {
            const { x, y, w, h, onClick } = s;
            return { slice: [ x, y, w, h ], onClick }
        })
    }
}

// import { Dash_GlobalCanvas } from "dcldash";
// import { IImgSliceProps, ImageSlicer } from "zootools" //v0.0.38

// const slices: IImgSliceProps[] = [
//   { x:  0, y:   0, w: 100, h:  50, },
//   { x:  0, y:  50, w:  12, h: 250, },
//   { x: 12, y:  50, w:  75, h:  27, onClick: () => log("dance!") },
//   { x: 12, y:  77, w:  75, h:  12, },
//   { x: 12, y:  89, w:  75, h:  27, onClick: () => log("tik!") },
//   { x: 12, y: 116, w:  75, h:  13, },
//   { x: 12, y: 129, w:  75, h:  27, onClick: () => log("tektonik!") },
//   { x: 12, y: 156, w:  75, h:  13, },
//   { x: 12, y: 169, w:  75, h:  27, onClick: () => log("disco!") },
//   { x: 12, y: 196, w:  75, h:  13, },
//   { x: 12, y: 209, w:  75, h:  27, onClick: () => log("handsair!") },
//   { x: 12, y: 236, w:  75, h:  13, },
//   { x: 12, y: 249, w:  75, h:  27, onClick: () => log("random!") },
//   { x: 12, y: 276, w:  75, h:  24, },
//   { x: 87, y:  50, w:  13, h: 250, },
// ]

// new ImageSlicer(
//   Dash_GlobalCanvas, //parent
//   new Texture(`https://tyzoo.github.io/assets/images/emote-ui.png`),
//   slices,
//   [ 0, 100 ] //offset
// )