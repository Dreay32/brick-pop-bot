
import Logic from './Logic';

import {makeArrayHash} from './utils';

const Heuristics = {
    fewClusters: ({clusters}) => clusters.length,

    fewSingles: ({singles}) => singles.length,

    fewBoth: ({clusters, singles}) => singles.length + clusters.length,
};

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
        const {clusters, singles} = boardState;
        return clusters.length === 0 && singles.length !== 0;
    }

    solve (logic=this.logic, path=[]) {
        const boardState = this.getBoardState(logic);

        if (this.isSuccess(boardState)) return path;
        if (this.isFail(boardState)) return null;

        for (let index = 0; index < boardState.clusters.length; ++index) {
            const {list: [[x, y]]} = boardState.clusters[index];
            const clone = logic.clone();
            clone.selectTile(x, y);
            const result = this.solve(clone, path.concat([[x, y]]));
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
        while (toCheck.length) {
            const [x, y] = toCheck.pop();

            if (data[x][y] == null) continue;

            if (hash.get(x, y)) continue;
            hash.set(x, y);

            const cluster = this.logic.getCluster(x, y, data);
            if (cluster == null) continue;
            const bucket = cluster.list.length >= 2 ? clusters : singles;

            for (let [x, y] of cluster.list) {
                data[x][y] = null;
                hash.set(x, y);
            }
            bucket.push(cluster);

        }
        return {
            clusters,
            singles,
        };
    }
}
