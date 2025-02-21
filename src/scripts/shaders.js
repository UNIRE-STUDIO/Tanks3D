export let shadowShader = `
        uniform vec3 uBaseColor;
        uniform float opacity;
        uniform vec2 uBaseVertRatio;
        #include <common>
        void main() {
            vec4 color = vec4(uBaseColor, 1.0);
            color *= uBaseVertRatio.x;
            color += vec4(0,0,0, 1.0) * uBaseVertRatio.y;
            gl_FragColor = vec4( color.rgb, opacity );
        }
`;

