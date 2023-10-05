import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import { Lethargy } from 'lethargy';
import VirtualScroll from 'virtual-scroll';

interface ConProps {
    dom: HTMLCanvasElement
}


export default class Sketch extends Scene {
    scenes: any[] = [];
    lethargy: any;
    material?: THREE.ShaderMaterial;
    postScene: THREE.Scene = new THREE.Scene();
    postCamera?: THREE.OrthographicCamera;
    quad?: THREE.Mesh;
    current: number = 0;
    next: number = 0;
    gui?: dat.GUI;
    settings: any;
    time: number = 0;
    currentState: number = 0;
    scroller: any = new VirtualScroll();
    progress: number = 0;

    constructor({ dom }: ConProps) {
        super({ dom });
        this.scenes = [
            {
                bg: new THREE.Color(0x639ad3),
                matcap: '/imgs/matcap1.jpg',
                geometry: new THREE.BoxGeometry(0.1, 0.1, 0.1),
            },
            {
                bg: new THREE.Color(0x82c6c7),
                matcap: '/imgs/matcap2.jpg',
                geometry: new THREE.TorusGeometry(0.1, 0.02, 50, 10),

            },
            {
                bg: new THREE.Color(0x87dac8),
                matcap: '/imgs/matcap3.jpg',
                geometry: new THREE.SphereGeometry(0.05, 20, 20),

            }
        ];
        this.scenes.forEach(item => {
            item.scene = this.createScene(item.bg, item.matcap, item.geometry);
            this.renderer.compile(item.scene, this.camera);
            item.target = new THREE.WebGLRenderTarget(this.width, this.height);
        });

        this.lethargy = new Lethargy();

        this.settings = {
            progress: 0,
        }

        this.scroller.on((event: any) => {
            this.currentState -= event.deltaY / 4000;
            this.currentState = (this.currentState + 3000) % 3;
            console.log(this.currentState);

        })
        // this.setGUI();
        this.init();
        this.initPost();
        this.load();
    }

    init() {
        this.setCamera();
        this.setRenderer();
        this.setupResize();
    }

    setCamera() {
        this.camera.position.set(0, 0, 2);
    }

    async setGUI() {
        const dat = await import('dat.gui');
        if (!this.gui) {
            this.gui = new dat.GUI();
            this.gui.add(this.settings, 'progress', 0, 1, 0.01);
        }
    }

    render() {
        this.time += 0.05;

        this.current = Math.floor(this.currentState);
        this.next = (this.current + 1) % this.scenes.length;
        this.progress = this.currentState % 1;

        this.renderer.setRenderTarget(this.scenes[this.current].target);
        this.renderer.render(this.scenes[this.current].scene, this.camera);

        this.renderer.setRenderTarget(this.scenes[this.next].target);
        this.renderer.render(this.scenes[this.next].scene, this.camera);

        this.renderer.setRenderTarget(null);

        this.material!.uniforms.t1.value = this.scenes[this.current].target.texture;
        this.material!.uniforms.t2.value = this.scenes[this.next].target.texture;
        this.material!.uniforms.progress.value = this.progress;
        this.material!.uniforms.time.value = this.time;


        this.scenes.forEach(s => {
            s.scene.rotation.y = this.time * 0.1;
        })

        this.frameId = requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scenes[0].scene, this.camera);
        this.renderer.render(this.postScene, this.postCamera!);
    }

    createScene(bg: THREE.Color, matcap: string, geometry: THREE.BufferGeometry) {
        const scene = new THREE.Scene();
        scene.background = bg;
        const material = new THREE.MeshMatcapMaterial({
            matcap: new THREE.TextureLoader().load(matcap)
        });

        const mesh = new THREE.Mesh(geometry, material);

        for (let i = 0; i < 100; i++) {
            const random = new THREE.Vector3().randomDirection();
            const clone = mesh.clone();
            clone.position.copy(random);
            clone.rotation.x = Math.random();
            clone.rotation.y = Math.random();
            scene.add(clone);
        }

        return scene;
    }

    wheelEvent(state: any) {
        // console.log(this.lethargy.check(state.event));
    }

    initPost() {
        const frustumSize = 1;
        this.postCamera = new THREE.OrthographicCamera(
            frustumSize / -2,
            frustumSize / 2,
            frustumSize / 2,
            frustumSize / -2,
            -500,
            500
        );

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0 },
                time: { value: 0 },
                t1: { value: null },
                t2: { value: null },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            this.material
        )

        this.postScene.add(this.quad);
    }
}  
