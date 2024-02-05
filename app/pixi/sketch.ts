import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

interface ConProps {
    dom: HTMLCanvasElement
}

function range(a: number, b: number) {
    const r = Math.random();
    return a * r + b * (1 - r);
}

export default class Sketch extends Scene {
    material?: THREE.ShaderMaterial;
    geomotry?: THREE.PlaneGeometry;
    plane?: THREE.Mesh;
    imageAspect: number = 0;
    raycaster: THREE.Raycaster = new THREE.Raycaster();
    pointer: THREE.Vector2 = new THREE.Vector2();
    point: THREE.Vector3 = new THREE.Vector3();

    scene1: THREE.Scene = new THREE.Scene();
    renderTarget: THREE.WebGLRenderTarget;
    blobs: THREE.Mesh[] = [];

    constructor({ dom }: ConProps) {
        super({ dom });
        this.renderer = new THREE.WebGLRenderer({
            canvas: dom,
            alpha: true
        });
        this.renderTarget = new THREE.WebGLRenderTarget(
            this.width, this.height, {}
        );
        this.init();
        this.fixed();
        this.addBlob();
        this.load();
        this.raycasterEvent();
    }

    setCamera() {
        this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
        this.camera.position.set(0, 0, 1);
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.updateBlobs();
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene1, this.camera);
        this.material!.uniforms.mask.value = this.renderTarget.texture;
        this.renderer.setRenderTarget(null);
        super.render();
    }

    addObject() {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                bg: { value: new THREE.TextureLoader().load('/imgs/pic3.png') },
                resolution: { value: new THREE.Vector4() },
                mask: { value: new THREE.TextureLoader().load('/imgs/blob.png') },

            },
            transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
        })

        // this.imageAspect = 737 / 1280;
        // let a1, a2;
        // if (this.height / this.width > this.imageAspect) {
        //     a1 = (this.width / this.height) * this.imageAspect;
        //     a2 = 1;
        // } else {
        //     a1 = 1;
        //     a2 = (this.height / this.width) * this.imageAspect;
        // }

        // this.material!.uniforms.resolution.value.x = this.width;
        // this.material!.uniforms.resolution.value.y = this.height;
        // this.material!.uniforms.resolution.value.z = a1;
        // this.material!.uniforms.resolution.value.w = a2;


        this.geomotry = new THREE.PlaneGeometry(2, 2, 1, 1);
        this.plane = new THREE.Mesh(this.geomotry, this.material);
        this.scene.add(this.plane);
        this.plane.position.z = 0.01;

        const bgMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2, 1, 1),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('/imgs/pic2.png'),
            })
        );

        this.scene.add(bgMesh);
    }

    raycasterEvent() {
        window.addEventListener('pointermove', (e) => {
            this.pointer.x = (e.clientX / this.width) * 2 - 1;
            this.pointer.y = -(e.clientY / this.height) * 2 + 1;

            this.raycaster.setFromCamera(this.pointer, this.camera);
            const intersects = this.raycaster.intersectObjects([this.plane!])
            if (intersects[0]) {
                this.point.copy(intersects[0].point)
            }
        })
    }

    addBlob() {
        const num = 20;
        const blob = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.5),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('/imgs/blob.png'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                opacity: 0.9,
            })
        )

        blob.position.z = 0.1;

        for (let i = 0; i < num; i++) {
            const b = blob.clone();
            const thera = range(0, 2 * Math.PI);
            const r = range(0.1, 0.2);
            b.position.x = r * Math.sin(thera);
            b.position.y = r * Math.cos(thera);
            b.userData.life = range(-Math.PI * 2, Math.PI * 2);
            this.blobs.push(b);
            this.scene1.add(b);
        }
    }

    updateBlobs() {
        this.blobs.forEach(b => {
            b.userData.life += 0.2;
            b.scale.setScalar(Math.sin(0.5 * b.userData.life));

            if (b.userData.life > 2 * Math.PI) {
                b.userData.life = -2 * Math.PI;

                const thera = range(0, 2 * Math.PI);
                const r = range(0.05, 0.14);

                b.position.x = this.point.x + r * Math.sin(thera);
                b.position.y = this.point.y + r * Math.cos(thera);
            }

        })
    }
}  
