import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import angel from '../../public/models/angel.glb';
import { CustomMaterial, extendMaterial } from './extend.js';

interface ConProps {
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    material?: THREE.ShaderMaterial;
    material1?: THREE.MeshStandardMaterial;
    geometry?: THREE.BufferGeometry;
    mesh?: THREE.Mesh;
    time: number = 0;
    gui?: dat.GUI;
    settings: any;


    constructor({ dom }: ConProps) {
        super({ dom });
        this.settings = {
            progress: 0,
        }
        this.setGUI();
        this.init();
        this.load();

    }

    setCamera() {
        this.camera.position.set(0, 0, 2);
    }

    setRenderer() {
        super.setRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    async setGUI() {
        const dat = await import('dat.gui');
        if (!this.gui) {
            this.gui = new dat.GUI();
            this.gui.add(this.settings, 'progress', 0, 1, 0.01);
        }
    }

    init() {
        super.init();
        this.setLoader();
    }

    render() {
        this.time += 0.01;
        this.material!.uniforms.time.value = this.time;
        //@ts-ignore
        this.material1!.uniforms.time.value = this.time;
        //@ts-ignore
        this.material1!.uniforms.progress.value = this.settings.progress;
        super.render();
    }
    addObject() {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 15, 100, 100),
            new THREE.MeshStandardMaterial({ color: 0xffffff }),
        );

        floor.rotation.x = -Math.PI * 0.5;
        floor.position.y = -1.1;
        floor.castShadow = false;
        floor.receiveShadow = true;
        this.scene.add(floor);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            wireframe: true,

        });

        this.material1 = new THREE.MeshStandardMaterial({ color: 0x00ffff });

        //@ts-ignore
        this.material1 = extendMaterial(THREE.MeshStandardMaterial, {
            //@ts-ignore
            class: CustomMaterial,  // In this case ShaderMaterial would be fine too, just for some features such as envMap this is required

            vertexHeader: `
                attribute float aRandom;
                attribute vec3 aCenter;
                uniform float time;
                uniform float progress;

                mat4 rotationMatrix(vec3 axis, float angle) {
                    axis = normalize(axis);
                    float s = sin(angle);
                    float c = cos(angle);
                    float oc = 1.0 - c;

                    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                                0.0,                                0.0,                                0.0,                                1.0);
                }

                vec3 rotate(vec3 v, vec3 axis, float angle) {
                    mat4 m = rotationMatrix(axis, angle);
                    return (m * vec4(v, 1.0)).xyz;
                }
            `,
            vertex: {
                transformEnd: `
                    float prog = (position.y+100.)/200.;
                    float locprog = clamp((progress-0.8*prog)/0.2,0.,1.);

                    // locprog = progress;

                    transformed = transformed-aCenter;
                    transformed += 3.*normal*aRandom*(locprog);

                    transformed *= (1.-locprog);

                    transformed += aCenter;
                    transformed = rotate(transformed, vec3(0.0,1.0,0.0), aRandom*(locprog)*3.14*1.);
                `
            },

            uniforms: {
                roughness: 0.75,
                time: {
                    mixed: true,    // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true,   // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0
                },
                progress: {
                    mixed: true,    // Uniform will be passed to a derivative material (MeshDepthMaterial below)
                    linked: true,   // Similar as shared, but only for derivative materials, so wavingMaterial will have it's own, but share with it's shadow material
                    value: 0
                }
            }

        });
        //@ts-ignore
        this.material1.uniforms.diffuse.value = new THREE.Color(0x00ffff);

        // this.geometry = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();
        // this.geometry = new THREE.IcosahedronGeometry(1, 8).toNonIndexed();

        this.loader?.load(angel, (gltf) => {
            console.log(gltf);
            const group = gltf.scene;
            group.traverse((m) => {
                if (m instanceof THREE.Mesh) {
                    m.scale.set(0.01, 0.01, 0.01);
                    m.rotation.set(Math.PI, 0, 0);
                    m.material = this.material1;
                    const geometry = m.geometry.toNonIndexed();
                    m.geometry = geometry.toNonIndexed();
                    m.castShadow = true;
                    //@ts-ignore
                    m.customDepthMaterial = extendMaterial(THREE.MeshDepthMaterial, {
                        template: this.material1
                    });
                    this.scene.add(m);


                    const len = geometry.attributes.position.count;
                    const randoms = new Float32Array(len);
                    const centers = new Float32Array(len * 3);

                    for (let i = 0; i < len; i += 3) {
                        const r = Math.random();
                        randoms[i] = r;
                        randoms[i + 1] = r;
                        randoms[i + 2] = r;

                        const x = geometry.attributes.position.array[i * 3];
                        const y = geometry.attributes.position.array[i * 3 + 1];
                        const z = geometry.attributes.position.array[i * 3 + 2];

                        const x1 = geometry.attributes.position.array[i * 3 + 3];
                        const y1 = geometry.attributes.position.array[i * 3 + 4];
                        const z1 = geometry.attributes.position.array[i * 3 + 5];

                        const x2 = geometry.attributes.position.array[i * 3 + 6];
                        const y2 = geometry.attributes.position.array[i * 3 + 7];
                        const z2 = geometry.attributes.position.array[i * 3 + 8];

                        const center = new THREE.Vector3(x, y, z)
                            .add(new THREE.Vector3(x1, y1, z1))
                            .add(new THREE.Vector3(x2, y2, z2))
                            .divideScalar(3);

                        centers.set([center.x, center.y, center.z], i * 3);
                        centers.set([center.x, center.y, center.z], (i + 1) * 3);
                        centers.set([center.x, center.y, center.z], (i + 2) * 3);

                    }

                    geometry.setAttribute(
                        'aRandom',
                        new THREE.BufferAttribute(randoms, 1)
                    );

                    geometry.setAttribute(
                        'aCenter',
                        new THREE.BufferAttribute(centers, 3)
                    );

                    // this.mesh = new THREE.Mesh(geometry, this.material1);

                    // //@ts-ignore
                    // this.mesh!.customDepthMaterial = extendMaterial(THREE.MeshDepthMaterial, {

                    //     template: this.material1

                    // });

                    // this.mesh.castShadow = this.mesh.receiveShadow = true;
                }
            })
        })


        // this.scene.add(this.mesh);
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(light1);

        const light2 = new THREE.SpotLight(0xfffff, 1, 0, Math.PI / 3, 0.3);
        light2.position.set(0, 2, 2);
        light2.target.position.set(0, 0, 0);

        light2.castShadow = true;
        light2.shadow.camera.near = 0.1;
        light2.shadow.camera.far = 9;
        light2.shadow.bias = 0.001;

        light2.shadow.mapSize.width = 2048;
        light2.shadow.mapSize.height = 2048;
        this.scene.add(light2);
    }

}  
