const fragmentShader = `
precision mediump float;

uniform vec2 resolution;
uniform float time;
varying vec2 v_texCoord;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float color = 0.0;


  gl_FragColor = vec4(v_texCoord  ,.0 , 1.0 );
}`

export default fragmentShader