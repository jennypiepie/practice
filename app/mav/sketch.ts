import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import head from '../../public/models/head.glb';


interface ConProps {
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    material?: THREE.ShaderMaterial;
    time: number = 0;
    model?: THREE.Group;

    constructor({ dom }: ConProps) {
        super({ dom });
        this.init();
        this.load();

    }

    init() {
        super.init();
        this.setLoader();
    }

    load() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uTexture: { value: new THREE.TextureLoader().load('/imgs/texture.jpg') },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        })
        this.loader?.load(head, (gltf) => {
            this.scene.add(gltf.scene);
            this.model = gltf.scene;
            gltf.scene.traverse(m => {
                if (m instanceof THREE.Mesh) {
                    m.geometry.center();
                    m.scale.set(0.3, 0.3, 0.3);
                    m.material = this.material;
                }
            })

            this.addObject();
            this.render();
        })
    }

    render() {
        this.time += 0.05;
        this.material!.uniforms.time.value = this.time;
        super.render();
    }

    addObject() {
        // const geometry = new THREE.PlaneGeometry(5, 5, 1, 1);
        // const plane = new THREE.Mesh(geometry, this.material);
        // this.scene.add(plane);
    }
}  
