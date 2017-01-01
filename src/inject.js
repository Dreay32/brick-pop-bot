
import ReactDOM from 'react-dom';
import React from 'react';

import Board from './components/Board/Board';
import Logic from './lib/Logic';

import './global.css';
import inject from './inject.css';

const SCALE = 1 / 4;
const ROWS = 10;
const COLS = 10;

const init = () => {
    const imgData = getImageData();
    const {data, width, height} = imgData;

    const old = document.getElementById('bot-container');
    if (old) old.remove();
    const container = $(document.createElement('div')).attr({
        id: 'bot-container',
        style: 'position:fixed; top:10px; left:10px; border:1px solid red;',
    });
    document.body.appendChild(container);
    container.innerHTML = `
        <canvas id="bot-preview"></canvas>
        <div id="bot-react"></div>
    `;

    const {matrix, colors} = generatePreview(imgData);

    const logic = new Logic({
        width: COLS,
        height: ROWS,
        colors: colors.map(hsv2string),
        data: matrix.map(arr => arr.map(hsv2string)),
    });

    ReactDOM.render(
        <Board logic={logic} />,
        document.getElementById('bot-react')
    );
};

const hsv2string = ({h, s, v}) => `hsl(${h}, ${s}%, ${v}%)`;

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
    for (let y = 0; y < ROWS; ++y) {
        for (let x = 0; x < COLS; ++x) {
            const {data: [r, g, b]} = ctx.getImageData(
                (x + 0.5) * cellW,
                (y + 0.5) * cellH, 1, 1
            );
            matrix[x][y] = rgb2hsv(r, g, b);
            colors[matrix[x][y].h] = matrix[x][y];

            // const {h, s, v} = matrix[x][y];
            // console.log(
            //     '%c  %c x:%d, y:%d, index:%d, [%d %d% %d%]',
            //     `background: hsl(${h}, ${s}%, ${v}%); border: 1px solid black; border-radius: 50%;`,
            //     'background: white; border: 0;',
            //     x, y, index, h, s, v
            // );
        }
    }

    return {
        matrix,
        colors: Object.values(colors),
        hues: Object.values(colors).map(obj => obj.h),
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

const $ = el => Object.assign(el, {
    attr: obj => {
        Object.keys(obj).forEach(key => { el.setAttribute(key, obj[key]); });
        return el;
    },
});

const rgb2hsv = (a, b, c) => {
    var rr, gg, bb,
        r = a / 255,
        g = b / 255,
        b = c / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
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

init();
