// use the TF library and load in a tflite model
// web js version of tensorflow

const lables = ['decimal', 'div', 'eight', 'equal', 'five', 'four', 'minus', 'nine', 'one', 'plus', 'seven', 'six', 'three', 'times', 'two', 'zero'];
const lablesText = ['.', '/', '8', '=', '5', '4', '-', '9', '1', '+', '7', '6', '3', 'x', '2', '0'];

const canvas = document.getElementById('Drawing');
const ctx = canvas.getContext('2d');

var needsUpdate = true;

// load model.tflite
(async () => {

    // load image to canvas
    const img = new Image();
    img.src = 'loading.png';
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
    };



    console.log('Loading model...');
    const model = await tflite.loadTFLiteModel('model.tflite');
    console.log('Model loaded.');

    tf.setBackend("webgl").then(e => {

        console.log(e)

    })


    setInterval(() => {


        if (needsUpdate) {
            needsUpdate = false;

            const data = tf.tidy(() => {

                // get image from canvas
                const canvas = document.getElementById('Drawing');

                const tensor = tf.browser.fromPixels(canvas);
                const resized = tf.image.resizeBilinear(tensor, [155, 155]);
                const batched = resized.expandDims(0);

                // predict
                const prediction = model.predict(batched);
                return prediction.dataSync();

            })

            // get max value
            let max = 0;
            let maxIndex = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i] > max) {
                    max = data[i];
                    maxIndex = i;
                }

                if (lables[i] != undefined) {
                    let Prog = document.getElementById(`${lablesText[i]}Prog`);
                    Prog.value = data[i] * 100;
                }

            }

            Organize()

        }

    }, 50);

    // fill the background with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

})();

let drawing = false;

canvas.addEventListener('mousedown', e => {
    drawing = true;
});

document.addEventListener('mouseup', e => {
    drawing = false;
    ctx.beginPath();

});

canvas.addEventListener('mousemove', e => {

    if (drawing) {
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX / 1, e.clientY / 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX / 1, e.clientY / 1);

        needsUpdate = true;
    }

});

// clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function CreateOutputDisplays() {

    lablesText.forEach((label) => {
        let html = `<p id="ConfidenceText">${label}</p>
        <progress id="${label}Prog" value="0" max="100"></progress>`

        let div = document.createElement('div');
        div.innerHTML = html;
        div.className = 'Output';

        document.getElementById('ConfodenceBoxes').appendChild(div);

    });

};
CreateOutputDisplays();

function Organize() {

    // organize the output divs based on the confidence
    let divs = document.getElementsByClassName('Output');
    let divsArray = Array.from(divs);

    divsArray.sort((a, b) => {
        let aVal = a.children[1].value;
        let bVal = b.children[1].value;
        return bVal - aVal;
    });

    let divsParent = document.getElementById('ConfodenceBoxes');
    divsArray.forEach((div) => {
        divsParent.appendChild(div);
    });



}