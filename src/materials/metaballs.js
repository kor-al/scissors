import * as THREE from "three";
import fragmentDeclarations from "../shaders/metaballs/fragmentDeclarations.glsl";
import fragmentChunk from "../shaders/metaballs/fragmentChunk.glsl";
import {ModifiedMaterial} from "./modifiedMaterial.js";


export class MetaballsMaterial extends ModifiedMaterial {
  constructor() {
    super();
    this.colors = {
        colorInvertion1: 0xff001c,
        colorInvertion2: 0x541bf9,
        color1: 0x6bdb00,
        color2: 0xbbf7,
        tintColorFrom: 0xff00,
        tintColorTo: 0x111fff
        
    };
    this.uniforms = {
        uTime: { value: 0 },
        uScale: { value: 70. },
        uSpeed: { value: 1.} ,
        uTintSpeed: { value: .3} ,
        uStepThreshold: { value: { x: 0.3, y: 0.3 } },
    };
    this.params = {
      roughness: 0.1,
      metalness: 0.1,
    };
    this.material = null;
  }

  getMaterial() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xfff,
      roughness: this.params.roughness,
      metalness: this.params.metalness,
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
        .replace(/#include <common>/, "#include <common> " + fragmentDeclarations )
        .replace(/vec4 diffuseColor.*;/, fragmentChunk)
        .replace(
            /#include <metalnessmap_fragment>/,
            `
                  #include <metalnessmap_fragment>
                  //metalnessFactor = vec4( mask * mix(vec3(0.0), vec3(1.), m_dist) , 1.0).r; 
                  metalnessFactor = vec4( inversion * mix(vec3(1.0), vec3(0.), m_dist) , 1.0).r; 
                  roughnessFactor = vec4( mask * mix(vec3(0.0), vec3(1.), m_dist) , 1.0).r; 
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
    .min(1)
    .max(100)
    .step(1)
    .name("uScale");
  
  folder
    .add(this.material.userData.uSpeed, "value")
    .min(0)
    .max(3)
    .step(0.1)
    .name("uSpeed");

    folder
    .add(this.material.userData.uTintSpeed, "value")
    .min(0)
    .max(2.)
    .step(0.1)
    .name("uTintSpeed");


    folder
    .add(this.material.userData.uStepThreshold.value, "x")
    .min(1)
    .max(10)
    .step(0.5)
    .name("uStepThreshold Inversion");
  
  folder
    .add(this.material.userData.uStepThreshold.value, "y")
    .min(0)
    .max(0.1)
    .step(0.001)
    .name("uStepThreshold");
  }

  
  
}
