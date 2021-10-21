import * as THREE from "three";
import fragmentDeclarations from "../shaders/voronoi/fragmentDeclarations.glsl";
import fragmentChunk from "../shaders/voronoi/fragmentChunk.glsl";
import {ModifiedMaterial} from "./modifiedMaterial.js";


export class VoronoiMaterial extends ModifiedMaterial {
  constructor() {
    super();
    this.colors = {
      color1 : 0xff0000,
      color2 : 0x00ff00
        
    };
    this.uniforms = {
        uTime: { value: 0 },
        uScale: { value: 20 },
        uSpeed: { value: 2. },
        uRandomFactor: {value: 6.0},
        
    };
    this.params = {
      roughness: 0.1,
    };
    this.material = null;
  }

  getMaterial() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xfff,
      roughness: this.params.roughness,
    });
    this.setColorUniforms();


    material.userData = this.uniforms;

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
      .replace(
        /#include <uv_pars_vertex>/,
        `
              varying vec2 vUv;
        `
      )
      .replace(
        /#include <fog_vertex>/,
        `
              #include <fog_vertex>
              vUv = uv;
        `
      )
      shader.fragmentShader = shader.fragmentShader
        .replace(/#include <common>/, "#include <common> "  + fragmentDeclarations )
        .replace(/vec4 diffuseColor.*;/, fragmentChunk)
        .replace(
          /#include <metalnessmap_fragment>/,
          `
                #include <metalnessmap_fragment>
                metalnessFactor = vec4(mix(vec3(1.0), vec3(0.), m_dist) , 1.0).r; 
                `
        );
      shader.uniforms = { ...shader.uniforms, ...material.userData };
    };

    this.material = material;
    return material;
  }

  addGui(folder) {
    this.addColorGui(folder);

  
  
  folder
    .add(this.material.userData.uScale, "value")
    .min(10)
    .max(50)
    .step(1.)
    .name("uScale");
  
  folder
    .add(this.material.userData.uSpeed, "value")
    .min(0)
    .max(10)
    .step(0.5)
    .name("uSpeed");

    folder
    .add(this.material.userData.uRandomFactor, "value")
    .min(-6)
    .max(10)
    .step(0.5)
    .name("uRandomFactor");
  
  }
}
