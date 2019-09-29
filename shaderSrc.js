const vertexShaderSrc = `
attribute vec4 position;

void main() {
  gl_Position = position;
}`;

const fragmentShaderSrc = `
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D tex; // default to tex0
uniform vec2 texSize;

uniform float kernel[9];

uniform float lightness;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv = vec2(uv.x,1.-uv.y); // flip y
  vec2 onePixel = vec2(1.0,1.0) / texSize;

  vec4 color = texture2D(tex,uv);

  // kernel
  vec4 colorSum = 
  texture2D(tex,uv + onePixel * vec2(-1,1)) * kernel[0] +
  texture2D(tex,uv + onePixel * vec2(0,1)) * kernel[1] +
  texture2D(tex,uv + onePixel * vec2(1,1)) * kernel[2] +
  texture2D(tex,uv + onePixel * vec2(-1,0)) * kernel[3] +
  texture2D(tex,uv + onePixel * vec2(0,0)) * kernel[4] +
  texture2D(tex,uv + onePixel * vec2(1,0)) * kernel[5] +
  texture2D(tex,uv + onePixel * vec2(-1,-1)) * kernel[6] +
  texture2D(tex,uv + onePixel * vec2(0,-1)) * kernel[7] +
  texture2D(tex,uv + onePixel * vec2(1,-1)) * kernel[8] ;

  gl_FragColor = vec4(colorSum.xyz,1.0);
}`;

export default {
  fragmentShaderSrc,
  vertexShaderSrc
}