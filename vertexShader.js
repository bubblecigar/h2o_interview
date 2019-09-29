const vertexShader = `
attribute vec4 position;
attribute vec2 a_texcoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = position;
  v_texCoord = a_texcoord;
}`

export default vertexShader