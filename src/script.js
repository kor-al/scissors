import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import waterVertexShader from "./shaders/water/vertex.glsl";
//import waterFragmentShader from "./shaders/water/fragment.glsl";
import particleVertexShader from "./shaders/particles/vertex.glsl";
import particleFragmentShader from "./shaders/particles/fragment.glsl";
import { MagmaMaterial } from "./materials/magma.js";
import { FbmMaterial } from "./materials/fbm.js";
import { MetaballsMaterial } from "./materials/metaballs.js";
import { VoronoiMaterial } from "./materials/voronoi.js";
import { VoronoiNoiseMaterial } from "./materials/voronoiNoise.js";
import { gsap, Power3 } from "gsap";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";
import { loading, initLoading } from "./loading";
// import { WebGLMultisampleRenderTarget } from "three";

/**
 * Stats
 */
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

/**
 * Loaders
 */

const loadingBarElement = document.querySelector(".loading-bar");
const loadingBarText = loadingBarElement.querySelector(".loading-bar__text");
let slider = undefined;

let sceneReady = false;
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    loadingBarElement.classList.add("ended");
    // Wait a little
    window.setTimeout(() => {
      // Animate overlay
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      });

      // Update loadingBarElement
      slider.remove();
      // loadingBarElement.style.transform = "";
    }, 500);

    window.setTimeout(() => {
      sceneReady = true;
      welcomeElement.classList.remove("hidden");
      loadingBarElement.classList.add("hidden");
    }, 1000);
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    // Calculate the progress and update the loadingBarElement
    const progressRatio = itemsLoaded / itemsTotal;
    // loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    console.log(itemsLoaded, itemsTotal);
    loading(slider, progressRatio);
    loadingBarText.innerHTML = `${Math.round(progressRatio * 100)}%`;
  }
);

loadingManager.onStart = () => {
  console.log("Started loading files ");
  slider = initLoading();
};

const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const textureLoader = new THREE.TextureLoader();

/**
 * Managing Experience
 */

function startExperience() {
  state.started = true;
  welcomeElement.classList.add("hidden");
  // pointsElement.classList.remove("hidden");

  gsap.to(controls.target, {
    duration: 4,
    y: 0,
    delay: 0,
    onComplete: () => {
      controls.enabled = true;
      welcomeElement.style.display = "none";
      navigationElement.style.display = "block";
      helperElement.style.display = "block";
      if (helperElement.classList.contains("hidden"))
        helperElement.classList.remove("hidden");
    },
  });
}

const endWordsList = {
  tailorShears: "spleen",
  hairShears: "liver",
  paperScissors: "pancreas",
};

function completeExperience() {
  if (choiceControlsElement.classList.contains("visible"))
    choiceControlsElement.classList.remove("visible");
  if (state.choicePanel) state.choicePanel.classList.remove("visible");
  theEndElement.style.display = "block";
  if (state.finallySelectedModel) {
    endWordElement.innerHTML = `${endWordsList[state.finallySelectedModel]}`;
  }
  window.setTimeout(() => {
    theEndElement.classList.add("visible");
  }, 1000);
  gsap.to(overlayMaterial.uniforms.uAlpha, {
    duration: 1,
    value: 1,
    delay: 0.5,
    onComplete: () => {
      choiceNavElement.style.display = "none";
    },
  });
}

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

  //Update models
  if (sizes.height > sizes.width) {
    //mobile
    for (const modelName in models) {
      const model = models[modelName];
      model.rotation.x = -Math.PI / 2;
      model.rotation.y = Math.PI / 12;
    }
  } else {
    for (let i = 0; i < modelsParams.names.length; i++) {
      const model = models[modelsParams.names[i]];
      model.rotation.x = 0;
      model.rotation.y = (i * Math.PI) / 3;
    }
  }

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Debug
 */
const gui = new dat.GUI();
gui.close();
const perlinFolder = gui.addFolder("PerlinMaterial");
const liquidFolder = gui.addFolder("LiquidMaterial");
const metaballsFolder = gui.addFolder("MetaballsMaterial");
const voronoiFolder = gui.addFolder("VoronoiMaterial");
const particlesFolder = gui.addFolder("Particles");

let debugObject = {};
debugObject.background = 0x19090d;

/**
 * State
 */

const state = {
  started: false, //if experience has started
  selectedModel: null, //(name) current model in focus
  rotationStopped: false, //regarding an indicidual rotation
  rotateSphere: true,
  // after the choice is made
  finallySelectedModel: null, //(name) of the model that is selected via button
  centralMaterial: "perlin", // material of the central object
  rotateGroup: false, //rotate models around the center
  rotateCentralModel: false, //rotate the central model
};

/**
 * HTML Elements
 */

const canvas = document.querySelector("canvas.webgl");
const pointsElement = document.querySelector(".points");
const welcomeElement = document.querySelector(".welcome");
const theEndElement = document.querySelector(".the-end");
const endWordElement = document.querySelector("#the-end-word");
const navigationElement = document.querySelector(".nav--interaction");
const helperElement = document.querySelector(".nav--helper");
//when all three models are available to inspect
const advertisementNavElement = navigationElement.querySelector(
  ".nav--advertisement"
);
const controlsElement = navigationElement.querySelector(
  ".controls--advertisement"
);
//when one model is chosen as a final one
const choiceNavElement = navigationElement.querySelector(".nav--choice");
const choiceControlsElement =
  navigationElement.querySelector(".controls--choice");

/**
 * Scene
 */

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
overlay.name = "overlay";
scene.add(overlay);

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
 * Textures
 */
//  const gradientTexture = textureLoader.load('./textures/gradients/5.jpg')
//  const toonMaterial = new THREE.MeshToonMaterial()
// gradientTexture.generateMipmaps = false
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// toonMaterial.gradientMap = gradientTexture
// toonMaterial.color = new THREE.Color('#ff0000')

//const particleTexture1 = textureLoader.load('/textures/particles/5.png')
//const particleTexture2 = textureLoader.load('/textures/particles/texture0.png')

/**
 * Environment map
 */
const environmentMapFolderPath = "./textures/environmentMaps/museum/";
const pathExt = ".png";
const environmentMap = cubeTextureLoader.load([
  environmentMapFolderPath + "px" + pathExt,
  environmentMapFolderPath + "nx" + pathExt,
  environmentMapFolderPath + "py" + pathExt,
  environmentMapFolderPath + "ny" + pathExt,
  environmentMapFolderPath + "pz" + pathExt,
  environmentMapFolderPath + "nz" + pathExt,
]);

environmentMap.encoding = THREE.sRGBEncoding;

debugObject.envMapIntensity = 5;
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// gui
//   .add(environmentMap, "envMapIntensity")
//   .min(1)
//   .max(20)
//   .step(1)
//   .name("envMapIntensity");

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Materials
 */
const perlinMaterialGen = new MagmaMaterial();
const perlinMaterial = perlinMaterialGen.getMaterial();
perlinMaterialGen.addGui(perlinFolder);

const liquidMaterialGen = new FbmMaterial();
var liquidMaterial = liquidMaterialGen.getMaterial();
liquidMaterialGen.addGui(liquidFolder);

const voronoiMaterialGen = new VoronoiNoiseMaterial();
var voronoiMaterial = voronoiMaterialGen.getMaterial();
voronoiMaterialGen.addGui(voronoiFolder);

const metaballsMaterialGen = new MetaballsMaterial();
var metaballsMaterial = metaballsMaterialGen.getMaterial();
metaballsMaterialGen.addGui(metaballsFolder);

// const steelMagmaMaterial = new MagmaMaterial();
// steelMagmaMaterial.uniforms.uAmplitude.value.y = 4;
// steelMagmaMaterial.uniforms.uFreq.value.y = 20;

function assignMaterial(parent, mlt, type = null) {
  parent.traverse((o) => {
    if (o.isMesh) {
      console.log(o.name, type);
      if (type === null || (type != null && o.name.includes(type))) {
        o.material = mlt;
        o.ojectID = type;
        //o.material.envMap = environmentMap;
      }
    }
  });
}

function assignMaterialToCenterModel(materialName) {
  const material = materialNameToMaterial[materialName];
  assignMaterial(centerModel, material);
}

gui
  .add(state, "centralMaterial", {
    "Perlin Noise": "perlin",
    "Voronoi Noise": "voronoi",
    "FBM Liquid": "liquid",
    "Voronoi Metaballs": "metaballs",
  })
  .onFinishChange((name) => {
    assignMaterialToCenterModel(name);
  });

/**
 * Sphere
 */
const sphereRadius = 0.1;
const sphereGeometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 32);
//const torusGeometry = new THREE.TorusBufferGeometry( sphereRadius, sphereRadius/3., 16, 100 );

const sphere = new THREE.Mesh(sphereGeometry, perlinMaterial);
sphere.castShadow = false;
sphere.receiveShadow = false;
sphere.position.y = 0;
scene.add(sphere);

/**
 * Background
 */
scene.background = new THREE.Color(debugObject.background);
scene.fog = new THREE.Fog(debugObject.background, 0.5, 2);
gui.addColor(debugObject, "background").onChange(() => {
  scene.background = new THREE.Color(debugObject.background);
  scene.fog = new THREE.Fog(debugObject.background, 0.3, 2);
});

/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster();
let currentIntersect = null;

//points do not include position transformation
const points = [
  {
    model: "tailorShears",
    position: new THREE.Vector3(0.01, 0.01, 0.001),
    element: pointsElement.querySelector(".tailorShears.point-0"),
    name: "screw",
  },
  {
    model: "tailorShears",
    position: new THREE.Vector3(0.12, 0.01, 0.1),
    element: pointsElement.querySelector(".tailorShears.point-1"),
    name: "thumbBow",
  },
  {
    model: "tailorShears",
    position: new THREE.Vector3(-0.04, 0.002, 0.14),
    element: pointsElement.querySelector(".tailorShears.point-3"),
    name: "silencer",
  },
  {
    model: "hairShears",
    position: new THREE.Vector3(-0.001, 0.01, 0.2),
    element: pointsElement.querySelector(".hairShears.point-0"),
    name: "finger rest",
  },
  {
    model: "hairShears",
    position: new THREE.Vector3(-0.005, 0.01, 0.13),
    element: pointsElement.querySelector(".hairShears.point-1"),
    name: "silencer",
  },
  {
    model: "hairShears",
    position: new THREE.Vector3(-0.01, 0.01, 0),
    element: pointsElement.querySelector(".hairShears.point-3"),
    name: "screw",
  },
  {
    model: "paperScissors",
    position: new THREE.Vector3(-0.001, 0.01, 0.1),
    element: pointsElement.querySelector(".paperScissors.point-0"),
    name: "handle",
  },
  {
    model: "paperScissors",
    position: new THREE.Vector3(-0.005, 0.01, -0.05),
    element: pointsElement.querySelector(".paperScissors.point-1"),
    name: "blade",
  },
  {
    model: "paperScissors",
    position: new THREE.Vector3(0, 0.01, -0.13),
    element: pointsElement.querySelector(".paperScissors.point-3"),
    name: "point",
  },
];

/**
 * Models
 */

const models = {};
let centerModel = sphere;

const materialNameToMaterial = {
  perlin: perlinMaterial,
  liquid: liquidMaterial,
  voronoi: voronoiMaterial,
  metaballs: metaballsMaterial,
};

const modelToMaterial = {
  tailorShears: liquidMaterial,
  hairShears: voronoiMaterial,
  paperScissors: metaballsMaterial,
  sphere: perlinMaterial,
};

const modelsParams = {
  //to position models around the center
  center: { x: 0, z: 0 },
  radius: 0.3,
  //to load models
  files: [
    "./models/tailorShears.glb",
    "./models/hairShears.glb",
    "./models/paperScissors.glb",
  ],
  //names of the models
  names: ["tailorShears", "hairShears", "paperScissors"],
  //to rotate in the inpect mode
  fixedRotationZ: {}, //starting Z rotations for the models (for the "inspect" mode)
  //to position camera
  cameraPositions: {}, //camera position for each model
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

const group = new THREE.Group();

for (let i = 0; i < modelsParams.files.length; i++) {
  const file = modelsParams.files[i];
  gltfLoader.load(file, (gltf) => {
    const model = gltf.scene.children[0]; //screw as group
    model.userData.groupName = modelsParams.names[i];
    model.position.set(positionsOnCircle[i].x, 0, positionsOnCircle[i].z);
    console.log(model.userData.groupName, "pivot", model.position);
    model.scale.set(2.5, 2.5, 2.5);

    if (sizes.height > sizes.width) {
      model.rotation.x = -Math.PI / 2;
      model.rotation.z = -Math.PI / 2;
      //model.rotation.y = Math.PI / 12;
    } else {
      model.rotation.y = (i * Math.PI) / 3;
    }

    group.add(model);
    models[model.userData.groupName] = model;
    modelsParams.fixedRotationZ[model.userData.groupName] = model.rotation.z;
    modelsParams.cameraPositions[model.userData.groupName] = new THREE.Vector3(
      positionsOnCircleCamera[i].x,
      0.2,
      positionsOnCircleCamera[i].z
    );

    updateAllMaterials();
  });
}
//group.rotation.z = -Math.PI / 8;
scene.add(group);

/**
 * Panels
 */
const panels = {};
for (const modelName of modelsParams.names) {
  panels[modelName] = advertisementNavElement.querySelector("." + modelName);
}

//switch navigation blocks from Advertisement to Choice
function toggleNavigationElement() {
  advertisementNavElement.style.display = "none";
  choiceNavElement.style.display = "block";
  state.choicePanel = choiceNavElement.querySelector(
    "." + state.finallySelectedModel
  );

  if (choiceControlsElement.classList.contains("visible")) {
    controlsElement.classList.remove("visible");
  }
  if (!choiceControlsElement.classList.contains("visible")) {
    setTimeout(() => {
      state.choicePanel.classList.add("visible");
      choiceControlsElement.classList.add("visible");
    }, 1000);
  }
}

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("touchend", (event) => {
  mouse.x = +(event.changedTouches[0].clientX / sizes.width) * 2 + -1;
  mouse.y = -(event.changedTouches[0].clientY / sizes.height) * 2 + 1;
});

function animateCamera(targetPosition, targetPoint) {
  gsap.to(
    {},
    {
      duration: 2,
      onUpdate: function () {
        camera.position.lerp(targetPosition, this.progress());
        controls.update();
        controls.target.lerp(targetPoint, this.progress());
      },
      onComplete: () => {
        console.log("finished");
      },
      ease: "ease-in-out",
    }
  );
}

function hideHelper() {
  if (!helperElement.classList.contains("hidden")) {
    helperElement.classList.add("hidden");
    setTimeout(() => {
      helperElement.style.display = "none";
    }, 300);
  }
}

//click event
function handleClick(e) {
  // Cast a ray from the mouse and handle events
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(models), true);
  let group = intersects.length
    ? intersects[0].object.parent.userData.groupName ||
      intersects[0].object.userData.groupName
    : null;
  if (group && group != state.selectedModel && !state.finallySelectedModel) {
    hideHelper()
    if (state.selectedModel)
      panels[state.selectedModel].classList.remove("visible");
    if (controlsElement.classList.contains("visible")) {
      controlsElement.classList.remove("visible");
    }

    if (!controlsElement.classList.contains("visible")) {
      setTimeout(() => {
        controlsElement.classList.add("visible");
      }, 1000);
    }
    state.selectedModel = group;
    panels[state.selectedModel].classList.add("visible");
    const targetPosition = modelsParams.cameraPositions[group];
    const targetPoint = models[group].position;
    animateCamera(targetPosition, targetPoint);
    if (state.inspectMode)
      controlsElement.querySelector(".button--inspect").click();
  }
}
window.addEventListener("touchend", handleClick);
window.addEventListener("click", handleClick);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 5;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(1, 2, 1);
scene.add(directionalLight);

gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.1)
  .name("lightIntensity");

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.001, //near
  2 //far
);

if (sizes.height > sizes.width && sizes.width < 500) {
  //mobile view
  camera.position.set(0.6, 0.7, 0.5); //above
} else {
  camera.position.set(0, 0.5, 0.5); //above
}

function setCameraTopViewPosition() {
  let targetPosition = new THREE.Vector3(0, 0.5, 0.5);
  if (sizes.height > sizes.width && sizes.width < 500) {
    targetPosition = new THREE.Vector3(0.6, 0.7, 0.5);
  }
  const targetPoint = new THREE.Vector3(0, 0, 0);
  animateCamera(targetPosition, targetPoint);
}

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0); //then animate to look down
controls.enableDamping = true;
//  zoom
controls.enableZoom = true;
controls.maxDistance = 1;
//  rotation
controls.enableRotate = true;
//  pan
controls.enablePan = true;
// controls.rotateSpeed = 0.5;
controls.saveState();
//controls.autoRotate = true;
//controls.autoRotateSpeed = 0.2;
controls.enabled = false;
// controls.target.set(0, 0, 0);//lookdown

scene.add(camera);

function getRotationAxisAndAngle(from, to) {
  const distance = new THREE.Vector3(from.x, from.y, from.z).sub(to);

  if (distance.length() < 0.01) {
    //exit - don't do any rotation
    //distance is too small for rotation to be numerically stable
    console.log("no rotation");
  }

  //Don't actually need to call normalize for directionA - just doing it to indicate
  //that this vector must be normalized.
  const directionA = new Vector3(0, 1, 0).normalize();
  const directionB = distance.clone().normalize();

  const rotationAngle = Math.acos(directionA.dot(directionB));

  if (Math.abs(rotationAngle) < 0.01) {
    //exit - don't do any rotation
    //angle is too small for rotation to be numerically stable
    console.log("no rotation");
  }

  const rotationAxis = directionA.clone().cross(directionB).normalize();

  //rotate object about rotationAxis by rotationAngle

  return { axis: rotationAxis, angle: rotationAngle };
}

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

function hidePoints() {
  for (const point of points) {
    //skip points that are irrelevant for the selected model
    if (point.element.classList.contains("visible"))
      point.element.classList.remove("visible");
  }
}

function toggleRotation() {
  models[state.selectedModel].rotation.z =
    modelsParams.fixedRotationZ[state.selectedModel];
  state.rotationStopped = !state.rotationStopped;
}

function toggleInspectMode() {
  if (state.inspectMode) {
    state.inspectMode = false;
    this.innerHTML = "Inspect";
    hidePoints();
    // if (!navigationElement.classList.contains("visible")) {
    //     navigationElement.classList.add("visible");
    //   }
  } else {
    state.inspectMode = true;
    this.innerHTML = "Go back";
    // if (navigationElement.classList.contains("visible")) {
    //     navigationElement.classList.remove("visible");
    //   }
  }
  toggleRotation();
}

function enableTopView() {
  setCameraTopViewPosition();
  if (controlsElement.classList.contains("visible")) {
    controlsElement.classList.remove("visible");
  }
  if (state.selectedModel)
    panels[state.selectedModel].classList.remove("visible");

  state.selectedModel = null;
  state.rotationStopped = false;
  controlsElement.querySelector(".button--inspect").innerHTML = "Inspect";
  state.inspectMode = false;
  hidePoints();
}

function chooseModel(e) {
  state.finallySelectedModel = state.selectedModel;
  //controls.autoRotate = true;
  state.rotateGroup = true; //to have lights stable
  enableTopView(e);
  window.setTimeout(() => {
    state.rotateSphere = false;
    state.simulatePhysics = true;
    toggleNavigationElement(); //turn off previous navigation and turn on new one
  }, 500);

  for (const modelName in models) {
    const model = models[modelName];
    if (modelName == state.finallySelectedModel) {
      centerModel = model.clone();
      assignMaterial(centerModel, modelToMaterial[state.finallySelectedModel]);
      centerModel.position.set(0, 2, 0);
      centerModel.rotation.set(0, 0, 0);
      centerModel.rotation.x = -Math.PI / 2;
      centerModel.scale.set(5, 5, 5);
      scene.add(centerModel);
    }

    gsap.to(model.scale, {
      duration: 5,
      x: 1,
      y: 1,
      z: 1,
      onUpdate: function () {
        //do nothing for now
      },
      ease: "ease-in-out",
    });
  }

  gsap.to(centerModel.position, {
    delay: 1,
    duration: 5,
    x: 0,
    y: 0,
    z: 0,
    onUpdate: function () {
      //do nothing for now
      state.rotateCentralModel = true;
    },
    ease: "ease-in-out",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  controlsElement
    .querySelector(".button--inspect")
    .addEventListener("click", toggleInspectMode);

  controlsElement
    .querySelector(".button--look-around")
    .addEventListener("click", enableTopView);

  controlsElement
    .querySelector(".button--choose")
    .addEventListener("click", chooseModel);

  choiceControlsElement
    .querySelector(".button--blink")
    .addEventListener("click", completeExperience);

  document
    .querySelector(".button--start")
    .addEventListener("click", startExperience);
});

/**
 * Particles
 */
const parameters = {};
parameters.count = 200;
parameters.size = 10;
parameters.radiusOutside = 0.5;
parameters.radiusInside = 0.3;
parameters.minRadius = 0.04;
parameters.center = { x: 0.1, y: 0, z: 0 };
parameters.insideColor = "#ffffff";
parameters.outsideColor = "#190ac1";

const particleSystem = {
  geometry: null,
  material: null,
  particles: null,
  particleTexture: null,
};

function approximateGaussianRand(a, b) {
  var rand = 0;
  var n = 5;

  for (var i = 0; i < n; i += 1) {
    rand += Math.random();
  }
  rand = rand / n;
  return rand * (b - a) + a;
}

const generateParticles = (particleSystem) => {
  if (particleSystem.particles !== null) {
    particleSystem.geometry.dispose();
    particleSystem.material.dispose();
    scene.remove(particleSystem.particles);
  }

  /**
   * Geometry
   */
  particleSystem.geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const scales = new Float32Array(parameters.count * 1);
  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const angle = i;
    const radius =
      Math.random() * (parameters.radiusOutside - parameters.radiusInside) +
      parameters.radiusInside;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = approximateGaussianRand(0, 0.2);
    positions[i3 + 2] = Math.sin(angle) * radius;

    // Scale
    scales[i] = Math.random();

    // Color
    const mixedColor = insideColor.clone();
    mixedColor.lerp(
      outsideColor,
      (radius - parameters.radiusInside) /
        (parameters.radiusOutside - parameters.radiusInside)
    );

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  particleSystem.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleSystem.geometry.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scales, 1)
  );
  particleSystem.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );

  /**
   * Material
   */
  particleSystem.material = new THREE.ShaderMaterial({
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: parameters.size * renderer.getPixelRatio() },
      uCenter: { value: parameters.center },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
  });

  if (particleSystem.particleTexture) {
    particleSystem.material.uniforms.alphaMap = {
      type: "t",
      value: particleSystem.particleTexture,
    };
  }

  /**
   * Points
   */
  particleSystem.particles = new THREE.Points(
    particleSystem.geometry,
    particleSystem.material
  );
  scene.add(particleSystem.particles);
};

particlesFolder
  .add(parameters, "count")
  .min(10)
  .max(1000)
  .step(50)
  .onFinishChange(() => generateParticles(particleSystem));
particlesFolder
  .add(parameters, "size")
  .min(10)
  .max(100)
  .step(10)
  .onFinishChange(() => generateParticles(particleSystem));
particlesFolder
  .add(parameters, "radiusInside")
  .min(0)
  .max(0.4)
  .step(0.01)
  .onFinishChange(() => generateParticles(particleSystem));
particlesFolder
  .add(parameters, "radiusOutside")
  .min(0.2)
  .max(0.8)
  .step(0.01)
  .onFinishChange(() => generateParticles(particleSystem));
particlesFolder
  .addColor(parameters, "insideColor")
  .onFinishChange(() => generateParticles(particleSystem));
particlesFolder
  .addColor(parameters, "outsideColor")
  .onFinishChange(() => generateParticles(particleSystem));

/**
 * Generate particles
 */
generateParticles(particleSystem);

/**
 * Physics
 */
const objectsToUpdate = [];
state.simulatePhysics = false;

const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Default material
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.1,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.position.y = -0.5;

var quatX = new CANNON.Quaternion();
var quatY = new CANNON.Quaternion();
quatX.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.51);
quatY.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.2);
var quat = quatY.mult(quatX);
quat.normalize();
floorBody.quaternion.copy(quat);
world.addBody(floorBody);

// Cannon.js body
const shape = new CANNON.Sphere(sphereRadius);

const body = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 0, 0),
  shape: shape,
  material: defaultMaterial,
});
body.position.copy(sphere.position);
world.addBody(body);

// Save in objects
objectsToUpdate.push({ mesh: sphere, body: body });

/**
 * Animate
 */
const clock = new THREE.Clock();
const radiansPerSecond = 0.5;

const tick = () => {
  stats.begin();

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  if (sceneReady) {
    if (state.inspectMode && state.rotationStopped) {
      //Go through each point
      for (const point of points) {
        //skip points that are irrelevant for the selected model
        if (state.selectedModel != point.model) {
          if (point.element.classList.contains("visible"))
            point.element.classList.remove("visible");
          continue;
        }

        //Rotate
        const newPosition = point.position.clone();
        const q = new THREE.Quaternion();
        q.setFromEuler(models[point.model].rotation);
        newPosition.applyQuaternion(q);
        newPosition.add(models[point.model].position);

        // Get 2D screen position
        const screenPosition = newPosition.clone();
        screenPosition.project(camera);
        // Set the raycaster
        raycaster.setFromCamera(screenPosition, camera);
        const intersects = raycaster.intersectObjects(
          models[state.selectedModel].children,
          true
        );
        // No intersect found
        if (intersects.length === 0) {
          // Show
          point.element.classList.add("visible");
        }
        // Intersect found
        else {
          // Get the distance of the intersection and the distance of the point
          const intersectionDistance = intersects[0].distance;
          const pointDistance = newPosition.distanceTo(camera.position);
          // Intersection is close than the point
          if (intersectionDistance < pointDistance) {
            // Hide
            point.element.classList.remove("visible");
          }
          // Intersection is further than the point
          else {
            // Show
            point.element.classList.add("visible");
          }
        }
        const translateX = screenPosition.x * sizes.width * 0.5;
        const translateY = -screenPosition.y * sizes.height * 0.5;
        point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
      }
    }

    //material.uniforms.uTime.value = elapsedTime;
    //liquidMaterial.uniforms.uTime.value = elapsedTime;
    //liquidMaterial.userData.uTime.value = elapsedTime;
    //metaballsMaterial.userData.uTime.value = elapsedTime;

    centerModel.material.userData.uTime.value = elapsedTime;
    particleSystem.material.uniforms.uTime.value = elapsedTime;
    //sphere.material.uniforms.uTime.value = elapsedTime;

    //Rotate each model
    for (let model of group.children) {
      const modelName = model.userData.groupName;
      if (state.selectedModel == modelName && state.rotationStopped) {
        continue;
      }
      model.rotation.z += radiansPerSecond * delta;
    }

    if (state.rotateGroup) group.rotation.y += 0.005;
    if (state.rotateSphere) centerModel.rotation.y += 0.005;
    else if (state.rotateCentralModel) centerModel.rotation.z += 0.005;

    if (state.simulatePhysics) {
      // Update physics
      world.step(1 / 60, delta, 3);

      for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
        if (object.mesh.position.length() > 1.5) {
          object.mesh.geometry.dispose();
          object.mesh.material.dispose();
          scene.remove(object.mesh);
          state.simulatePhysics = false;
        }
      }
    }
  }

  // Render
  renderer.render(scene, camera);

  stats.end();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
