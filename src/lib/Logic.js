
import {shuffle} from '../utils/array';
import {makeArrayHash} from './utils';

export default class Logic {

    options = {
        width: 10,
        height: 10,
        colors: ['crimson', 'cyan', 'orange'],
    };

    constructor (options={}) {
        const {noInit, data, ...rest} = options;
        this.options = Object.assign({}, this.options, rest);
        if (data) this.data = data;
        else this.initData();
    }

    clone () {
        const {options, data} = this.export();
        return new Logic({...options, data});
    }

    import ({options, data}) {
        this.options = options;
        this.data = data;
    }

    export () {
        return {
            options: {...this.options},
            data: this.data.map(arr => Array.from(arr)),
        };
    }

    /**
     * A painfully inefficient hash function, but a hash function nonetheless
     */
    getHash () { return JSON.stringify(this.data); }

    isOutOfBounds (x, y) {
        const {width, height} = this.options;
        return x < 0 || y < 0 || x >= width || y >= height;
    }

    count () {
        const {data} = this;
        const result = {};
        for (let x = 0; x < data.length; ++x) {
            for (let y = 0; y < data[x].length; ++y) {
                const val = data[x][y];
                if (val == null) continue;
                result[val] = (result[val] || 0) + 1;
            }
        }
        return result;
    }

    selectTile (x, y) {
        const {data} = this;
        const {width, height} = this.options;

        if (this.isOutOfBounds(x, y)) return null;

        const cluster = this.getCluster(x, y);
        if (!cluster) return null;
        if (cluster.list.length <= 1) return null;

        // Remove the cluster from the board
        for (let [x, y] of cluster.list) {
            data[x][y] = null;
        }

        // Drop all floating tiles on each column
        for (let x = 0; x < width; ++x) {
            let shift = 0;
            for (let y = height - 1; y >= 0; --y) {
                if (data[x][y] == null) {
                    ++shift;
                    continue;
                };
                if (!shift) continue;
                data[x][y + shift] = data[x][y];
                data[x][y] = null;
            }
        }

        // Shift left all isolated chunks
        let shift = 0;
        for (let x = 0; x < width; ++x) {
            if (!data[x].some(item => item != null)) {
                ++shift;
                continue;
            }
            if (!shift) continue;
            for (let y = 0; y < height; ++y) {
                data[x - shift][y] = data[x][y];
                data[x][y] = null;
            }
        }

        return cluster;
    }

    /**
     * Perform a seed-fill at the given coordinate and return each element.
     * 4-directional only
     */
    getCluster (x, y, data=this.data) {
        const {width, height} = this.options;

        if (this.isOutOfBounds(x, y)) return null;
        if (data[x][y] == null) return null;

        const id = data[x][y];
        const cluster = [];
        const stack = [[x, y]];

        const hash = makeArrayHash(width, height);

        const checkAndAdd = (x, y) => {
            if (this.isOutOfBounds(x, y)) return;
            if (hash.get(x, y)) return;
            hash.set(x, y);
            if (data[x][y] !== id) return;
            stack.push([x, y]);
        }

        let forceBreak = width * height * 2 + 10;
        while (stack.length) {
            // While loops make me paranoid
            if (--forceBreak < 0) throw new Error(`Iterated more than twice over every node. Assuming infinite loop`);
            const coord = stack.pop();
            const [x, y] = coord;

            cluster.push(coord);
            hash.set(x, y);
            checkAndAdd(x, y - 1);
            checkAndAdd(x + 1, y);
            checkAndAdd(x, y + 1);
            checkAndAdd(x - 1, y);
        }

        return {
            id,
            list: cluster,
        };
    }

    initData () { this.data = this.createData(); }

    createData () {
        const {width, height, colors} = this.options;

        const numTiles = width * height;
        const randomList = shuffle(
            new Array(numTiles)
                .fill(null)
                .map((_, index) => colors[Math.floor(index / (numTiles / colors.length))])
        )

        const result = new Array(width).fill(null).map(() => new Array(height).fill(null));

        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                result[x][y] = randomList[x * height + y];
            }
        }

        return result;
    }

    print () {
        const {data} = this;
        const {width, height} = this.options;

        const markerStyle = 'background: black; color: white;';
        const toLog = [];
        let grid = '';
        for (let y = -1; y < height; ++y) {
            for (let x = -1; x < width; ++x) {
                let style = '';
                let content = '  ';
                let borderColor = '#999';
                if (x === -1) {
                    style = markerStyle;
                    if (y !== -1) content = ('' + y + ' ').slice(0, 2);
                } else if (y === -1) {
                    style = markerStyle;
                    if (x !== -1) content = ('' + x + ' ').slice(0, 2);
                } else {
                    let clr = data[x][y];
                    if (clr == null) clr = borderColor = 'transparent';
                    style = `background: ${clr};`;
                }
                grid += `%c${content}`;
                toLog.push(`border: 1px solid ${borderColor}; border-left: 0; ${style}`);
            }
            grid += '\n';
        }
        console.log(grid, ...toLog);
    }
}
