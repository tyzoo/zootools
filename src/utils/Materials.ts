const Black = new Material();
Black.albedoColor = Color3.Black();
const White = new Material();
White.albedoColor = Color3.White();
const Red = new Material();
Red.albedoColor = Color3.Red();
const Green = new Material();
Green.albedoColor = Color3.Green();
const Blue = new Material();
Blue.albedoColor = Color3.Blue();
const Gray = new Material();
Gray.albedoColor = Color3.Gray();

export const ZooTools_Materials: {
    [color: string]: Material
} = {
    Black,
    White,
    Red,
    Green,
    Blue,
    Gray,
}