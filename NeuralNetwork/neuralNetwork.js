function createCanvas(elem)
{
    const ctx = elem.getContext('2d');
    const pixel = 10;

    let is_mouse_down = false;

    canvas.width = 500;
    canvas.height = 500;

    this.drawLine = function(x1, y1, x2, y2, color = 'gray') {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    this.drawCell = function(x, y, w, h) {
        ctx.fillStyle = 'purple';
        ctx.strokeStyle = 'purple';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = 1;
        ctx.rect(x, y, w, h);
        ctx.fill();
    }

    this.clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.drawGrid = function() {
        const w = canvas.width;
        const h = canvas.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        for( let x = 0; x < w; x += xStep ){
            this.drawLine(x, 0, x, h);
        }

        for( let y = 0; y < h; y += yStep ){
            this.drawLine(0, y, w, y);
        }
    }

    this.pixelation = function(draw = false) {
        const w = canvas.width;
        const h = canvas.height;
        const p = w / pixel;

        const xStep = w / p;
        const yStep = h / p;

        const vector = [];
        let drawing = [];

        for( let x = 0; x < w; x += xStep ){
            for( let y = 0; y < h; y += yStep ){
                const data = ctx.getImageData(x, y, xStep, yStep);
                let nonEmptyPixelsCount = 0;
                for( i = 0; i < data.data.length; i += 10 ){
                    const isEmpty = data.data[i] === 0;

                    if( !isEmpty ){
                        nonEmptyPixelsCount += 1;
                    }
                }

                if( nonEmptyPixelsCount > 1 && draw ){
                    drawing.push([x, y, xStep, yStep]);
                }
                vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
            }
        }

        if( draw ){
            this.clear();
            this.drawGrid();

            for( nuc in drawing ){
                this.drawCell( drawing[nuc][0], drawing[nuc][1], drawing[nuc][2], drawing[nuc][3] );
            }
        }

        return vector;
    }

    elem.addEventListener('mousedown', function(e) {
        is_mouse_down = true;
        ctx.beginPath();
    })

    elem.addEventListener('mouseup', function(e) {
        is_mouse_down = false;
    })

    elem.addEventListener('mousemove', function(e) {
        if( is_mouse_down )
        {
            ctx.fillStyle = 'orange';
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = pixel;

            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
    })
}

let bStart = document.getElementById('start');
let bReset = document.getElementById('reset');
let vector = [];
let net = null;
let train_data = [];

const outputCanvas = new createCanvas(document.getElementById('canvas'));

bReset.addEventListener('mousedown', function(e) {
    outputCanvas.clear();
})

bStart.addEventListener('mousedown', function(e){
    outputCanvas.pixelation(true);
})

