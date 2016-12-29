
import React, {PureComponent, PropTypes} from 'react';

import Board from '../Board/Board';

export default class App extends PureComponent {

    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div>
                <Board width={10} height={10} colors={['red', 'green', 'blue']} />
            </div>
        );
    }
}
