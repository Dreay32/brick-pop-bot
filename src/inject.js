
import ReactDOM from 'react-dom';
import React from 'react';

import Board from './components/Board/Board';
import Logic from './lib/Logic';

import './global.css';
import inject from './inject.css';

const SCALE = 1 / 4;
const ROWS = 10;
const COLS = 10;

const NULL_COLOR = {h: 35, s: 54, l: 93};

const init = () => {
    const imgData = getImageData();
    const {data, width, height} = imgData;

    const old = document.getElementById('bot-container');
    if (old) old.remove();
    const container = $(document.createElement('div')).attr({
        id: 'bot-container',
    });
    document.body.appendChild(container);
    container.innerHTML = `
        <canvas id="bot-preview"></canvas>
        <div id="bot-react"></div>
    `;

    const {matrix, colors} = generatePreview(imgData);

    console.log(matrix)
    localStorage.lastMatrix = JSON.stringify(matrix);
    const logic = window.logic = new Logic({
        width: COLS,
        height: ROWS,
        colors,
        data: matrix,
    });

    window.clickOnTile = clickOnTile;

    ReactDOM.render(
        <Board logic={logic} onSolve={handleSolve} />,
        document.getElementById('bot-react')
    );
};

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

const handleSolve = solution => {
    const stack = Array.from(solution);
    const iterate = () => {
        if (!stack.length) return;
        const [x, y] = stack.shift();
        clickOnTile(x, y);
        setTimeout(iterate, 2000);
    }
    iterate();
}

const pointer = $(document.createElement('div')).css({
    position: 'fixed',
    zIndex: 100000,
    top: 0,
    left: 0,
    width: '20px',
    height: '20px',
    border: '2px solid white',
    boxShadow: '2px 2px 2px #000',
    borderRadius: '50%',
    background: 'orange',
    pointerEvents: 'none',
});
pointer.dataset.botInject = true;
document.body.appendChild(pointer);
const clickOnTile = (x, y) => {
    const {offsetLeft, offsetTop, offsetWidth, offsetHeight} = document.getElementById('canvas');

    const delta = (offsetHeight - offsetWidth) / 2;
    const tileW = offsetWidth / COLS;
    const tileH = (offsetHeight - delta * 2) / ROWS;

    const targetX = offsetLeft + (x + 0.5) * tileW | 0;
    const targetY = offsetTop + delta + (y + 0.5) * tileH | 0;

    // console.log({delta, offsetLeft, offsetTop, offsetWidth, offsetHeight, tileH, tileW})
    // console.info(`[click(${x}, ${y})]`, targetX, targetY);
    pointer.style.top = targetY - pointer.offsetWidth / 2 + 'px';
    pointer.style.left = targetX - pointer.offsetWidth / 2 + 'px';

    dispatchMouseEvent('mousedown', targetX, targetY);
    dispatchMouseEvent('mouseup', targetX, targetY);
}

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
    const canvas = document.getElementById('canvas');
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
