
import React, {PureComponent, PropTypes} from 'react';

import Board from '../Board/Board';
import Logic from '../../lib/Logic';

export default class App extends PureComponent {

    constructor (props) {
        super(props);
        this.logic = new Logic({
            width: 10,
            height: 10,
            colors: ['crimson', 'green', 'blue'],
            data: localStorage.config3 ? JSON.parse(localStorage.config3) : null,
        });

        this.logic2 = new Logic({
            width: 10,
            height: 10,
            colors: ['crimson', 'green', 'blue', 'orange'],
            data: localStorage.config4 ? JSON.parse(localStorage.config4) : null,
        });
    }

    render () {
        return (
            <div>
                <Board logic={this.logic} ref={board => {window.solver = board.solver}} />
                <Board logic={this.logic2} />
            </div>
        );
    }
}
