import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

interface ConProps {
    dom: HTMLCanvasElement
}


export default class Sketch extends Scene {
    time: number = 0;
    material?: THREE.MeshStandardMaterial;
    material1?: THREE.MeshStandardMaterial;
    scene1: THREE.Scene = new THREE.Scene();
    group: THREE.Group = new THREE.Group();
    group1: THREE.Group = new THREE.Group();
    uniforms: any = {};
    uniforms1: any = {};


    constructor({ dom }: ConProps) {
        super({ dom });
        this.init();
        this.fixed();
        this.scene.add(this.group);
        this.scene1.add(this.group1);
        this.load();

    }

    setCamera() {
        const frustumSize = 0.7;
        const aspect = this.width / this.height;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000
        );
        this.camera.position.set(0, 0, -2);

        this.camera.updateProjectionMatrix();
    }

    setRenderer() {
        super.setRenderer();
        this.renderer.setClearColor(0x444444, 1);
        this.renderer.setScissorTest(true);
    }

    render() {
        this.time += 0.001;
        this.renderer.setScissor(0, 0, this.width / 2, this.height);
        // this.renderer.setScissor(0, 0, this.width, this.height);
        this.uniforms.time.value = this.time;
        this.uniforms1.time.value = this.time;

        super.render();
        this.renderer.setScissor(this.width / 2, 0, this.width / 2, this.height);
        this.renderer.render(this.scene1, this.camera);

    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(light1);
        this.scene1.add(light1.clone());

        const light2 = new THREE.DirectionalLight(0x00ffff, 0.5);
        light2.position.set(0, -1, 0);
        this.scene.add(light2);
        this.scene1.add(light2.clone());

        const light3 = new THREE.DirectionalLight(0xff6600, 0.8);
        light3.position.set(1, 1, 0);
        this.scene.add(light3);
        this.scene1.add(light3.clone());
    }

    getMaterial(uniforms: any) {
        let material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        material.onBeforeCompile = (shader) => {
            // shader.uniforms = { ...this.uniforms };
            shader.uniforms.time = uniforms.time;
            shader.uniforms.uMin = uniforms.uMin;
            shader.uniforms.uMax = uniforms.uMax;
            shader.uniforms.uOffset = uniforms.uOffset;

            shader.fragmentShader = `
                varying float vDiscard;
            `+ shader.fragmentShader;

            shader.vertexShader = `
                uniform float time;
                uniform vec3 uMin;
                uniform vec3 uMax;
                uniform float uOffset;
                varying float vDiscard;

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
                float mapRange(float value, float inMin, float inMax, float outMin, float outMax){
                    return outMin + (outMax-outMin) * (value-inMin) / (inMax-inMin);
                }
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                `#include <beginnormal_vertex>`,
                `#include <beginnormal_vertex>` + `
                    vec3 temp = objectNormal;
                    float xx = mapRange(position.x,uMin.x, uMax.x, -1., 1.);
                    float theta = (xx + time + uOffset*0.5)*2.*PI;
                    vDiscard = mod(xx + time + mix(0.25,-0.25,uOffset)+uOffset*0.5, 2.);
                    temp = rotate(temp, vec3(0., 0., 1.), theta);
                    objectNormal = temp;
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>` + `
                    vec3 pos = transformed;
                    vec3 dir = vec3(sin(theta), cos(theta), 0.);
                    pos = 0.2 * dir + vec3(0., 0., pos.z) + dir * pos.y;

                    transformed = pos;
                `
            )

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <opaque_fragment>`,
                `#include <opaque_fragment>` + `
                    float dontshow = step(1., vDiscard);
                    if(dontshow>0.5) discard;
                `
            )

        }

        return material;
    }

    addObject() {
        // this.material = new THREE.ShaderMaterial({
        //     side: THREE.DoubleSide,
        //     uniforms: {
        //         time: { value: 0 },
        //         uMin: { value: new THREE.Vector3() },
        //         uMax: { value: new THREE.Vector3() },
        //     },
        //     vertexShader: vertex,
        //     fragmentShader:fragment
        // })

        this.uniforms = {
            time: { value: 0 },
            uMin: { value: new THREE.Vector3() },
            uMax: { value: new THREE.Vector3() },
            uOffset: { value: 0 },
        };

        this.uniforms1 = {
            time: { value: 0 },
            uMin: { value: new THREE.Vector3() },
            uMax: { value: new THREE.Vector3() },
            uOffset: { value: 1 },
        };

        this.material = this.getMaterial(this.uniforms);
        this.material1 = this.getMaterial(this.uniforms1);

        const loader = new FontLoader();
        loader.load('/font/font.json', (font) => {
            let geometry = new TextGeometry('IMPOSSIBLE', {
                font: font,
                size: 0.1,
                height: 0.1,
                curveSegments: 50,
                bevelEnabled: false,
            });
            // let dummy = new THREE.BoxGeometry(0.15, 0.00001, 0.0001).toNonIndexed();
            // let clone = geometry.clone();
            // clone.computeBoundingBox();
            // dummy.translate(clone.boundingBox!.max.x, 0, 0);
            // let final = mergeGeometries([dummy, clone]);

            geometry.center();
            geometry.computeBoundingBox();

            let final1 = geometry.clone();
            final1.computeBoundingBox();


            let clones = [];
            for (let i = 0; i < 4; i++) {
                let clone = final1.clone();
                clone.center();
                clone.rotateX(i * Math.PI / 2);
                clone.translate(final1.boundingBox!.max.x * i * 2, 0, 0);
                clones.push(clone);
            }

            let superFinal = mergeGeometries(clones);
            superFinal.center();
            superFinal.computeBoundingBox();


            this.uniforms.uMin.value = superFinal.boundingBox?.min;
            this.uniforms.uMax.value = superFinal.boundingBox?.max;

            this.uniforms1.uMin.value = superFinal.boundingBox?.min;
            this.uniforms1.uMax.value = superFinal.boundingBox?.max;

            const mesh = new THREE.Mesh(superFinal, this.material);
            const mesh1 = new THREE.Mesh(superFinal, this.material1);

            this.group.add(mesh);
            this.group1.add(mesh1);

            this.group.rotation.x = Math.PI / 4;
            this.group1.rotation.x = -Math.PI / 4;

        })
    }

}  
