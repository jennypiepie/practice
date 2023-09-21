import * as THREE from 'three';
import Scene from '../scene';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

import { MSDFTextGeometry, uniforms } from "three-msdf-text-utils";
import fnt from '../../public/font/KitschyRetroRegular-9YnqB-msdf.json';
import VirtualScroll from 'virtual-scroll';

interface ConProps{
    dom: HTMLCanvasElement
}

const TEXTS = [
    'Supine',
    'Solitude',
    'Aurora',
    'Idyllic',
    'Euphoria',
    'Eloquence',
    'Clinomania'
];

const textureURLs = [
    '/imgs/pic1.png',
    '/imgs/pic2.png',
    '/imgs/pic3.png',
    '/imgs/pic4.png',
    '/imgs/pic5.png',
    '/imgs/pic6.png',
    '/imgs/pic7.png',
];

export default class Sketch extends Scene {
    settings: any;
    material?: THREE.ShaderMaterial;
    size: number = 0;
    scroller: any = new VirtualScroll();
    position: number = 0;
    group: THREE.Group = new THREE.Group();
    speed: number = 0;
    targetSpeed: number = 0;
    planeMaterial?: THREE.ShaderMaterial;
    plane?: THREE.Mesh;
    planeGroup: THREE.Group = new THREE.Group();
    textures: THREE.Texture[] = [];
    sceneCopy: THREE.Scene = new THREE.Scene();
    groupCopy: THREE.Group = new THREE.Group();
 
    constructor({ dom }: ConProps) {
        super({ dom });
        this.renderer = new THREE.WebGLRenderer({
            canvas: dom,
            antialias: true,
            alpha: true
        });
        this.init();

        this.scroller.on((event: any) => {
            this.position = event.y / 2000;
            this.speed = event.deltaY / 1000;
        });

        this.scene.add(this.group);
        this.scene.add(this.planeGroup);
        this.sceneCopy.add(this.groupCopy);

        this.textures = textureURLs.map(t => new THREE.TextureLoader().load(t));

        this.addText();
        this.load();

    }

    init() {
        this.setCamera();
        this.setRenderer();     
        this.setupResize();
        this.addLights();
    }

    setRenderer() {
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.autoClear = false;
    }
    
    setCamera() {
        this.camera.position.set(0, 0, 6);
    }

    render() {
        this.group.position.y = -this.position * this.size;
        this.groupCopy.position.y = -this.position * this.size;
        this.speed *= 0.9;
        this.targetSpeed += (this.speed - this.targetSpeed) * 0.1;
        this.material!.uniforms.uSpeed.value = this.targetSpeed;
        this.plane!.rotation.y = this.position * Math.PI * 2;
        this.planeGroup.rotation.z = 0.2 * Math.sin(this.position * 0.5);
        this.updateTexture();
        super.render();
        this.renderer.clearDepth();
        this.renderer.render(this.sceneCopy, this.camera);
    }

    updateTexture() {
        let index = Math.round(this.position + 1000) % this.textures.length;
        this.planeMaterial!.uniforms.uTexture.value = this.textures[index];

        this.groupCopy.children.forEach((mesh, i) => {
            mesh.visible = (i == index);
        })
    }

    addObject() {
        this.planeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: this.textures[0] },
            },
            side: THREE.DoubleSide,
            vertexShader: vertex,
            fragmentShader: fragment,
        });
        const geometry = new THREE.PlaneGeometry(1.77 * 1.2, 1 * 1.2, 10, 10).translate(0, 0, 3);
        
        const pos = geometry.attributes.position.array;
        const newPos = [];
        const r = 4;

        for (let i = 0; i < pos.length; i+=3){
            let x = pos[i];
            let y = pos[i + 1];
            let z = pos[i + 2];

            let xz = new THREE.Vector2(x, z).normalize().multiplyScalar(r);            
            newPos.push(xz.x, y, xz.y);

            // let xyz = new THREE.Vector3(x, y, z).normalize().multiplyScalar(r);
            // newPos.push(xyz.x, xyz.y, xyz.z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
        this.plane = new THREE.Mesh(geometry, this.planeMaterial);
        this.planeGroup.add(this.plane);
    }

    addText() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            defines: {
                IS_SMALL: false,
            },
            extensions: {
                derivatives: true,
            },
            uniforms: {
                uSpeed: { value: 0 },
                // Common
                ...uniforms.common,
                
                // Rendering
                ...uniforms.rendering,
                
                // Strokes
                ...uniforms.strokes,
            },
            vertexShader: `
                // Attribute
                attribute vec2 layoutUv;

                attribute float lineIndex;

                attribute float lineLettersTotal;
                attribute float lineLetterIndex;

                attribute float lineWordsTotal;
                attribute float lineWordIndex;

                attribute float wordIndex;

                attribute float letterIndex;

                // Varyings
                varying vec2 vUv;
                varying vec2 vLayoutUv;
                varying vec3 vViewPosition;
                varying vec3 vNormal;

                varying float vLineIndex;

                varying float vLineLettersTotal;
                varying float vLineLetterIndex;

                varying float vLineWordsTotal;
                varying float vLineWordIndex;

                varying float vWordIndex;

                varying float vLetterIndex;

                uniform float uSpeed;

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

                void main() {

                    // Varyings
                    vUv = uv;
                    vLayoutUv = layoutUv;
                    vNormal = normal;

                    vLineIndex = lineIndex;

                    vLineLettersTotal = lineLettersTotal;
                    vLineLetterIndex = lineLetterIndex;

                    vLineWordsTotal = lineWordsTotal;
                    vLineWordIndex = lineWordIndex;

                    vWordIndex = wordIndex;

                    vLetterIndex = letterIndex;

                    // Output
                    vec3 newPos = position;
                    float xx = position.x * 0.008;
                    newPos = rotate(newPos, vec3(0.0, 0.0, 1.0), uSpeed*xx*xx);

                    vec4 mvPosition = vec4(newPos, 1.0);
                    mvPosition = modelViewMatrix * mvPosition;
                    gl_Position = projectionMatrix * mvPosition;

                    vViewPosition = -mvPosition.xyz;
                }
            `,
            fragmentShader: `
                // Varyings
                varying vec2 vUv;

                // Uniforms: Common
                uniform float uOpacity;
                uniform float uThreshold;
                uniform float uAlphaTest;
                uniform vec3 uColor;
                uniform sampler2D uMap;

                // Uniforms: Strokes
                uniform vec3 uStrokeColor;
                uniform float uStrokeOutsetWidth;
                uniform float uStrokeInsetWidth;

                // Utils: Median
                float median(float r, float g, float b) {
                    return max(min(r, g), min(max(r, g), b));
                }

                void main() {
                    // Common
                    // Texture sample
                    vec3 s = texture2D(uMap, vUv).rgb;

                    // Signed distance
                    float sigDist = median(s.r, s.g, s.b) - 0.5;

                    float afwidth = 1.4142135623730951 / 2.0;

                    #ifdef IS_SMALL
                        float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
                    #else
                        float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
                    #endif

                    // Strokes
                    // Outset
                    float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

                    // Inset
                    float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

                    #ifdef IS_SMALL
                        float outset = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
                        float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistInset);
                    #else
                        float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
                        float inset = 1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
                    #endif

                    // Border
                    float border = outset * inset;

                    // Alpha Test
                    if (alpha < uAlphaTest) discard;

                    // Output: Common
                    vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

                    // Output: Strokes
                    vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

                    gl_FragColor = vec4(0., 1., 1., 1.);
                }
            `,
        });

        
        Promise.all([
            loadFontAtlas('/font/KitschyRetroRegular-9YnqB.png'),
        ]).then(([atlas]) => {
            this.size = 1.4;
            this.material!.uniforms.uMap.value = atlas;
            TEXTS.forEach((text, i) => {
                const geometry = new MSDFTextGeometry({
                    text: text.toUpperCase(),
                    font: fnt,
                });
                
                const mesh = new THREE.Mesh(geometry, this.material);
                const s = 0.04;
                mesh.scale.set(s, -s, s);
                mesh.position.x = -5;
                mesh.position.y = this.size * i;
                this.group.add(mesh);
                this.groupCopy.add(mesh.clone());
            })


        });

        function loadFontAtlas(path:string) {
            const promise = new Promise((resolve, reject) => {
                const loader = new THREE.TextureLoader();
                loader.load(path, resolve);
            });

            return promise;
        }
    }
}  
