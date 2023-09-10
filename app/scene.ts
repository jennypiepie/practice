import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface ConProps{
    dom: HTMLCanvasElement
}

export default class Scene {
    container: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    width: number;
    height: number;
    camera: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    loader?: GLTFLoader;
    dracoLoader?: DRACOLoader;
    frameId?: number;

    constructor({ dom }: ConProps) {
        this.container = dom;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ canvas: dom });
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 200);
    }

    init() {
        this.setCamera();
        this.setRenderer();     
        this.setupResize();
        this.setControls();
        this.setLight();
    }

    load() {
        this.addObject();
        this.render();
    }
    
    setCamera() { 
        this.camera.position.set(1, 2, 8);
    }

    setRenderer() {
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // this.renderer.setClearColor(0xeeeeee, 1);
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    setControls() {
        this.controls = new OrbitControls(this.camera, this.container);
    }

    setLoader() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.loader.setDRACOLoader(this.dracoLoader);
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    render() {
        this.controls?.update();
        this.renderer.render(this.scene, this.camera);
        this.frameId = requestAnimationFrame(this.render.bind(this));
    }

    stop = () => {
        cancelAnimationFrame(this.frameId || 1);
    }

    addObject() {}

    setLight() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(light1);
    }
}
