import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import waterVertexShader from "./shaders/water/vertex.glsl";
//import waterFragmentShader from "./shaders/water/fragment.glsl";
import noiseVertexShader from "./shaders/noise/vertex.glsl";
import noiseFragmentShader from "./shaders/noise/fragment.glsl";
import {MagmaMaterial} from "./materials/magma.js"
import { gsap, Power3 } from "gsap";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
import * as CANNON from "cannon-es";

/**
 * Stats
 */
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

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
      //panels[state.selectedModel].classList.add("visible");
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
    for (const model of models) {
      console.log(model.userData.groupName);
      model.rotation.x = -Math.PI / 2;
      model.rotation.y = Math.PI / 12;
    }
  } else {
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      console.log(model.userData.groupName);
      model.rotation.x = 0;
      model.rotation.y = (i * Math.PI) / 3;
    }
  }

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const sphereFolder = gui.addFolder('Sphere')
const materialFolder1 = gui.addFolder('Material1')
let  debugObject = {};
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


const metalMaterial = new THREE.MeshPhysicalMaterial({
  metalness: 1,
  clearcoat: 1.0,
  envMap: environmentMap,
  side: THREE.DoubleSide,
});

/**
 * Sphere
 */
const sphereRadius = 0.1;
const sphereGeometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 32);
const magmaMaterial = new MagmaMaterial();
const sphereMaterial = magmaMaterial.getMaterial();
magmaMaterial.addGui(sphereFolder)

// sphereFolder
//   .add(sphereMaterial.userData.uSpeed, "value")
//   .min(0)
//   .max(4)
//   .step(0.001)
//   .name("uSpeed");
//   sphereFolder
//   .add(sphereMaterial.userData.uOffset, "value")
//   .min(0)
//   .max(0.1)
//   .step(0.0001)
//   .name("uOffset");
//   sphereFolder
//   .add(sphereMaterial.userData.uAmplitude, "value")
//   .min(0)
//   .max(100.0)
//   .step(1)
//   .name("uAmplitude");
//   sphereFolder
//   .add(sphereMaterial.userData.uFreq, "value")
//   .min(1)
//   .max(100.0)
//   .step(1)
//   .name("uFreq");

//   sphereFolder.addColor(debugObject, "color1").onChange(() => {
//   sphereMaterial.userData.uColor1.value.set(debugObject.color1);
// });
// sphereFolder.addColor(debugObject, "color2").onChange(() => {
//   sphereMaterial.userData.uColor2.value.set(debugObject.color2);
// });
// sphereFolder.addColor(debugObject, "backgroundColor").onChange(() => {
//   sphereMaterial.userData.uBackgroundColor.value.set(
//     debugObject.backgroundColor
//   );
// });

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// mirrorSphereCamera.position = sphere.position;
// sphere.castShadow = false;
// sphere.receiveShadow = true; //default
sphere.position.y = 0;
scene.add(sphere);

/**
 * Background
 */
scene.background = new THREE.Color(debugObject.background);
scene.fog = new THREE.Fog(debugObject.background, 0.5, 2);
gui.addColor(debugObject, "background").onChange(() => {
  //material.color.set(parameters.color)
  scene.background = new THREE.Color(debugObject.background);
  scene.fog = new THREE.Fog(debugObject.background, 0.3, 2);
});

const steelMagmaMaterial = new MagmaMaterial();
steelMagmaMaterial.uniforms.uAmplitude.value.y = 4.
steelMagmaMaterial.uniforms.uFreq.value.y = 20.

const initMaterial = steelMagmaMaterial.getMaterial(); //noiseMaterial;
steelMagmaMaterial.addGui(materialFolder1)
const initMaterialMap = [
  { objectID: "thumbBlade", material: initMaterial },
  { objectID: "fingerBlade", material: initMaterial },
  //{ objectID: "screw", material: initMaterial },
];

function assignMaterial(parent, type, mlt) {
  parent.traverse((o) => {
    if (o.isMesh) {
      console.log(o.name, type);
      if (o.name.includes(type)) {
        o.material = mlt;
        o.ojectID = type;
        //o.material.envMap = environmentMap;
      }
    }
  });
}

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
    element: document.querySelector(".point-0"),
    name: "screw",
  },
  {
    model: "tailorShears",
    position: new THREE.Vector3(0.12, 0.01, 0.1),
    element: document.querySelector(".point-1"),
    name: "thumbBow",
  },
  {
    model: "tailorShears",
    position: new THREE.Vector3(0.001, 0.01, 0.16),
    element: document.querySelector(".point-2"),
    name: "fingerBow",
  },
  {
    model: "tailorShears",
    position: new THREE.Vector3(-0.04, 0.002, 0.14),
    element: document.querySelector(".point-3"),
    name: "silencer",
  },
];

/**
 * Models
 */

const models = [];

const modelsParams = {
  center: { x: 0, z: 0 },
  radius: 0.3,
  files: [
    "./models/tailorShears.glb",
    "./models/hairShears.glb",
    "./models/paperScissors.glb",
  ],
  names: ["tailorShears", "hairShears", "paperScissors"],
  //cameraPosition: { x: 0.5, y: 0.2, z: 0 },//{ x: 0.6, y: -0.1, z: 0 },
  positions: {},
  rotations: {},
  quaternions: {},
  startRotationsZ: {},
  cameraPositions: {},
  models: {},
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

    for (let obj of initMaterialMap) {
      assignMaterial(model, obj.objectID, obj.material);
    }

    group.add(model);
    models.push(model);
    modelsParams.positions[model.userData.groupName] = model.position;
    modelsParams.rotations[model.userData.groupName] = model.rotation;
    modelsParams.quaternions[model.userData.groupName] = model.quaternion;
    modelsParams.startRotationsZ[model.userData.groupName] = model.rotation.z;
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
 * State
 */

const state = {
  selectedModel: null, //modelsParams.names[0],
  rotationStopped: false,
};

/**
 * Panels
 */
const panels = {};
for (const modelName of modelsParams.names) {
  panels[modelName] = document.querySelector("." + modelName);
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

//click event
const navigationElement = document.querySelector(".nav");
const controlsElement = navigationElement.querySelector(".controls");

function handleClick(e) {
  // Cast a ray from the mouse and handle events
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(models, true);
  let group = intersects.length
    ? intersects[0].object.parent.userData.groupName ||
      intersects[0].object.userData.groupName
    : null;
  if (group && group != state.selectedModel) {
    console.log(group, intersects);
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
    const targetPoint = modelsParams.positions[group];
    animateCamera(targetPosition, targetPoint);
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
//directionalLight.position.set(-2, 1, -0.2);
directionalLight.position.set(0, 2, 0);
scene.add(directionalLight);

gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");

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
// camera.position.set(
//   positionsOnCircleCamera[0].x,
//   0.2,
//   positionsOnCircleCamera[0].z
// );

if (sizes.height > sizes.width && sizes.width < 500) {
  //mobile view
  camera.position.set(0.6, 0.7, 0.5); //above
} else {
  camera.position.set(0, 0.7, 0); //above
}

function setCameraTopViewPosition() {
  let targetPosition = new THREE.Vector3(0.1, 0.7, 0);
  if (sizes.height > sizes.width && sizes.width < 500) {
    targetPosition = new THREE.Vector3(0.6, 0.7, 0.5);
  }
  const targetPoint = new THREE.Vector3(0, 0, 0);
  animateCamera(targetPosition, targetPoint);
}

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
//controls.enablePan =false;
controls.rotateSpeed = 0.5;
controls.target.set(0, 0, 0);
controls.saveState();
//controls.target.set(positionsOnCircle[0].x, 0, positionsOnCircle[0].z);
//controls.autoRotate = true;
//controls.autoRotateSpeed = 0.2;

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

function launchModel(model) {
  const pos = model.position.clone();
  animateCamera(
    pos.add(new THREE.Vector3(0.05, -0.2, 0.05)),
    new THREE.Vector3(0, 1, 0)
  );

  //console.log(getRotationAxisAndAngle(model.rotation, new THREE.Vector3(0,1,0)))
  //const rot = getRotationAxisAndAngle(model.rotation, new THREE.Vector3(-Math.PI,Math.PI,Math.PI))
  //model.rotateOnAxis(rot.axis, rot.angle)
  //model.rotation.set(0,0,0);
  console.log(
    model.rotation,
    model.position,
    model.position.clone().normalize()
  );
  model.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

  gsap.to(model.position, {
    duration: 2,
    y: 10,
    onUpdate: function () {},
    onComplete: () => {
      console.log("finished");
    },
    ease: Power3.easeIn,
  });
}

debugObject.launchModel = () => {
  launchModel(models[0]);
};
gui.add(debugObject, "launchModel");

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

function toggleRotation() {
  for (const model of models) {
    if (model.userData.groupName == state.selectedModel) {
      console.log(model.userData.groupName);
      console.log(modelsParams.rotations[model.userData.groupName]);
      //model.rotation.x = modelsParams.rotations[state.selectedModel].x
      model.rotation.z = modelsParams.startRotationsZ[state.selectedModel];
      console.log(model);
    }
  }
  state.rotationStopped = !state.rotationStopped;
}
debugObject.toggleRotation = toggleRotation;
gui.add(debugObject, "toggleRotation");

function toggleInspectMode() {
  if (state.inspectMode) {
    state.inspectMode = false;
    this.innerHTML = "Inspect";
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

function enableTopView(e) {
  console.log(state);
  setCameraTopViewPosition();
  console.log(state);
  if (controlsElement.classList.contains("visible")) {
    controlsElement.classList.remove("visible");
  }
  if (state.selectedModel)
    panels[state.selectedModel].classList.remove("visible");

  state.selectedModel = null;
  state.rotationStopped = false;
  document.querySelector(".button--inspect").innerHTML = "Inspect";
  state.inspectMode = false;
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".button--inspect")
    .forEach((button) => button.addEventListener("click", toggleInspectMode));

  document
    .querySelectorAll(".button--look-around")
    .forEach((button) => button.addEventListener("click", enableTopView));
});

/**
 * Physics
 */
const objectsToUpdate = [];
debugObject.simulatePhysics = false;
gui.add(debugObject, "simulatePhysics");


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
    restitution: 0.7,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.position.y = -0.5;
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.499);
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
  // Update controls
  controls.update();

  // Update points only when the scene is ready
  if (sceneReady) {
    //Go through each point
    for (const point of points) {
      //skip points that are irrelevant for the selected model OR points that are far away
      if (
        state.selectedModel != point.model ||
        (state.selectedModel == point.model && !state.rotationStopped) ||
        point.position.distanceTo(camera.position) > 0.7
      ) {
        point.element.classList.remove("visible");
        continue;
      }

      //Rotate
      const newPosition = point.position.clone();
      const q = new THREE.Quaternion();
      q.setFromEuler(modelsParams.rotations[point.model]);
      newPosition.applyQuaternion(q);
      newPosition.add(modelsParams.positions[point.model]);

      // Get 2D screen position
      const screenPosition = newPosition.clone();
      screenPosition.project(camera);
      // Set the raycaster
      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
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

  const elapsedTime = clock.getElapsedTime();

  //material.uniforms.uTime.value = elapsedTime;
  //sphere.material.uniforms.uTime.value = elapsedTime;
  sphere.material.userData.uTime.value = elapsedTime;

  //Rotate
  for (let model of group.children) {
    const modelName = model.userData.groupName;
    if (state.selectedModel == modelName && state.rotationStopped) {
      continue;
    }
    model.rotation.z += radiansPerSecond * delta;
  }

  if(debugObject.simulatePhysics){

  // Update physics
    world.step(1 / 60, delta, 3)
    
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }
  }


  // Render
  renderer.render(scene, camera);

  stats.end();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
