import "./style.css";

import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import Stats from "stats.js";

import NOISE from "./perlin";

function getImageUrl(name: string) {
  return `/textures/block/${name}.png`;
  //return new URL(`/textures/block/${name}.png`, import.meta.url).href;
}

// const { log } = console;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  800,
  window.innerWidth / window.innerHeight,
  0.1,
  500,
);

//scene.background = new THREE.Color(0x01144a);
scene.background = new THREE.Color(0x08001f);
scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const textureLoader = new THREE.TextureLoader();
const soilTexture = textureLoader.load(getImageUrl("grass_block_side"));
soilTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
// soilTexture.minFilter = THREE.LinearFilter;

const soilTextureNormal = textureLoader.load(getImageUrl("grass_block_side_n"));
soilTextureNormal.anisotropy = renderer.capabilities.getMaxAnisotropy();
// soilTextureNormal.minFilter = THREE.LinearFilter;

const grassTop = textureLoader.load(getImageUrl("grass_block_top"));
grassTop.anisotropy = renderer.capabilities.getMaxAnisotropy();
// grassTop.minFilter = THREE.LinearFilter;

const grassTopNormal = textureLoader.load(getImageUrl("grass_block_top_n"));
// grassTopNormal.anisotropy = renderer.capabilities.getMaxAnisotropy();
grassTopNormal.minFilter = THREE.LinearFilter;

const grassAtlas = textureLoader.load(getImageUrl("../grass_atlas"));
// grassTopNormal.anisotropy = renderer.capabilities.getMaxAnisotropy();
grassAtlas.minFilter = THREE.LinearFilter;

// Need a texture loader with that

const n = new NOISE(Math.random());

const group = new THREE.Group();

camera.position.x = 200;
camera.position.y = 30;
camera.position.z = 180;

camera.rotation.z = 0.6;

const NOON = 0xeeaf61;
// const DUSK = 0xfb9062;
// const NIGHT = 0x6a0d83;

const light = new THREE.DirectionalLight(NOON, 1);
light.castShadow = true;
light.position.set(1, 1, 1);
light.target = group;

// setup shadow properties of the light
light.shadow.mapSize.width = 2048; // default
light.shadow.mapSize.height = 2048; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 20, 10);
spotLight.castShadow = true;
spotLight.angle = Math.PI / 6; // Control spotlight angle
spotLight.penumbra = 0.1; // Softness of the shadow edge
spotLight.decay = 2; // How quickly the light fades
spotLight.distance = 100; // Distance where light intensity falls off

// Configure spotlight shadow properties
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 50;
spotLight.shadow.camera.fov = 30; // Field of view for shadow camera

// scene.add(spotLight);

const geometries: any = [];

function setUVs(geometry: any) {
  const uvs = geometry.attributes.uv.array;
  const uvCount = uvs.length / 2;

  const topUV = [
    { x: 0.0, y: 1.0 }, // Top-left corner of the top texture
    { x: 0.5, y: 1.0 }, // Top-right corner of the top texture
    { x: 0.0, y: 0.5 }, // Bottom-left corner of the top texture
    { x: 0.5, y: 0.5 }, // Bottom-right corner of the top texture
  ];

  const bottomUV = [
    { x: 0.5, y: 1.0 }, // Top-left corner of the bottom texture
    { x: 1.0, y: 1.0 }, // Top-right corner of the bottom texture
    { x: 0.5, y: 0.5 }, // Bottom-left corner of the bottom texture
    { x: 1.0, y: 0.5 }, // Bottom-right corner of the bottom texture
  ];

  const sideUV = [
    { x: 0.0, y: 0.5 }, // Top-left corner of the side texture
    { x: 0.5, y: 0.5 }, // Top-right corner of the side texture
    { x: 0.0, y: 0.0 }, // Bottom-left corner of the side texture
    { x: 0.5, y: 0.0 }, // Bottom-right corner of the side texture
  ];

  // Assign UVs for each face
  for (let i = 0; i < uvCount; i++) {
    if (i >= 8 && i <= 11) {
      // Top face
      uvs[i * 2] = topUV[i % 4].x;
      uvs[i * 2 + 1] = topUV[i % 4].y;
    } else if (i >= 12 && i <= 15) {
      // Bottom face
      uvs[i * 2] = bottomUV[i % 4].x;
      uvs[i * 2 + 1] = bottomUV[i % 4].y;
    } else {
      // Side faces
      uvs[i * 2] = sideUV[i % 4].x;
      uvs[i * 2 + 1] = sideUV[i % 4].y;
    }
  }
  geometry.attributes.uv.needsUpdate = true;
}

const CHUNK_SIZE = 200;
const MAX_HEIGHT = 15;

for (let x = 0; x < CHUNK_SIZE; ++x) {
  for (let z = 0; z < CHUNK_SIZE; ++z) {
    // const height = Math.floor(Math.random() * MAX_HEIGHT);

    const h =
      n.perlin2(z * (7 / CHUNK_SIZE), x * (7 / CHUNK_SIZE)) * MAX_HEIGHT;

    // place blocks vertically
    for (let y = 0; y < Math.max(1, h); ++y) {
      const blockSize = 1;
      const blockGeometry = geometry.clone();

      blockGeometry.translate(x * blockSize, y * blockSize, z * blockSize);

      geometries.push(blockGeometry);

      setUVs(blockGeometry);
    }
  }
}

const dirLight1 = new THREE.DirectionalLight(0xe3e3e3, 1);
dirLight1.position.set(0, 1, 1);
scene.add(dirLight1);

// const dirLight2 = new THREE.DirectionalLight(NOON, 1);
// dirLight1.position.set(-1, -1, -1);
// scene.add(dirLight2);

group.frustumCulled = true;

const merged = BufferGeometryUtils.mergeGeometries(geometries, true);

const mesh = new THREE.Mesh(
  merged,
  new THREE.MeshStandardMaterial({ map: grassAtlas }),
);

mesh.castShadow = true;
mesh.receiveShadow = false;

group.add(mesh);

function animate() {
  stats.begin();
  controls.update();

  stats.end();

  renderer.render(scene, camera);
}

//const hemisphere_light = new THREE.HemisphereLight(0xfb9062, 0x080820, 1);

scene.add(group);
// scene.add(hemisphere_light);

// const ambientLight = new THREE.AmbientLight(0x555555, 1);
// scene.add(ambientLight);

const controls = new MapControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.autoRotate = true;
controls.autoRotateSpeed = 0.08;

controls.screenSpacePanning = false;

controls.minDistance = 1;
controls.maxDistance = 500;

const app = document.getElementById("app");

app?.appendChild(renderer.domElement);

const button = document.createElement("button");
button.innerHTML = "anti-aliasing ON";
button.style.position = "absolute";
button.style.top = "0";
button.style.left = "0";
button.style.margin = "6px";

// app?.appendChild(button);

renderer.setAnimationLoop(animate);

const stats = new Stats();
stats.showPanel(1);
app?.appendChild(stats.dom);
