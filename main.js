import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Water } from 'three/addons/objects/Water2.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

//Define elements: scene (required), renderder (required), camera (required), a model loader (filetype specific), lights, controls (for mouse and keyboard interaction)
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
const loader = new GLTFLoader();
const light = new THREE.AmbientLight(0xffffff, 2); // Soft white light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
const controls = new OrbitControls( camera, renderer.domElement );
let raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()
let loadedModel;
const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 1,
    flowY: 1
};

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        
        // Check if object has a link and redirect
        if (clickedObject.userData.link) {
            window.location.href = clickedObject.userData.link;
        }
    }
});

let container = renderer.domElement;
const modelContainer = new THREE.Group();

function setScene() {
    //Enable shadows on renderer
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.NeutralToneMapping;
    //Set renderer size to window size, could be a number if you want it in x pixels
    renderer.setSize( window.innerWidth, window.innerHeight );

    //Add the two lights we defined to the scene, set position of directional light
    scene.add(modelContainer);
    scene.add(light);
    scene.add(directionalLight);

    scene.background = new THREE.Color('white')
    //Add a background color


    //Set camera position
    camera.position.set(0.01,0.1,0.2);

    //Set directional light position
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
}
function addwater(){
    const waterGeometry = new THREE.PlaneGeometry( 20, 20 );
    let water = new Water( waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
    } );

    water.position.y = 0;
    water.rotation.x = Math.PI * - 0.5;
    scene.add( water );
}
function addSkybox(){
    const sky = new Sky();
    sky.scale.setScalar(40000); // Adjust scale to a more reasonable number

    // Access the Sky shader uniforms
    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 10;  // Simulates atmospheric haze
    skyUniforms.rayleigh.value = 2;    // Adjusts light scattering
    skyUniforms.mieCoefficient.value = 0.005; // Simulates particles in air
    skyUniforms.mieDirectionalG.value = 0.7; // Controls sun glare

    // Set sun position for the sky shader
    const phi = THREE.MathUtils.degToRad(20);   // Elevation angle
    const theta = THREE.MathUtils.degToRad(180); // Azimuthal angle
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    skyUniforms.sunPosition.value.copy(sunPosition);

    scene.add(sky);

    // Apply sun position to directional light
    directionalLight.position.copy(sunPosition.multiplyScalar(100));

    // Ensure correct exposure and tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Better color handling
    renderer.toneMappingExposure = .2;  // Increase brightness

    // Generate an environment map from the sky
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(sky).texture;
}
function addEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    new RGBELoader()
        .setPath('textures/') // Replace with your HDRI path
        .load('kloppenheim_06_puresky_4k.hdr', function(texture) {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.environment = envMap;
            scene.background = envMap; // If you want an HDRI background instead of white
            texture.dispose();
            pmremGenerator.dispose();
        });
}


/*function addPlane() {
    //Add a plane 
    const geometry = new THREE.PlaneGeometry( 10, 10 );
    const material = new THREE.MeshStandardMaterial({ color: 'skyblue', side: THREE.DoubleSide, roughness: 0, metalness: 0 });
    const plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add( plane );
}
    */

function addModel() {
    //Load our model
    loader.load('headphone.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(-0.2, -0.03, 0.02);
        
        model.traverse((child) => {
            if (child.isMesh) {
                child.userData.link = 'HP.html'; // Assign link to mesh objects
            }
        });

        scene.add(model);
    });
}
function addModel1() {
    //Load our model
    loader.load('mixer2.glb', (gltf) => {
        const model = gltf.scene;
        model.position.set(0.1, -0.03, 0.02);

        model.traverse((child) => {
            if (child.isMesh) {
                child.userData.link = 'mixer.html';
            }
        });

        scene.add(model);
    });
}





function addSphere(){
    // Create sphere geometry
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32); // Radius 0.5, 32 segments
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' }); // Shadow-capable material
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Enable shadows for the sphere
    sphere.castShadow = true;

    // Position the sphere above the plane
    sphere.position.set(0, 0.5, 0); // X = 0, Y = 1 (above plane), Z = 0

    // Add the sphere to the scene
    scene.add(sphere);
}
setScene();
//addSkybox();
addEnvironment() 
addwater();
//addPlane();
//addSphere();
addModel();
addModel1();

function animate() {
    requestAnimationFrame(animate);
    if (loadedModel) {
        loadedModel.rotation.y += 0.007; // Rotate around the Y-axis
    }
    controls.update();
    renderer.render(scene, camera);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        //console.log("Hovering over:", intersects[0].object);
    }
}
animate();

document.body.appendChild( renderer.domElement );
