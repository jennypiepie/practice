import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import fragmentParticles from './shaders/fragmentParticles.glsl';
import vertexParticles from './shaders/vertexParticles.glsl';

interface ConProps{
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    time: number = 0;
    geometry?: THREE.SphereGeometry;
    material?: THREE.ShaderMaterial;
    sphere?: THREE.Mesh;
    particlesGeometry?: THREE.BufferGeometry;
    particlesMaterial?: THREE.ShaderMaterial;
    points?: THREE.Points;

    settings?: any;

    constructor({ dom }: ConProps) {
        super({ dom });
        this.settings = {
        }
        this.init();
        this.load();
    }

    setCamera() {
        this.camera.position.set(0, 0, 4);
    }

    render() {
        this.time += 0.05;
        this.material!.uniforms.time.value
            = this.particlesMaterial!.uniforms.time.value
            = this.time;
        this.points!.rotation.y = this.time / 10;
        super.render();
    }


    addObject() {
        this.geometry = new THREE.SphereGeometry(1, 128, 128);
        
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            // wireframe:true,
            
        });

        this.sphere = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.sphere);
        this.addParticles();
    }

    addParticles() {
        // this.particlesGeometry = new THREE.SphereGeometry(1.5, 128, 128);
        
        this.particlesMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: vertexParticles,
            fragmentShader: fragmentParticles,     
            transparent: true,
            
        });

        const N = 5000;
        const positions = new Float32Array(N * 3);
        this.particlesGeometry = new THREE.BufferGeometry();

        const inc = Math.PI * (3 - Math.sqrt(5));
        const offset = 2 / N;
        const rad = 1.7;

        for (let  i = 0; i < N; i++){
            let y = i * offset - 1 + (offset / 2);
            let r = Math.sqrt(1 - y * y);
            let phi = i * inc;

            positions[3 * i] = Math.cos(phi) * r * rad;
            positions[3 * i + 1] = y * rad;
            positions[3 * i + 2] = Math.sin(phi) * r* rad;
        }
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.points = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.points);
    }
}  
