import * as THREE from "three";
import fragmentDeclarations from "../shaders/voronoiNoise/fragmentDeclarations.glsl";
import fragmentChunk from "../shaders/voronoiNoise/fragmentChunk.glsl";
import {ModifiedMaterial} from "./modifiedMaterial.js";


export class VoronoiNoiseMaterial extends ModifiedMaterial {
  constructor() {
    super();
    this.colors = {
      color1 : 0xf40d1a,//0xaf0006, 
      color2 : 0xff00, //0x9900, //0x4ac6bb
      color3 : 0xc100f2,//0x975, //0xf1235
      color4 : 0x420a0a 
        
    };
    this.uniforms = {
        uTime: { value: 0 },
        uScale: { value: 20 },
        uSpeed: { value: 1. },
        uOffset: { value: 0.1 },  
        
    };
    this.params = {
      roughness: 0.1,
      //metalness: 1.
    };
    this.material = null;
  }

  getMaterial() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xfff,
      roughness: this.params.roughness,
      //metalness: this.params.metalness,
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
                metalnessFactor = vec4(mix(vec3(1.), vec3(0.0), facets) , 1.0).r;  //length(F)
                roughnessFactor = vec4( mix(vec3(0.), vec3(1.0), facets) , 1.0).r; 
                `
        );
      shader.uniforms = { ...shader.uniforms, ...material.userData };
    };

    this.material = material;
    return material;
  }

  addGui(folder) {
    this.addColorGui(folder);


    // folder
    // .add(this.material, "metalness")
    // .min(0)
    // .max(1)
    // .step(0.01)
    // .name("metalness");


    folder
    .add(this.material, "roughness")
    .min(0)
    .max(1)
    .step(0.01)
    .name("roughness");
  
  
  folder
    .add(this.material.userData.uScale, "value")
    .min(10)
    .max(50)
    .step(1.)
    .name("uScale");
  
  folder
    .add(this.material.userData.uSpeed, "value")
    .min(0)
    .max(2)
    .step(0.01)
    .name("uSpeed");

    folder
    .add(this.material.userData.uOffset, "value")
    .min(0)
    .max(2)
    .step(0.1)
    .name("uOffset");
  
  }
}
