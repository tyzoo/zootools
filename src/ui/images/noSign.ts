import { WrappedDynamicImage } from "../classes/WrappedDynamicImage"

export const noSign = new WrappedDynamicImage({
    src: `https://tyzoo.github.io/assets/images/no-sign.png`,
    demensions: new Vector2(128, 128),
    offset: new Vector2(0, 20),
    slice: new Vector4(0, 0, 512, 512)
}, {
    hAlign: 'center',
    vAlign: 'center',
    startVisible: false,
    isPointerBlocker: false,
    hideAfter: 3
});