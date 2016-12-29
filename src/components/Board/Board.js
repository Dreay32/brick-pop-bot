
import React, {PureComponent, PropTypes} from 'react';

import Logic from '../../lib/Logic';
import Solver from '../../lib/Solver';

import './Board.css';

export default class Board extends PureComponent {

    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        colors: PropTypes.arrayOf(PropTypes.oneOf(['red', 'green', 'blue'])).isRequired,
    };

    state = {
        board: null,
        solution: null,
    };

    logic: null;

    constructor (props) {
        super(props);

        const {width, height, colors} = this.props;
        window.logic = this.logic = new Logic({width, height, colors});
        window.solver = this.solver = new Solver(this.logic);
        this.logic.print();

        this.state.board = this.logic.export();
    }

    solve () {
        const solution = this.solver.solve();
        if (!solution) return this.setState({message: 'No solution found'});
        this.setState({solution});
    }

    play () {
        const {playing, solution} = this.state;
        if (playing) return;
        if (!solution) return;
        const clone = this.logic.clone();
        const queue = Array.from(solution);
        this.setState({playing: true});
        this._playInterval = setInterval(() => {
            if (!queue.length) {
                clearInterval(this._playInterval);
                this.setState({playing: false});
                return;
            };
            const [x, y] = queue.shift();
            clone.selectTile(x, y);
            this.setState({
                board: clone.export(),
                message: `Move ${solution.length - queue.length}`,
            });
        }, 500);
    }

    handleCellClick = ({target: {dataset}}) => {
        const x = parseInt(dataset.x);
        const y = parseInt(dataset.y);
        this.logic.selectTile(x, y);
        this.setState({board: this.logic.export()});
    };

    handleSolve = () => this.solve();

    handlePlay = () => this.play();

    render () {
        const {width, height, colors, ...rest} = this.props;
        const {solution, message, playing, board: {data}} = this.state;

        /**
         * Instead of doing fancy Array Flip logic inside here
         *  I'm transposing the matrix via css - flexbox FTW
         *  ...
         *  shut up, it's awesome!
         */

        return (
        <div {...rest} className='board'>
            <div className='board-grid'>
                {data.map((column, x) =>
                    <div key={x} className='board-column'>
                        {column.map((color, y) =>
                            <div
                                key={y}
                                className='board-cell'
                                style={{backgroundColor: color}}
                                data-x={x}
                                data-y={y}
                                onClick={this.handleCellClick}
                            />
                        )}
                    </div>
                )}
            </div>

            {!message ? null : <div className='board-message'>{message}</div>}

            {!solution ? null : <div className='board-message'>Solution has {solution.length} moves</div>}

            <div>
                <button disabled={playing} onClick={this.handleSolve}>Solve!</button>

                {!solution ? null :
                    <button disabled={playing} onClick={this.handlePlay}>Play Solution!</button>
                }
            </div>
        </div>
        );
    }

}
