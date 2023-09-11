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
    geometry?: THREE.PlaneGeometry;
    meshes: THREE.Mesh[] = [];
    composer?: EffectComposer;
    effect1?: ShaderPass;
    gui?: dat.GUI;

 
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
        
        this.init();
        this.initPost();
        this.load();

        studio.initialize();
        const project = getProject('Homunculus');
        const sheet = project.sheet('scene');
        const distortion = sheet.object('Distortion', {
            progress: types.number(0, { range: [0, 1] }),
            // bar: true,
            // baz: "string",
            //   rotation: types.compound({
            // x: types.number(mesh.rotation.x, { range: [-2, 2] }),
            // y: types.number(mesh.rotation.y, { range: [-2, 2] }),
            // z: types.number(mesh.rotation.z, { range: [-2, 2] }),
            //   }),
        });
        distortion.onValuesChange(newValue => {
            // console.log(newValue);
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
        this.camera.position.set(0, 0, 2);
        this.camera.fov = 70;
        this.camera.near = 0.01;
        this.camera.far = 1000;
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.meshes.forEach((m) => {
            // m.position.y = -this.settings.progress;
            m.rotation.z = this.settings.progress * Math.PI / 2;
        })
        this.time += 0.01;
        this.material!.uniforms.time.value = this.time;
        this.effect1!.uniforms['time'].value = this.time;
        // this.effect1!.uniforms['progress'].value = this.settings.progress;
        this.effect1!.uniforms[ 'scale' ].value = this.settings.scale;
        
        this.frameId = requestAnimationFrame(this.render.bind(this));
        this.composer?.render();
    }

    initPost() {
        this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );

		this.effect1 = new ShaderPass( CustomPass );
		this.composer.addPass( this.effect1 );
    }

    addObject() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uTexture: { value: this.textures[0] }
            },
            vertexShader: vertex,
            fragmentShader: fragment
        });
        this.geometry = new THREE.PlaneGeometry(1.9/2, 1/2, 1, 1);
        this.meshes = this.textures.map((t, i) => {
            let m = this.material?.clone();
            m!.uniforms.uTexture.value = t;
            let mesh = new THREE.Mesh(this.geometry, m);
            this.scene.add(mesh);
            mesh.position.x = i - 1;
            return mesh;
        });

    }
}  
