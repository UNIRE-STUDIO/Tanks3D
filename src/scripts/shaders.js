export let shadowShader = `
uniform vec2 resolution;
uniform sampler2D tex;
void main() {
	vec2 pos = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D(tex,pos);
}
`;

