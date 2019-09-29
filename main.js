import shaderSrc_kernel from './shaderSrc_kernel.js'
import shaderSrc_threshold from './shaderSrc_threshold.js'

const gl = document.getElementById("c").getContext("webgl");
// kernel program
const programInfo_kernel = twgl.createProgramInfo(gl, [shaderSrc_kernel.vertexShaderSrc, shaderSrc_kernel.fragmentShaderSrc]);

// threshold program
const programInfo_threshold = twgl.createProgramInfo(gl, [shaderSrc_threshold.vertexShaderSrc, shaderSrc_threshold.fragmentShaderSrc]);

let programInfo = programInfo_threshold; // init fragmentShader

function setProgram(program) {
    programInfo = program;
}
document.querySelector('#shader-select').addEventListener('change', e => {
    switch (e.target.value) {
        case 'kernel':
            programInfo = programInfo_kernel;
            break;
        case 'threshold':
            programInfo = programInfo_threshold;
            break;
    }
})

const arrays = {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

// load image
const image = new Image();
image.src = "images/aerial-shot-dark-from-above-1358699.jpg"; // placeholder image
image.onload = (e) => {
    setTextureByImage(image);
    setFixedCanvas(image);
    calcGlobalParams(image); // must be called after setFixedCanvas
}
const canvas = document.querySelector('#c');
canvas.width = image.width;
canvas.height = image.height;
twgl.createTextures(gl, {
    // a non-power of 2 image
    tex0: {
        src: image.src
    },
});

// load image by file
{
    document.querySelector('#file-input').addEventListener('change', e => {
        image.src = URL.createObjectURL(e.target.files[0]);
    })
}

function setTextureByImage(image) {
    canvas.width = image.width;
    canvas.height = image.height;
    twgl.createTextures(gl, {
        // a non-power of 2 image
        tex0: {
            src: image.src
        },
    });
}

function setFixedCanvas(image) {
    off_c.width = image.width;
    off_c.height = image.height;
    off_c.getContext('2d').drawImage(image, 0, 0, image.width, image.height);
}

// convolution mask
const kernel = [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0
];
// bind dom
{
    const inputs = document.querySelectorAll('#mask .kernel');
    inputs.forEach((el, i) => {
        el.value = kernel[i]; // init
        el.addEventListener('change', e => {
            kernel[i] = el.value;
        })
    })
    const resetBtn = document.querySelector('#reset-btn').addEventListener('click', e => {
        kernel.splice(0);
        kernel.push(0, 0, 0, 0, 1, 0, 0, 0, 0);
        inputs.forEach((el, i) => {
            el.value = kernel[i];
        })
    })
}
const rgbaText = document.querySelector('#rgbaText');
const rgbaLabel = document.querySelector('#rgbaLabel');

// use an off screen canvas to get global info from the image 
// called after img is loaded
const off_c = document.querySelector('#off_c');
off_c.width = image.width;
off_c.height = image.height;

// mousemove event for both canvas
const mouseCoord = {
    x: 0,
    y: 0
};
let pixelData = new Uint8Array(
    4
);
canvas.addEventListener('mousemove',
    e => {
        mouseCoord.x = e.offsetX;
        mouseCoord.y = c.height - e.offsetY;

        rgbaText.textContent = `${pixelData[0]},${pixelData[1]},${pixelData[2]}`;
        rgbaLabel.style.backgroundColor = `rgba(${pixelData})`;
    })

// calcGlobalParams is incompleted, the size of imgData is too big and hard to process by simple forEach()
function calcGlobalParams(image) {
    const imgData = off_c.getContext('2d').getImageData(0, 0, off_c.width, off_c.height);
}

// threshold for program_threshold
let threshold = 0;
document.querySelector('#threshold').addEventListener('change', e => {
    threshold = e.target.value;

})

function render(time) {

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const uniforms = {
        time: time * 0.001,
        threshold,
        resolution: [gl.canvas.width, gl.canvas.height],
        texSize: [image.width, image.height],
        kernel,
        kernelWeight: 1
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    // read single pixel data by mouseCoord
    // readPixels() must be called after drawBufferInfo() and before requestAnimationFrame()
    gl.readPixels(mouseCoord.x, mouseCoord.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);