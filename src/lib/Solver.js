
import Logic from './Logic';

import {makeArrayHash} from './utils';

const Heuristics = {
    fewClusters: ({clusters}) => clusters.length,

    fewSingles: ({singles}) => singles.length,

    fewBoth: ({clusters, singles}) => singles.length + clusters.length,
};

/**
 * How many points do you get for a cluster of size N
 */
const clusterPoints = n => n * (n - 1);

export default class Solver {

    logic = null;

    constructor (logic) {
        this.logic = logic.clone();
    }

    isSuccess (boardState) {
        const {clusters, singles} = boardState;
        return clusters.length === 0 && singles.length === 0;
    }

    isFail (boardState) {
        const {clusters, singles, count} = boardState;
        return (clusters.length === 0 && singles.length !== 0) ||
            Object.values(count).some(num => num === 1);
    }

    solve () {
        return this._solveIterator(this.logic, this.getBoardState(this.logic));
    }

    _solveIterator (logic, boardState, path=[], _config) {
        if (this.isSuccess(boardState)) return path;
        if (this.isFail(boardState)) return null;

        const order = Array.from(boardState.clusters).sort((a, b) =>
            a.list.length - b.list.length
        );

        const h = boardState.singles.length ?
            ({state}) => Heuristics.fewSingles(state) :
            ({score}) => -1 * score;

        const siblings = [];

        for (let {list} of order) {
            const clone = logic.clone();
            const [x, y] = list[0];
            clone.selectTile(x, y);
            const state = this.getBoardState(clone);
            const score = clusterPoints(list.length);
            siblings.push({
                clone,
                state,
                score,
                coord: list[0],
            });
        }

        siblings.sort((a, b) => h(a) - h(b));

        for (let {coord, clone, state} of siblings) {
            const result = this._solveIterator(clone, state, path.concat([coord]), _config);
            if (result) return result;
        }


        return null;
    }

    /**
     * Returns all clusters of size >= 2 on the board
     */
    getBoardState (logic=this.logic) {
        const {data, options: {width, height}} = logic.export();

        const toCheck = [];
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                if (data[x][y] == null) continue;
                toCheck.push([x, y]);
            }
        }
        toCheck.reverse();

        const hash = makeArrayHash(width, height);

        const clusters = [];
        const singles = [];
        const count = {};
        while (toCheck.length) {
            const [x, y] = toCheck.pop();

            if (data[x][y] == null) continue;

            if (hash.get(x, y)) continue;
            hash.set(x, y);

            const cluster = this.logic.getCluster(x, y, data);
            if (cluster == null) continue;
            const bucket = cluster.list.length >= 2 ? clusters : singles;

            count[cluster.id] = (count[cluster.id] || 0) + cluster.list.length;
            for (let [x, y] of cluster.list) {
                data[x][y] = null;
                hash.set(x, y);
            }
            bucket.push(cluster);

        }
        return {
            clusters,
            singles,
            count,
        };
    }
}
