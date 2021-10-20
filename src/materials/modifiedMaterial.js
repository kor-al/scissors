import * as THREE from "three";

export class ModifiedMaterial {
    constructor() {
      this.colors = {};
      this.uniforms = {
        uTime: { value: 0 },
        uSpeed: { value: 1.0} 
      };
      this.params = {
        roughness: 0.,
      };
      this.material = null;
    }
  
    setColorUniforms(){
        for(const color in this.colors){
            const uName =  'u' + color.charAt(0).toUpperCase() + color.slice(1);
            this.uniforms[uName] = { value: new THREE.Color(this.colors[color] )}
        }
    }
  
    getMaterial() {
      const material = new THREE.MeshStandardMaterial({
        color: 0xfff,
        roughness: this.params.roughness,
      });
      this.setColorUniforms();
      material.userData = this.uniforms;
      return this.material
    
    }

    addColorGui(folder){
        for(const color in this.colors){
            const uName = 'u' + color.charAt(0).toUpperCase() + color.slice(1);
            folder.addColor(this.colors, color).onChange(() => {
                this.material.userData[uName].value.set(this.colors[color]);
              });
        }

    }

    addGui(folder) {
      folder
        .add(this.material.userData.uSpeed, "value")
        .min(0)
        .max(4)
        .step(0.001)
        .name("uSpeed");
    }
    
  }
  