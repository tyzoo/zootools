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