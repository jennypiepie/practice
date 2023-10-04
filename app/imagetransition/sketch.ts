import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import load from 'load-asset';
import gsap from 'gsap';


interface ConProps {
    dom: HTMLCanvasElement
    images: any;
    start: string;
}


export default class Sketch extends Scene {
    material?: THREE.ShaderMaterial;
    geomotry?: THREE.PlaneGeometry;
    plane?: THREE.Mesh;
    imageAspect: number = 0;
    settings: any;
    gui?: dat.GUI;
    time: number = 0;
    images: any;
    start: string;
    assets: any = {};

    constructor({ dom, images, start }: ConProps) {
        super({ dom });
        // this.settings = {
        //     progress: 0,
        // }
        this.images = images;
        this.start = start;
        // this.setGUI();

        this.init();
        this.load();


    }

    load() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                progress: { value: 0 },
                time: { value: 0 },
                t1: { value: null },
                t2: { value: null },
                resolution: { value: new THREE.Vector4() },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        })
        load.all(this.images).then((assets: any) => {
            for (let key in assets) {
                assets[key] = new THREE.Texture(assets[key]);
            }
            this.assets = assets;
            this.material!.uniforms.t1.value = assets[this.start] || assets['index'];
            this.material!.uniforms.t1.value.needsUpdate = true;

            this.addObject();
            this.render();
        });
    }

    // async setGUI() {
    //     const dat = await import('dat.gui');
    //     if (!this.gui) {
    //         this.gui = new dat.GUI();
    //         this.gui.add(this.settings, 'progress', 0, 1, 0.01);
    //     }
    // }

    setCamera() {
        const frustumSize = 1;
        this.camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -500, 500);
        this.camera.position.set(0, 0, 2);
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.time += 0.05;
        // this.material!.uniforms.progress.value = this.settings.progress;
        this.material!.uniforms.time.value = this.time;
        super.render();
    }


    addObject() {
        this.imageAspect = 737 / 1280;
        let a1, a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.height / this.width) * this.imageAspect;
        }

        this.material!.uniforms.resolution.value.x = this.width;
        this.material!.uniforms.resolution.value.y = this.height;
        this.material!.uniforms.resolution.value.z = a1;
        this.material!.uniforms.resolution.value.w = a2;

        this.geomotry = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.plane = new THREE.Mesh(this.geomotry, this.material);
        this.scene.add(this.plane);

    }

    changeBG(page: string) {
        let nextTexture = this.assets[page] || this.assets['index'];
        this.material!.uniforms.t2.value = nextTexture;
        this.material!.uniforms.t2.value.needsUpdate = true;

        gsap.to(this.material!.uniforms.progress, {
            duration: 1.5,
            value: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                this.material!.uniforms.progress.value = 0;
                this.material!.uniforms.t1.value = nextTexture;
            }
        })
    }
}  
