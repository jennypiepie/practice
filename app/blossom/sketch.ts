import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertexParticles.glsl';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

interface ConProps{
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    time: number = 0;
    geometry?: THREE.PlaneGeometry;
    material?: THREE.ShaderMaterial;
    plane?: THREE.Points;
    gui?: dat.GUI;
    settings?: any;
    renderScene?: RenderPass;
    bloomPass?: UnrealBloomPass;
    composer?: EffectComposer;
    video: HTMLVideoElement;

    constructor({ dom }: ConProps) {
        super({ dom });
        this.video = document.getElementById('video2')! as HTMLVideoElement;
        this.settings = {
            distortion: 0,
            threshold: 0,
            strength: 0,
            radius: 0,
        }
        // this.setGUI();
        this.init();
        this.addPost();
        this.load();

        this.video?.addEventListener('ended', ()=>this.animate())
    }

    animate() {
        this.material!.uniforms.progress.value = 0;
        gsap.to(this.video, {
            duration: 0.1,
            opacity: 0,
        })
        gsap.to(this.material!.uniforms.progress, {
            duration: 1,
            value: 1,
            delay:1.5,
        })
        gsap.to(this.material!.uniforms.distortion, {
            duration: 2,
            value: 2,
            ease:'power2.inOut',
        })
        gsap.to(this.bloomPass!, {
            duration: 2,
            strength: 7,
            ease:'power2.in',
        })
        gsap.to(this.material!.uniforms.distortion, {
            duration: 2,
            value: 0,
            delay: 2,
            ease:'power2.inOut',
        })
        gsap.to(this.bloomPass!, {
            duration: 2,
            strength: 0,
            delay: 2,
            ease:'power2.out',
            onComplete: () => {
                this.video.currentTime = 0;
                gsap.to(this.video, {
                    duration: 0.1,
                    opacity: 1,
                    delay: 0.2
                })
                setTimeout(() => {
                    this.video.play();
                }, 200);
            }
        })
    }

    setCamera() {
        this.camera.position.set(0, 0, 1500);
        this.camera.far = 5000;
        this.camera.updateProjectionMatrix();
    }

    setRenderer() {
        super.setRenderer();
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    }
     
    render() {
        this.time += 0.05;
        this.material!.uniforms.time.value = this.time;
        // this.material!.uniforms.distortion.value = this.settings.distortion;
        // this.bloomPass!.threshold = this.settings.threshold;
		// this.bloomPass!.strength = this.settings.strength;
		// this.bloomPass!.radius = this.settings.radius;
        this.controls?.update();
        this.frameId = requestAnimationFrame(this.render.bind(this));
        this.composer?.render();
    }

    async setGUI() {
        const dat = await import('dat.gui');
        if (!this.gui) {
            this.gui = new dat.GUI();
            this.gui.add(this.settings, 'distortion', 0, 3, 0.01);
            this.gui.add(this.settings, 'threshold', 0, 10, 0.01);
            this.gui.add(this.settings, 'strength', 0, 3, 0.01);
            this.gui.add(this.settings, 'radius', 0, 3, 0.01);
        }
    }

    addPost() {
        this.renderScene = new RenderPass( this.scene, this.camera );

		this.bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		this.bloomPass.threshold = this.settings.threshold;
		this.bloomPass.strength = this.settings.strength;
		this.bloomPass.radius = this.settings.radius;
		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( this.renderScene );
		this.composer.addPass( this.bloomPass );
    }

    addObject() {
        // const mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshStandardMaterial({ color: 0x00ffff }));
        // this.scene.add(mesh);
        // const axes = new THREE.AxesHelper(10);
        // this.scene.add(axes);

        this.geometry = new THREE.PlaneGeometry(480 * 1.914, 820 * 1.914, 480, 820);
        
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                progress: { value: 0 },
                ft:{ value: new THREE.TextureLoader().load('/imgs/02-first.jpg') },
                t: { value: new THREE.TextureLoader().load('/imgs/02-end.jpg') },
                distortion: { value: 0 },
                
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            
        });

        this.plane = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.plane);
    }

    resize() {
        super.resize();
        this.composer?.setSize(this.width, this.height);
    }
}  
