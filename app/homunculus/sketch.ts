import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CustomPass } from './CustomPass.js';

import studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';

interface ConProps{
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    time: number = 0;
    urls: any[];
    settings: any;
    textures: THREE.Texture[];
    material?: THREE.ShaderMaterial;
    meshes: THREE.Mesh[] = [];
    composer?: EffectComposer;
    effect1?: ShaderPass;
    gui?: dat.GUI;

    max: number = 50;
    rMeshes: THREE.Mesh[] = [];
    mouse: THREE.Vector2 = new THREE.Vector2(0, 0);
    preMouse: THREE.Vector2 = new THREE.Vector2(0, 0);
    currentWave: number = 0;
    scene1: THREE.Scene = new THREE.Scene();
    baseTexture: THREE.WebGLRenderTarget;
 
    constructor({ dom }: ConProps) {
        super({ dom });
        this.urls = [
            { url: '/imgs/1.jpg' },
            { url: '/imgs/2.jpg' },
            { url: '/imgs/3.jpg' },
        ];
        this.settings = {
            progress: 0,
            scale: 1,
        }
        this.textures = this.urls.map(item => new THREE.TextureLoader().load(item.url));  
        // this.setGUI();
        this.baseTexture = new THREE.WebGLRenderTarget(
            this.width, this.height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        );

        this.init();
        this.initPost();
        this.event();
        this.load();

        studio.initialize();
        const project = getProject('Homunculus');
        const sheet = project.sheet('scene');
        const distortion = sheet.object('Distortion', {
            progress: types.number(0, { range: [0, 1] }),
        });
        distortion.onValuesChange(newValue => {
            this.effect1!.uniforms['progress'].value = newValue.progress;
        })
    }

    async setGUI() {
        const dat = await import('dat.gui');
        if (!this.gui) {
            this.gui = new dat.GUI();
            this.gui.add(this.settings, 'progress', 0, 1, 0.01);
            this.gui.add(this.settings, 'scale', 0, 10, 0.01);
        }
    }

    setCamera() {
        // this.camera.position.set(0, 0, 2);
        // this.camera.fov = 70;
        // this.camera.near = 0.01;
        // this.camera.far = 1000;

        const frustumSize = this.height;
        const aspect = this.width / this.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000
        );
        this.camera.position.set(0, 0, 2);

        this.camera.updateProjectionMatrix();
    }

    setNewWave(x: number, y: number, index: number) { 
        let m = this.rMeshes[index];
        m.visible = true;
        m.position.x = x;
        m.position.y = y;
        (m.material as THREE.Material).opacity = 0.5;
        m.scale.x = m.scale.y = 0.2;
    }

    trackMousePos() {
        if (Math.abs(this.mouse.x - this.preMouse.x) < 4 && 
            Math.abs(this.mouse.y - this.preMouse.y) < 4
        ) {
            
        } else {
            this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave);
            this.currentWave = (this.currentWave + 1) % this.max;
        }
        this.preMouse.x = this.mouse.x;
        this.preMouse.y = this.mouse.y;
    }

    render() {
        this.meshes.forEach(m => {
            m.rotation.z = this.settings.progress * Math.PI / 2;
        })
        this.time += 0.01;
        this.material!.uniforms.time.value = this.time;
        this.effect1!.uniforms['time'].value = this.time;
        // this.effect1!.uniforms['progress'].value = this.settings.progress;
        this.effect1!.uniforms[ 'scale' ].value = this.settings.scale;
        
        this.trackMousePos();
        this.rMeshes.forEach((m) => {
            if (m.visible) {
                m.position.z += 0.02;
                (m.material as THREE.Material).opacity *= 0.96;
                m.scale.x = 0.98 * m.scale.x + 0.1;
                m.scale.y = m.scale.x;
                if ((m.material as THREE.Material).opacity < 0.002) m.visible = false;
            }
        }) 
        this.frameId = requestAnimationFrame(this.render.bind(this));

        this.renderer.setRenderTarget(this.baseTexture);
        this.renderer.render(this.scene1, this.camera);
        this.effect1!.uniforms['uDisplacement'].value = this.baseTexture.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.composer?.render();
    }

    initPost() {
        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass(new RenderPass(this.scene, this.camera));       

		this.effect1 = new ShaderPass( CustomPass );
		this.composer.addPass( this.effect1 );
    }

    event() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX - this.width / 2;
            this.mouse.y = this.height / 2 - e.clientY;
        })
    }

    addObject() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uTexture: { value: this.textures[0] },
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });
        const geometry = new THREE.PlaneGeometry(1.9*100, 1*100, 1, 1);
        this.meshes = this.textures.map((t, i) => {
            let m = this.material?.clone();
            m!.uniforms.uTexture.value = t;
            let mesh = new THREE.Mesh(geometry, m);
            this.scene.add(mesh);
            mesh.position.x = (i - 1)* 100 * 2;
            return mesh;
        });


        const rGM = new THREE.PlaneGeometry(32, 32, 1, 1);
        this.rMeshes = [];

        for (let i = 0; i < this.max; i++){
            let m = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('/imgs/brush.png'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,

            });

            let rMesh = new THREE.Mesh(rGM, m);
            rMesh.visible = false;
            rMesh.rotation.z = 2 * Math.PI * Math.random();
            this.scene1.add(rMesh);
            this.rMeshes.push(rMesh);
        }


    }
}  
