import {MeshBasicMaterial} from "three"

export class MyMaterial extends MeshBasicMaterial {
    constructor({color, transparent, opacity, depthWrite}){
        super({color, transparent, opacity, depthWrite});

        this.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                `vec3 outgoingLight = reflectedLight.indirectDiffuse;`,
                `
                vec3 outgoingLight = vec3(1,0,0);
            `);

            // shader.fragmentShader.replace(
            //     "#include <alphahash_pars_fragment>",
            //     `
            //         //eeeee
            //     `
            // );
        }
    }
}