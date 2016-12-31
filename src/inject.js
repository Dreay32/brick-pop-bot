
(() => {
    const SCALE = 1 / 2;
    const ROWS = 10;
    const COLS = 10;

    const init = () => {
        const imgData = getImageData();
        const {data, width, height} = imgData;

        const matrix = generatePreview(imgData);
    };

    const generatePreview = imgData => {
        const preview = $(document.getElementById('bot-preview') || document.createElement('div'));
        const {width, height, data} = imgData;
        const canvas = $(document.getElementById('hack-canvas') || document.createElement('canvas'));
        canvas.attr({
            width,
            height,
            id: 'hack-canvas',
            style: 'position:fixed; top:10px; left:10px; border:1px solid red;',
        });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(imgData, 0, 0);

        const matrix = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(null));

        const colors = {};
        const cellW = width / COLS | 0;
        const cellH = height / ROWS | 0;
        for (let y = 0; y < ROWS; ++y) {
            for (let x = 0; x < COLS; ++x) {
                const index = (
                    (((y + 0.5) * cellH) * COLS * cellW | 0) +
                    ((x + 0.5) * cellW | 0)
                ) * 4;
                matrix[y][x] = rgb2hsv(data[index], data[index + 1], data[index + 2]);
                colors[matrix[y][x].h] = true;

                const {h, s, v} = matrix[y][x];
                console.log(
                    '%c  %c x:%d, y:%d, index:%d, [%d %d% %d%]',
                    `background: hsl(${h}, ${s}%, ${v}%); border: 1px solid black; border-radius: 50%;`,
                    'background: white; border: 0;',
                    x, y, index, h, s, v
                );

                // ctx.fillStyle = 'black';
                // ctx.fillRect(y * cellH + cellH / 2 - 2, x * cellW + cellW / 2 - 2, 4, 4);
            }
        }

        console.log.apply(console,
            [('%c  '.repeat(COLS) + '\n').repeat(ROWS)].concat(
                matrix.reduce((arr, row) => arr.concat(row.map(
                    ({h, s, v}) => `background: hsl(${h}, ${s}%, ${v}%);`
                )), [])
            )
        );

        return matrix;
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
})();
