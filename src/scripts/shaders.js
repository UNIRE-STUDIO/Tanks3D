export let shadowShader = `
uniform vec2 resolution;
uniform sampler2D tex;
void main() {
	vec2 pos = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = vec4(pos.x,0.0,pos.y,0.5);
}
`;

