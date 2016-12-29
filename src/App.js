
import React, {PureComponent, PropTypes} from 'react';

import './App.css';
import Board from './Board';

export default class App extends PureComponent {

    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div>
                the app:
                <Board width={10} height={10} colors={['red', 'green', 'blue']} />
            </div>
        );
    }
}
