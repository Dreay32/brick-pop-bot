
import ReactDOM from 'react-dom';
import React, {PureComponent} from 'react';

import Board from './components/Board/Board';
import Logic from './lib/Logic';

import './global.css';
import inject from './inject.css';

const SCALE = 1 / 4;
const ROWS = 10;
const COLS = 10;

const NULL_COLOR = {h: 35, s: 54, l: 93};

const init = () => {
    const old = document.getElementById('bot-container');
    if (old) {
        console.log('Removing previous canvas')
        old.remove();
    }

    if (window._actionQueue) {
        console.log('Removing previous actionQueue');
        window._actionQueue.stop();
        window._actionQueue.empty();
    }

    const container = $(document.createElement('div')).attr({
        id: 'bot-container',
    });
    document.body.appendChild(container);
    container.innerHTML = `
        <canvas id="bot-preview"></canvas>
        <div id="bot-react"></div>
    `;

    window.onblur = () => {
        console.warn('Tab changed. Stopping actionQueue');
        actionQueue.stop();
    };
    window.onfocus = () => {
        console.info('Tab regained focus. Starting actionQueue');
        actionQueue.run();
    };

    ReactDOM.render(
        <App />,
        document.getElementById('bot-react')
    );
};

class PromiseQueue {
    items = [];
    // Automatically start the queue on .add()
    autoRun = true;

    constructor ({autoRun=true}={}) {
        this.autoRun = autoRun;
    }

    add (...fnList) {
        this.items.push(...fnList);
        if (this.autoRun) this.run();
    }

    empty () { this.items = []; }

    stop () { delete this._currentRun; }

    isRunning () { return !!this._currentRun; }
    isEmpty () { return !this.items.length; }

    _iterate = () => {
        if (!this._currentRun) return;

        if (!this.items.length) {
            this._currentRun.resolve();
            delete this._currentRun;
            return;
        }

        Promise.resolve()
        .then(this.items.shift())
        .then(this._iterate)
        .catch(ex => {
            console.warn('[PromiseQueue] FAILED:', ex.stack || ex.message || ex);
            this._currentRun.reject(ex);
        });
    };

    run () {
        if (this._currentRun) return this._currentRun;

        const attributes = {};
        const promise = new Promise((resolve, reject) => {
            Object.assign(attributes, {resolve, reject});
        });
        Object.assign(promise, attributes);
        this._currentRun = promise;
        this._iterate();
        return promise;
    }
};

const PromiseTimeout = time => new Promise(resolve => setTimeout(() => resolve(), time));

const actionQueue = window._actionQueue = new PromiseQueue();

let reloadTimeout = null;
class App extends PureComponent {
    state = {
        logic: null,
        autoReload: true,
    };

    constructor (props) {
        super(props);
        window.logic = this.state.logic = this.getLogic();
    }

    getLogic (noCache=false) {
        const imgData = getImageData();
        const {data, width, height} = imgData;
        const {matrix, colors} = generatePreview(imgData);
        if (!noCache) localStorage.lastMatrix = JSON.stringify(matrix);
        const logic = new Logic({
            width: COLS,
            height: ROWS,
            colors,
            data: matrix,
        });
        return logic;
    }

    refreshLogic (noCache) {
        const logic = window.logic = this.getLogic(noCache);
        this.setState({logic});
    }

    handleReload = () => this.refreshLogic();

    handleSolve = solution => {
        if (actionQueue.isRunning() && !actionQueue.isEmpty()) {
            console.warn('Already running');
            return;
        }

        const stack = Array.from(solution);

        actionQueue.add(() => this.refreshLogic(true));

        if (!stack.length) return;

        actionQueue.add(
            ...([].concat.apply([],
                stack.map(([x, y]) => [
                    () => clickOnTile(x, y),
                    () => PromiseTimeout(2250),
                    () => this.refreshLogic(true),
                ])
            ))
        );

        actionQueue.add(() => {
            if (!this.state.autoReload) return;

            actionQueue.add(
                () => {
                    console.info('will autoReload');
                    return PromiseTimeout(2000);
                },
                () => {
                    console.log('  - clicking on top left');
                    return dispatchClick(getCanvas().offsetLeft + 20, getCanvas().offsetTop + 20);
                },
                () => PromiseTimeout(4 * 1000),
                () => {
                    console.log('  - refreshing');
                    this.refreshLogic();
                    return PromiseTimeout(500);
                },
                () => {
                    console.log('  - solving');
                    this.refs.board.solve();
                },
            );
        });
    };

    handleAutoReload = event => this.setState({autoReload: event.target.checked});

    render () {
        const {logic, autoReload} = this.state;

        return (
            <div>
                <div>
                    <button onClick={this.handleReload}>Reload Board</button>
                    <br />
                    <label>
                        <input type='checkbox' checked={autoReload} onChange={this.handleAutoReload} />
                        Auto-Reload
                    </label>
                </div>
                <Board logic={logic} onSolve={this.handleSolve} ref='board' />
            </div>
        );
    }
}

const hsl2string = ({h, s, l}) => `hsl(${h}, ${s}%, ${l}%)`;

const $ = el => Object.assign(el, {
    attr: obj => {
        Object.keys(obj).forEach(key => { el.setAttribute(key, obj[key]); });
        return el;
    },
    css: obj => {
        Object.keys(obj).forEach(key => { el.style[key] = obj[key]; });
        return el;
    },
});

const getCanvas = () => document.getElementById('canvas');

const pointer = $(document.createElement('div'));
pointer.classList.add('bot-pointer')
pointer.dataset.botInject = true;
document.body.appendChild(pointer);
const clickOnTile = (x, y) => {
    const {offsetLeft, offsetTop, offsetWidth, offsetHeight} = getCanvas();

    const delta = (offsetHeight - offsetWidth) / 2;
    const tileW = offsetWidth / COLS;
    const tileH = (offsetHeight - delta * 2) / ROWS;

    const targetX = offsetLeft + (x + 0.5) * tileW | 0;
    const targetY = offsetTop + delta + (y + 0.5) * tileH | 0;

    return dispatchClick(targetX, targetY);
};

const dispatchClick = (x, y) => {
    pointer.classList.add('bot-animated');
    pointer.css({
        top: y - pointer.offsetWidth / 2 + 'px',
        left: x - pointer.offsetWidth / 2 + 'px',
    });

    return PromiseTimeout(250).then(() => {
        dispatchMouseEvent('mousedown', x, y);
        dispatchMouseEvent('mouseup', x, y);
    });
};

// http://stackoverflow.com/a/16509592/574576
const dispatchMouseEvent = (type, x, y) => {
    var ev = document.createEvent('MouseEvent');
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        type,
        true /* bubble */, true /* cancelable */,
        window, null,
        x, y, x, y, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

const generatePreview = imgData => {
    const {width, height, data} = imgData;
    const canvas = $(document.getElementById('bot-preview')).attr({
        width,
        height,
    });
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(imgData, 0, 0);

    const matrix = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(null));

    const colors = {};
    const cellW = width / COLS | 0;
    const cellH = height / ROWS | 0;
    const nullClr = hsl2string(NULL_COLOR);
    for (let y = 0; y < ROWS; ++y) {
        for (let x = 0; x < COLS; ++x) {
            const {data: [r, g, b]} = ctx.getImageData(
                (x + 0.5) * cellW,
                (y + 0.5) * cellH, 1, 1
            );
            let clr = hsl2string(rgbToHsl(r, g, b));
            if (clr === nullClr) clr = null;
            matrix[x][y] = clr;
            colors[clr] = clr;
        }
    }

    return {
        matrix,
        colors: Object.values(colors),
    };
};

const getImageData = () => {
    const canvas = getCanvas();
    const {width, height} = canvas;

    const delta = (height - width) * SCALE / 2;

    const tmpCanvas = $(document.createElement('canvas')).attr({
        width: width * SCALE,
        height: height * SCALE,
    });
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.scale(SCALE, SCALE);
    tmpCtx.drawImage(canvas, 0, 0);
    return tmpCtx.getImageData(0, delta, tmpCanvas.width, tmpCanvas.height - delta * 2);
};

const rgbToHsl = (r, g, b) => {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

init();
