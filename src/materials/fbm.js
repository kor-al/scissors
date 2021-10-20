import * as THREE from "three";
import fragmentDeclarations from "../shaders/liquid/fragmentDeclarations.glsl";
import perlinNoiseFunctions from "../shaders/perlinNoise2d.glsl";
import fragmentChunk from "../shaders/liquid/fragmentChunk.glsl";
import {ModifiedMaterial} from "./modifiedMaterial.js";


export class FbmMaterial extends ModifiedMaterial {
  constructor() {
    super();
    this.colors = {
        color1a : 0xf9ff00,
        color1b : 0xe03e,
        color2 : 0xce0031,
        color3 : 0x93ff,
        
    };
    this.uniforms = {
        uTime: { value: 0 },
        uOctaves: { value: 6 },
        uScale: { value: 2.5 },
        uSpeed: { value: { x: 0.01, y: 0.05 } },
        uRotation: { value: { x: 1, y: 2 } },
        uDegreeWeights: { value: { x: 0.6, y: 0.2, z: 0.2 } }
    };
    this.params = {
      roughness: 0.2,
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
        .replace(/#include <common>/, "#include <common> " + perlinNoiseFunctions + fragmentDeclarations )
        .replace(/vec4 diffuseColor.*;/, fragmentChunk)
        .replace(
          /#include <metalnessmap_fragment>/,
          `
                #include <metalnessmap_fragment>
                metalnessFactor = vec4(mix(vec3(0.0), vec3(1.1), clamp(f*f,0.0,1.0)) , 1.0).r; 
                `
        );
        console.log(shader.fragmentShader)
      shader.uniforms = { ...shader.uniforms, ...material.userData };
    };

    this.material = material;
    return material;
  }

  addGui(folder) {
    this.addColorGui(folder);

  
  folder
    .add(this.material.userData.uOctaves, "value")
    .min(1)
    .max(7)
    .step(1)
    .name("uOctaves");
  
  folder
    .add(this.material.userData.uScale, "value")
    .min(1)
    .max(10)
    .step(0.5)
    .name("uScale");
  
  folder
    .add(this.material.userData.uSpeed.value, "x")
    .min(0)
    .max(0.1)
    .step(0.001)
    .name("uSpeed.1");
  
  folder
    .add(this.material.userData.uSpeed.value, "y")
    .min(0)
    .max(0.1)
    .step(0.001)
    .name("uSpeed.2");
  
  folder
    .add(this.material.userData.uRotation.value, "x")
    .min(-5)
    .max(5)
    .step(0.1)
    .name("uRotation.1");
  
  folder
    .add(this.material.userData.uRotation.value, "y")
    .min(-5)
    .max(5)
    .step(0.1)
    .name("uRotation.2");
  
  folder
    .add(this.material.userData.uDegreeWeights.value, "x")
    .min(0)
    .max(5)
    .step(0.1)
    .name("uDegreeWeights x");
  
  folder
    .add(this.material.userData.uDegreeWeights.value, "y")
    .min(0)
    .max(5)
    .step(0.1)
    .name("uDegreeWeights y");
  
  folder
    .add(this.material.userData.uDegreeWeights.value, "z")
    .min(0)
    .max(5)
    .step(0.1)
    .name("uDegreeWeights z");
  
  }
}
