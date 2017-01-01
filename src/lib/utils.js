
export const makeArrayHash = (width, height) => {
    const hash = new Array(width)

    for (let x = 0; x < width; ++x) {
        hash[x] = new Array(height).fill(false);
    }

    return {
        hash,
        get: (x, y) => hash[x][y],
        set: (x, y) => { hash[x][y] = true; },
    }
}
