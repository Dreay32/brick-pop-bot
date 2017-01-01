
import React, {PureComponent, PropTypes} from 'react';

import Board from '../Board/Board';
import Logic from '../../lib/Logic';

export default class App extends PureComponent {

    constructor (props) {
        super(props);
        this.logic = new Logic({
            width: 10,
            height: 10,
            colors: ['red', 'green', 'blue'],
        });
    }

    render () {
        return (
            <div>
                <Board logic={this.logic} />
            </div>
        );
    }
}
