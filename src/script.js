import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
 import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'



const gui = new dat.GUI()
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
 camera.position.y=25;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement)
// the lower the damping factor, the higher is the rotation sensitivity.
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(-100, 0, 100);
// HSL (Hue, Saturation and Lightness) is the color representation. It is user-friendly because without a big knowledge, you can imagine how specific color looks like.

const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(100, 0, 100);

const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();
const equalLight = new THREE.AmbientLight(0x404040, 0.75); // soft white light
equalLight.position.set(100, 0, 100);
scene.add(equalLight);
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 50);
// directionalLight.position.x += 20
// directionalLight.position.y += 20
// directionalLight.position.z += 20
// scene.add(directionalLight);
// const pointLight3 = new THREE.PointLight(0xff0000, 2)
// pointLight3.position.set(2.14, -3, -1.98)
// pointLight3.intensity = 10
// scene.add(pointLight3)





// const mtlLoader = new MTLLoader()
// mtlLoader.load(
//     'textures/Bottel.mtl',
//     (materials) => {
//         materials.preload()
//         console.log(materials)
//         const objLoader = new OBJLoader()
//         objLoader.setMaterials(materials)
//         objLoader.load(
//             'textures/Bottel.obj',
//             (object) => {
//                 scene.add(object)
//             },
//             // (xhr) => {
//             //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//             // },
//             // (error) => {
//             //     console.log('An error happened')
//             // }
//         )
//     },
//     // (xhr) => {
//     //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//     // },
//     // (error) => {
//     //     console.log('An error happened')
//     // }
// )
// const mtlLoader = new MTLLoader()
// mtlLoader.load(
//     'textures/Soda_Can.mtl',
//     (materials) => {
//         materials.preload()
//         console.log(materials)
//         const objLoader = new OBJLoader()
//         objLoader.setMaterials(materials)
//         objLoader.load(
//             'textures/Soda_Can.obj',
//             (object) => {
//                 scene.add(object)
//             },
//             (xhr) => {
//                 console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//             },
//             (error) => {
//                 console.log('An error happened')
//             }
//         )
//     },
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
//     },
//     (error) => {
//         console.log('An error happened')
//     }
// )
 
 
// // instantiate a loader
const loader = new SVGLoader();

loader.load(
	// resource URL
	'textures/002.svg',
	// called when the resource is loaded
	function ( data ) {

		const paths = data.paths;
		const group = new THREE.Group();

		for ( let i = 0; i < paths.length; i ++ ) {

			const path = paths[ i ];

			const material = new THREE.MeshBasicMaterial( {
				color: path.color,
				side: THREE.DoubleSide,
				depthWrite: false
			} );

			const shapes = SVGLoader.createShapes( path );

			for ( let j = 0; j < shapes.length; j ++ ) {

				const shape = shapes[ j ];
				const geometry = new THREE.ShapeGeometry( shape );
				const mesh = new THREE.Mesh( geometry, material );
				group.add( mesh );

			}

		}

		scene.add( group );

	},
	// called when loading is in progresses
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);


function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

animate();