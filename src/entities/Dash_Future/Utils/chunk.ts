// Native method that acts exactly like lodash.chunk
// https://lodash.com/docs/#chunk

export const Dash_Utils_Chunk = (input: any[], size: number) => {
    return input.reduce((arr, item, idx) => {
      return idx % size === 0
        ? [...arr, [item]]
        : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
    }, []);
}