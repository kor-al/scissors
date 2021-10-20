import * as THREE from "three";
import fragmentVariables from "../shaders/noise/fragmentVariables.glsl";
import perlinNoiseFunctions from "../shaders/perlinNoise2d.glsl";
import fragmentChunk from "../shaders/noise/fragmentChunk.glsl";
import {ModifiedMaterial} from "./modifiedMaterial.js";

console.log('modifies', ModifiedMaterial)

export class MagmaMaterial extends ModifiedMaterial {
  constructor() {
    super();
    this.colors = {
      color1: "#3500ce",
      color2: "#3c09b2",
      backgroundColor: "#1e0149",
    };
    this.uniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 2.0 },
      uFreq: { value: { x: 40.0 , y: 40.0}},
      uAmplitude: { value: { x: 5.0 , y: 20.0}},
      uOffset: { value: 0 },
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

    // const colorUniforms = {
    //   uColor1: { value: new THREE.Color(this.colors.color1) },
    //   uColor2: { value: new THREE.Color(this.colors.color2) },
    //   uBackgroundColor: {
    //     value: new THREE.Color(this.colors.backgroundColor),
    //   },
    // };
    // material.userData = { ...this.uniforms, ...colorUniforms };
    material.userData = this.uniforms;

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          /#include <uv_pars_vertex>/,
          `
                uniform float uTime;
                uniform float uSpeed;
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
        .replace(
          /#include <begin_vertex>/,
          `
                    vec3 transformed = vec3( position );
                    vec3 distortion = sin(normal *20.0  + uTime * uSpeed )*0.01;
                    //transformed =  transformed + (transformedNormal * distortion);
                    //vNormal = transformedNormal * distortion;
                    `
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(/#include <common>/, "#include <common> " + fragmentVariables + perlinNoiseFunctions)
        .replace(/vec4 diffuseColor.*;/, fragmentChunk)
        .replace(
          /#include <metalnessmap_fragment>/,
          `
                #include <metalnessmap_fragment>
                metalnessFactor = vec4(mix(vec3(0.0), vec3(1.1), strength) , 1.0).r; 
                `
        );

      shader.uniforms = { ...shader.uniforms, ...material.userData };
    };
    this.material = material;
    return material;
  }

  addGui(folder) {
    folder
      .add(this.material.userData.uSpeed, "value")
      .min(0)
      .max(4)
      .step(0.001)
      .name("uSpeed");
    folder
      .add(this.material.userData.uOffset, "value")
      .min(0)
      .max(0.1)
      .step(0.0001)
      .name("uOffset");
   folder
      .add(this.material.userData.uAmplitude.value, "x")
      .min(0)
      .max(100.0)
      .step(1)
      .name("uAmplitude.x");
    folder
      .add(this.material.userData.uAmplitude.value, "y")
      .min(0)
      .max(100.0)
      .step(1)
      .name("uAmplitude.y");
    folder
      .add(this.material.userData.uFreq.value, "x")
      .min(1)
      .max(100.0)
      .step(1)
      .name("uFreq.x");
      folder
      .add(this.material.userData.uFreq.value, "y")
      .min(1)
      .max(100.0)
      .step(1)
      .name("uFreq.y");

      this.addColorGui(folder);
  }
}
