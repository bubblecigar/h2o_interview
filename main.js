import shaderSrc from './shaderSrc.js'

const gl = document.getElementById("c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, [shaderSrc.vertexShaderSrc, shaderSrc.fragmentShaderSrc]);

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

        rgbaText.textContent = `${pixelData[0]},${pixelData[0]},${pixelData[0]}`;
        rgbaLabel.style.backgroundColor = `rgba(${pixelData})`;

    })

// use framebuffer to apply multiple kernels
{
    function createAndSetupTexture(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture
    }

    const textures = [];
    const framebuffers = [];
    for (let i = 0; i < 2; i++) {

        const texture = createAndSetupTexture(gl);
        textures.push(texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, null);

        const framebuffer = gl.createFramebuffer();
        framebuffers.push(framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    // switch to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    function setFramebuffer(fbo, width, height) {
        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Tell the shader the resolution of the framebuffer.
        gl.uniform2f(resolutionLocation, width, height);

        // Tell webgl the viewport setting needed for framebuffer.
        gl.viewport(0, 0, width, height);
    }

    function drawWithKernel(name) {
        // set the kernel
        gl.uniform1fv(kernelLocation, kernels[name]);

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

function render(time) {

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const uniforms = {
        time: time * 0.001,
        lightness: 1,
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