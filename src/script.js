import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import waterVertexShader from "./shaders/water/vertex.glsl";
//import waterFragmentShader from "./shaders/water/fragment.glsl";
import noiseVertexShader from "./shaders/noise/vertex.glsl";
import noiseFragmentShader from "./shaders/noise/fragment.glsl";
import { gsap } from "gsap";
import * as dat from "dat.gui";

/**
 * Loaders
 */
const loadingBarElement = document.querySelector(".loading-bar");

let sceneReady = false;
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    // Wait a little
    window.setTimeout(() => {
      // Animate overlay
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      });

      // Update loadingBarElement
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = "";
    }, 500);

    window.setTimeout(() => {
      sceneReady = true;
    }, 2000);
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    // Calculate the progress and update the loadingBarElement
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};
debugObject.background = 0x0;

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
overlay.name = 'overlay'
scene.add(overlay);

/**
 * Noise shader
 */
debugObject.borderColor = "#186691";
debugObject.backgroundColor = "#9bd8ff";

gui.addColor(debugObject, "borderColor").onChange(() => {
  noiseMaterial.uniforms.uBorderColor.value.set(debugObject.borderColor);
});
gui.addColor(debugObject, "backgroundColor").onChange(() => {
  noiseMaterial.uniforms.uBackgroundColor.value.set(
    debugObject.backgroundColor
  );
});

const noiseMaterial = new THREE.ShaderMaterial({
  vertexShader: noiseVertexShader,
  fragmentShader: noiseFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uBorderColor: { value: new THREE.Color(debugObject.borderColor) },
    uBackgroundColor: { value: new THREE.Color(debugObject.backgroundColor) },
    uSpeed: { value: 1.0 },
  },
  // side: THREE.DoubleSide
});

gui
  .add(noiseMaterial.uniforms.uSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSpeed");

// Geometry
//const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);

// Mesh
//const mesh = new THREE.Mesh(geometry, noiseMaterial);
//scene.add(mesh)

/**
 * Noise Material
 */
// Geometry
//const waterGeometry = new THREE.PlaneBufferGeometry(2, 2, 512, 512);

// Colors
// debugObject.depthColor = "#186691";
// debugObject.surfaceColor = "#9bd8ff";

// gui.addColor(debugObject, "depthColor").onChange(() => {
//   waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
// });
// gui.addColor(debugObject, "surfaceColor").onChange(() => {
//   waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
// });

// // Material
// const waterMaterial = new THREE.ShaderMaterial({
//   vertexShader: waterVertexShader,
//   fragmentShader: waterFragmentShader,
//   uniforms: {
//     uTime: { value: 0 },

//     uBigWavesElevation: { value: 0.2 },
//     uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
//     uBigWavesSpeed: { value: 0.75 },

//     uSmallWavesElevation: { value: 0.15 },
//     uSmallWavesFrequency: { value: 3 },
//     uSmallWavesSpeed: { value: 0.2 },
//     uSmallIterations: { value: 4 },

//     uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
//     uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
//     uColorOffset: { value: 0.08 },
//     uColorMultiplier: { value: 5 },
//   },
// });

// gui
//   .add(waterMaterial.uniforms.uBigWavesElevation, "value")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("uBigWavesElevation");
// gui
//   .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
//   .min(0)
//   .max(10)
//   .step(0.001)
//   .name("uBigWavesFrequencyX");
// gui
//   .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
//   .min(0)
//   .max(10)
//   .step(0.001)
//   .name("uBigWavesFrequencyY");
// gui
//   .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
//   .min(0)
//   .max(4)
//   .step(0.001)
//   .name("uBigWavesSpeed");

// gui
//   .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("uSmallWavesElevation");
// gui
//   .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
//   .min(0)
//   .max(30)
//   .step(0.001)
//   .name("uSmallWavesFrequency");
// gui
//   .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
//   .min(0)
//   .max(4)
//   .step(0.001)
//   .name("uSmallWavesSpeed");
// gui
//   .add(waterMaterial.uniforms.uSmallIterations, "value")
//   .min(0)
//   .max(5)
//   .step(1)
//   .name("uSmallIterations");

// gui
//   .add(waterMaterial.uniforms.uColorOffset, "value")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("uColorOffset");
// gui
//   .add(waterMaterial.uniforms.uColorMultiplier, "value")
//   .min(0)
//   .max(10)
//   .step(0.001)
//   .name("uColorMultiplier");

// // Mesh
// const water = new THREE.Mesh(waterGeometry, waterMaterial)
// water.rotation.x = - Math.PI * 0.5
// scene.add(water)

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "./textures/environmentMaps/milkyway/px.png",
  "./textures/environmentMaps/milkyway/nx.png",
  "./textures/environmentMaps/milkyway/py.png",
  "./textures/environmentMaps/milkyway/ny.png",
  "./textures/environmentMaps/milkyway/pz.png",
  "./textures/environmentMaps/milkyway/nz.png",
]);

environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

debugObject.envMapIntensity = 10;

/**
 * Metal Material
 */
const metalMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  clearcoat: 1.0,
  envMap: environmentMap,
  side: THREE.DoubleSide,
});

/**
 * Background
 */
scene.background = new THREE.Color(debugObject.background);
scene.fog = new THREE.Fog(debugObject.background, 0.2, 1);
gui.addColor(debugObject, "background").onChange(() => {
  //material.color.set(parameters.color)
  scene.background = new THREE.Color(debugObject.background);
  scene.fog = new THREE.Fog(debugObject.background, 0.2, 1);
});

const initMaterial = metalMaterial; //noiseMaterial;
const initMaterialMap = [
  { objectID: "thumbBlade", material: initMaterial },
  { objectID: "fingerBlade", material: initMaterial },
  { objectID: "screw", material: initMaterial },
];

function assignMaterial(parent, type, mlt) {
  parent.traverse((o) => {
    if (o.isMesh) {
      console.log(o.name, type);
      if (o.name.includes(type)) {
        //o.material = mlt;
        o.ojectID = type;
        o.material.envMap = environmentMap;
      }
    }
  });
}

/**
 * Models
 */

const models = []

const modelsParams = {
  center: { x: 0, z: 0 },
  radius: 0.3,
  files: ["./models/tailorShears.glb", "./models/hairShears.glb", "./models/paperScissors.glb"],
  names: ["tailorShears", "hairShears", "paperScissors"],
  //cameraPosition: { x: 0.5, y: 0.2, z: 0 },//{ x: 0.6, y: -0.1, z: 0 },
  positions: {},
  cameraPositions: {}
};

function findPositionsOnCircle(center, nPoints, radius) {
  const angle = (2 * Math.PI) / nPoints;
  const positions = [...Array(nPoints).keys()].map((ind) => {
    let position = {};
    position.x = center.x + radius * Math.cos(ind * angle);
    position.z = center.z + radius * Math.sin(ind * angle);
    return position;
  });
  return positions;
}

const positionsOnCircle = findPositionsOnCircle(
  modelsParams.center,
  modelsParams.files.length,
  modelsParams.radius
);

const positionsOnCircleCamera = findPositionsOnCircle(
    modelsParams.center,
    modelsParams.files.length,
    modelsParams.radius + 0.25
  );

console.log(positionsOnCircleCamera);
const group = new THREE.Group();

for (let i = 0; i < modelsParams.files.length; i++) {
    const file = modelsParams.files[i]
  gltfLoader.load(file, (gltf) => {
    const model = gltf.scene.children[0]; //screw as group
    model.userData.groupName = modelsParams.names[i]
    model.position.set(positionsOnCircle[i].x, 0, positionsOnCircle[i].z);
    model.scale.set(2.5, 2.5, 2.5);
    //model.rotation.z = (-Math.PI / 4) * (i + 1);
    //model.rotation.x = -Math.PI / 2;
    if(i == 2) model.rotation.y = 2*Math.PI/3;
    if(i == 1) model.rotation.y = Math.PI/3;

    console.log(model);
    for (let obj of initMaterialMap) {
      //assignMaterial(model, obj.objectID, obj.material);
    }

    group.add(model);
    models.push(model);
    modelsParams.positions[model.userData.groupName ] = model.position
    modelsParams.cameraPositions[model.userData.groupName ] = new THREE.Vector3(positionsOnCircleCamera[i].x, 0.2, positionsOnCircleCamera[i].z)

    updateAllMaterials();
  });
}
//group.rotation.z = -Math.PI / 8;
scene.add(group);


/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster();
let currentIntersect = null

//points do not include position transformation
const points = [
  {
    model: 'tailorScissors',
    position: new THREE.Vector3(0,0,0),
    element: document.querySelector(".point-0"),
  },
  {
    position: new THREE.Vector3(0.5, 0.8, -1.6),
    element: document.querySelector(".point-1"),
  },
  {
    position: new THREE.Vector3(1.6, -1.3, -0.7),
    element: document.querySelector(".point-2"),
  },
];

/**
 * Mouse
 */
 const mouse = new THREE.Vector2()

 window.addEventListener('mousemove', (event) =>
 {
     mouse.x = event.clientX / sizes.width * 2 - 1
     mouse.y = - (event.clientY / sizes.height) * 2 + 1
 })
 
 window.addEventListener('click', () =>
 {
     // Cast a ray from the mouse and handle events
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(models, true)
    console.log(intersects)
    let group = intersects.length ? intersects[0].object.parent.userData.groupName || intersects[0].object.userData.groupName : null;
    if (group) {
        console.log(group, intersects[0]);
        const targetPosition = new THREE.Vector3(modelsParams.cameraPositions[group].x , modelsParams.cameraPositions[group].y, modelsParams.cameraPositions[group].z)
        const targetPoint = new THREE.Vector3(modelsParams.positions[group].x , modelsParams.positions[group].y, modelsParams.positions[group].z)
        gsap.to({}, {
            duration: 2,
            onUpdate: function() {
                camera.position.lerp(targetPosition, this.progress());
                controls.target.lerp(targetPoint, this.progress());

            },
            onComplete: ()=> {
                controls.target.set(modelsParams.positions[group].x , modelsParams.positions[group].y, modelsParams.positions[group].z)
            }
        });
    }
    // 
    // camera.position.set(modelsParams.cameraPositions[group].x , modelsParams.cameraPositions[group].y, modelsParams.cameraPositions[group].z)
    // controls.update();


    /**
 *  GSAP
 */



    //for (const intersect of intersects){
    //    group = intersect.object.parent.userData.groupName || intersect.object.userData.groupName
    //    console.log(intersect.distance, intersect.point)
    //}
 })

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(-2, 1, -0.2);
scene.add(directionalLight);
gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightZ");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001,
  100
);
//camera.position.set(0.1, 0.2, 0.1);
camera.position.set(
  positionsOnCircleCamera[0].x,
  0.2,
  positionsOnCircleCamera[0].z,
);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.rotateSpeed = 0.5;
controls.target.set(positionsOnCircle[0].x, 0, positionsOnCircle[0].z);
//controls.autoRotate = true;
//controls.autoRotateSpeed = 0.2;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Colors
 */
const color = [
  {
    color: "66557c",
  },
  {
    color: "153944",
  },
];
const tray = document.getElementById("js-tray-slide");

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  const delta = clock.getDelta();
  // Update controls
  controls.update();
  // console.log(camera.position)

  // Update points only when the scene is ready
  if (sceneReady) {



    // Go through each point
    //   for(const point of points)
    //   {
    //       // Get 2D screen position
    //       const screenPosition = point.position.clone()
    //       screenPosition.project(camera)
    //       // Set the raycaster
    //       raycaster.setFromCamera(screenPosition, camera)
    //       const intersects = raycaster.intersectObjects(scene.children, true)
    //       // No intersect found
    //       if(intersects.length === 0)
    //       {
    //           // Show
    //           point.element.classList.add('visible')
    //       }
    //       // Intersect found
    //       else
    //       {
    //           // Get the distance of the intersection and the distance of the point
    //           const intersectionDistance = intersects[0].distance
    //           const pointDistance = point.position.distanceTo(camera.position)
    //           // Intersection is close than the point
    //           if(intersectionDistance < pointDistance)
    //           {
    //               // Hide
    //               point.element.classList.remove('visible')
    //           }
    //           // Intersection is further than the point
    //           else
    //           {
    //               // Show
    //               point.element.classList.add('visible')
    //           }
    //       }
    //       const translateX = screenPosition.x * sizes.width * 0.5
    //       const translateY = - screenPosition.y * sizes.height * 0.5
    //       point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    //   }
  }

  const elapsedTime = clock.getElapsedTime();
  const radiansPerSecond = 0.5;


  //waterMaterial.uniforms.uTime.value = elapsedTime;
  noiseMaterial.uniforms.uTime.value = elapsedTime;

  //Rotate
  for (let model of group.children) {
    //console.log(model)
    model.rotation.z += radiansPerSecond * delta;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
