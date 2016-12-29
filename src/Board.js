
import React, {PureComponent, PropTypes} from 'react';

import Logic from './Logic';

import './Board.css';

export default class Board extends PureComponent {

    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        colors: PropTypes.arrayOf(PropTypes.oneOf(['red', 'green', 'blue'])).isRequired,
    };

    state = {
        board: null,
    };

    logic: null;

    constructor (props) {
        super(props);

        const {width, height, colors} = this.props;
        window.logic = this.logic = new Logic({width, height, colors});
        this.logic.print();

        this.state.board = this.logic.export();
    }

    handleCellClick = ({target: {dataset}}) => {
        const x = parseInt(dataset.x);
        const y = parseInt(dataset.y);
        this.logic.selectTile(x, y);
        this.setState({board: this.logic.export()});
    }

    render () {
        const {width, height, colors, ...rest} = this.props;
        const {board: {data}} = this.state;

        /**
         * Instead of doing fancy Array Flip logic inside here
         *  I'm transposing the matrix via css - flexbox FTW
         *  ...
         *  shut up, it's awesome!
         */

        return (
        <div {...rest} className='board'>
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
        );
    }

}
