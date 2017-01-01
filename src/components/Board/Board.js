
import React, {PureComponent, PropTypes} from 'react';

import Logic from '../../lib/Logic';
import Solver from '../../lib/Solver';
import {transpose} from '../../utils/array';

import './Board.css';

export default class Board extends PureComponent {

    static propTypes = {
        logic: PropTypes.instanceOf(Logic).isRequired,
        onSolve: PropTypes.func,
    };

    state = {
        board: null,
        solution: null,
    };

    constructor (props) {
        super(props);

        const {logic} = this.props;
        window.solver = this.solver = new Solver(this.props.logic);
        logic.print();

        this.state.board = logic.export();
    }

    solve () {
        const {onSolve} = this.props;
        const solution = this.solver.solve();
        if (!solution) return this.setState({message: 'No solution found'});
        if (onSolve) onSolve(solution);
        this.setState({solution});
    }

    play () {
        const {logic} = this.props;
        const {playing, solution} = this.state;
        if (playing) return;
        if (!solution) return;
        const clone = logic.clone();
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
        const {logic} = this.props;
        const x = parseInt(dataset.x);
        const y = parseInt(dataset.y);
        logic.selectTile(x, y);
        this.setState({board: logic.export()});
    };

    handleSolve = () => this.solve();

    handlePlay = () => this.play();

    render () {
        const {logic, onSolve, ...rest} = this.props;
        const {solution, message, playing, board: {data}} = this.state;

        const matrix = transpose(data);

        return (
        <div {...rest} className='board'>
            <div className='board-grid'>
                {matrix.map((row, y) =>
                    <div key={y} className='board-row'>
                        {row.map((color, x) =>
                            <div
                                key={x}
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
