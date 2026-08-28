import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 1. SETUP THREE.JS SCENE UTILITIES ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera Setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting Configuration
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Interactive Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Track the currently displayed model so we can clean it up later
let currentModel = null;
const loader = new GLTFLoader();

// --- 2. MODEL LOADING LOGIC ---
function loadModelFromUrl(url) {
    // If a model is already showing, remove it from memory and scene
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(url, (gltf) => {
        currentModel = gltf.scene;
        
        // Auto-center and scale the model so any size model looks good
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        currentModel.position.x += (currentModel.position.x - center.x);
        currentModel.position.y += (currentModel.position.y - center.y);
        currentModel.position.z += (currentModel.position.z - center.z);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        currentModel.scale.set(scale, scale, scale);

        scene.add(currentModel);
    }, 
    undefined, 
    (error) => {
        console.error('An error occurred loading the 3D model:', error);
    });
}

// --- 3. DYNAMIC USER FILE UPLOAD HANDLING ---
document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    // Read the user's file array buffer and create a temporary URL
    reader.addEventListener('load', function (e) {
        const contents = e.target.result;
        const blob = new Blob([contents], { type: 'application/octet-stream' });
        const objectURL = URL.createObjectURL(blob);
        
        // Push the dynamic blob URL into our viewer
        loadModelFromUrl(objectURL);
    });

    reader.readAsArrayBuffer(file);
});

// --- 4. ENGINE ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // smoothly updates camera physics
    renderer.render(scene, camera);
}
animate();

// --- 5. RESPONSIVE WINDOW RESIZING ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Optional: Load an initial default model on startup if desired
// loadModelFromUrl('path/to/your/default-model.gltf');
