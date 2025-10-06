import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import World from './World.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import { mergeVertices, toCreasedNormals } from '../node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

/** The fundamental set up and animation structures for Simulation */
export default class Main {
    constructor() {
        // Intercept Main Window Errors
        window.realConsoleError = console.error;
        window.addEventListener('error', (event) => {
            let path = event.filename.split("/");
            this.display((path[path.length - 1] + ":" + event.lineno + " - " + event.message));
        });
        console.error = this.fakeError.bind(this);
        this.timeMS = 0;
        this.deferredConstructor();
    }

    async deferredConstructor() {
        // Construct the render world
        this.world = new World(this);

        // Configure Settings
        this.volconfig = {
            //showBody: true,
            //intensityScaling: 193.0,
        };

        //this.gui = new GUI();
        //this.gui.add( this.volconfig, 'showBody').onChange( () => { if(this.bodyMesh) { this.bodyMesh.visible = this.volconfig.showBody; } });
		//this.gui.add( this.volconfig, 'intensityScaling', 0, 500, 1 ).onChange( this.updateUniforms.bind(this) );
        //this.gui.open();

        // Load the GLTF model
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./node_modules/three/examples/jsm/libs/draco/');
        this.dracoLoader.setDecoderConfig({ type: 'js' });
        this.loader = new GLTFLoader();
        this.loader.setDRACOLoader(this.dracoLoader);
        this.loader.load('./assets/duck.glb', (gltf) => {
            this.mesh = gltf.scene.children[0];

            //this.mesh.scale.set(1000, 1000, 1000);
            //this.mesh.quaternion.setFromEuler(new THREE.Euler(-1.3, 0, 0));
            this.mesh.position.set(0, -0.1, 0);
            this.world.scene.add(this.mesh);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            //if (this.depthRenderTarget) {
            //    this.depthRenderTarget.setSize(window.innerWidth, window.innerHeight);
            //}
        });

        let cameras = [];
        for(let i = 0; i < 4; i++) {
            let camera = new THREE.PerspectiveCamera( 60, 1.0, 0.01, 10 );
            //this.world.scene.add(camera);
            cameras.push(camera);
        }
        let size = 700;
        cameras[0].position.set( 0.0, 0.0, 0.5 );
        cameras[0].viewport = new THREE.Vector4( 0, 0, size, size );
        cameras[0].lookAt(0, 0, 0);
        cameras[0].quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, Math.PI + Math.PI/4.0)));
        cameras[1].position.set( 0.0, 0.0, -0.5 );
        cameras[1].viewport = new THREE.Vector4( size, size, size, size );
        cameras[1].lookAt(0, 0, 0);
        cameras[1].quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0,  Math.PI/4.0)));
        cameras[2].position.set( -0.5, 0.0, 0 );
        cameras[2].viewport = new THREE.Vector4( size, 0, size, size );
        cameras[2].lookAt(0, 0, 0);
        cameras[2].quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, (1*Math.PI/2.0) + Math.PI/4.0)));
        cameras[3].position.set( 0.5, 0.0, 0 );
        cameras[3].viewport = new THREE.Vector4( 0, size, size, size );
        cameras[3].lookAt(0, 0, 0);
        cameras[3].quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.0, 0.0, (3*Math.PI/2.0) + Math.PI/4.0)));
        this.arrayCamera = new THREE.ArrayCamera( cameras );
        for(let i = 0; i < 4; i++) {
            this.arrayCamera.add(cameras[i]);
        }
        this.world.scene.add(this.arrayCamera);

        let x =  window.innerWidth/2*this.world.renderer.getPixelRatio();
        let y = ((window.innerHeight/2)+20)*this.world.renderer.getPixelRatio();
        cameras[0].viewport = new THREE.Vector4( x-size, y-size, size, size );
        cameras[1].viewport = new THREE.Vector4( x, y, size, size );
        cameras[2].viewport = new THREE.Vector4( x, y-size, size, size );
        cameras[3].viewport = new THREE.Vector4( x-size, y, size, size );

        // Attach this function to a user interaction, e.g., a button click
        //document.getElementById('request-permission-button').addEventListener('click', this.requestOrientationPermission.bind(this));

        //this.world.container.addEventListener('pointermove', (event) => {
        //    event.stopPropagation();
        //    event.preventDefault();
        //    let x =  event.pageX*this.world.renderer.getPixelRatio();
        //    let y = (window.innerHeight-event.pageY)*this.world.renderer.getPixelRatio();
        //    let size = 700;
        //    cameras[0].viewport = new THREE.Vector4( x-size, y-size, size, size );
        //    cameras[1].viewport = new THREE.Vector4( x, y, size, size );
        //    cameras[2].viewport = new THREE.Vector4( x, y-size, size, size );
        //    cameras[3].viewport = new THREE.Vector4( x-size, y, size, size );
        //}, false);

    }

    requestOrientationPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
            .then((state) => {
                if (state === 'granted') {
                    window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
                } else {
                    console.error('Device orientation permission denied.');
                }
            })
            .catch(console.error);
        } else {
            // For browsers that don't require permission
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        }
    }

    handleOrientation(event) {
        const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0;
        const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
        const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;

        // Update the camera or object rotation based on device orientation
        this.arrayCamera.quaternion.setFromEuler(new THREE.Euler(0.0, -alpha, 0.0));
    }

    /** Update the simulation */
    update(timeMS) {
        this.deltaTime = timeMS - this.timeMS;
        this.timeMS = timeMS;

        this.arrayCamera.quaternion.setFromEuler(new THREE.Euler(0.0, timeMS * -0.075, 0.0));
    
        //this.world.controls.update();
        //this.world.renderer.render(this.world.scene, this.world.camera);
        this.world.renderer.render(this.world.scene, this.arrayCamera);
        this.world.stats.update();
    }

    // Log Errors as <div>s over the main viewport
    fakeError(...args) {
        if (args.length > 0 && args[0]) { this.display(JSON.stringify(args[0])); }
        window.realConsoleError.apply(console, arguments);
    }

    display(text) {
        let errorNode = window.document.createElement("div");
        errorNode.innerHTML = text.fontcolor("red");
        window.document.getElementById("info").appendChild(errorNode);
    }
}

var main = new Main();
