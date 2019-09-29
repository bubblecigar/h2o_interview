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
uniform float threshold;
uniform float lightness;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv = vec2(uv.x,1.-uv.y); // flip y

  vec4 color = texture2D(tex,uv);

  float t = step(threshold,color.x);

  gl_FragColor = color * t;
}`;

export default {
  fragmentShaderSrc,
  vertexShaderSrc
}