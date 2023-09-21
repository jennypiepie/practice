import * as THREE from 'three';
import tank from '../../public/models/tank.glb';
import sunflower from '../../public/models/sunflower.glb';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Scene from '../scene';

interface ConProps{
    dom: HTMLCanvasElement
}

export default class Sketch extends Scene {
    tank: THREE.Group = new THREE.Group();
    raycaster: THREE.Raycaster = new THREE.Raycaster();
    point: THREE.Vector2 = new THREE.Vector2();
    count: number;
    ages: Float32Array;
    scales: Float32Array;
    growthSpeed: Float32Array;
    dummy: THREE.Object3D;
    _position: THREE.Vector3;
    _positions: THREE.Vector3[] = [];
    _normal: THREE.Vector3;
    _normals: THREE.Vector3[] = [];
    _scale: THREE.Vector3;
    flowers?: THREE.InstancedMesh;
    sampler?: MeshSurfaceSampler;
    finalMesh?: THREE.Mesh;
    currentPoint?: THREE.Vector3;
    sunflower?: THREE.Mesh;

    constructor({ dom }: ConProps) {
        super({dom});
        
        this.count = 1000;
        this.ages = new Float32Array(this.count);
        this.scales = new Float32Array(this.count);
        this.growthSpeed = new Float32Array(this.count);
        this.dummy = new THREE.Object3D();

        this._position = new THREE.Vector3();
        this._normal = new THREE.Vector3();
        this._scale = new THREE.Vector3();

        this.init();
        this.load();
    }

    setCamera() {
        this.camera.position.set(4, 2, 2);
    }

    setRenderer() {
        super.setRenderer();
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    init() {
        super.init();
        this.setLoader();
    }

    load() {
        let gms: THREE.BufferGeometry[] = [];
        this.loader?.load(tank, (gltf) => {
            this.tank = gltf.scene;
            let t = 0;
            this.tank.traverse((m) => {
                t++;
                if (m instanceof THREE.Mesh) {
                    m.castShadow = m.receiveShadow = true;
                    m.geometry.computeVertexNormals();
                    if(t%4===0) m.material = new THREE.MeshStandardMaterial({ wireframe: true, color: 0x00ffff });
                    gms.push(m.geometry)
                }
            })

            let finalGM = mergeGeometries(gms);
            this.finalMesh = new THREE.Mesh(finalGM, new THREE.MeshNormalMaterial());
            this.scene.add(this.tank);

            this.loader?.load(sunflower, (gltf) => {    
                this.sunflower = gltf.scene.children[0].children[0].children[0] as THREE.Mesh;
                this.addObject();
                this.render();
                this.event();
            })
        })
    }
    
    render() {
        for (let i = 0; i < this.count; i++){
            this.rescale(i);
        }
        this.flowers!.instanceMatrix.needsUpdate = true;
        super.render();
    }

    rescale(i: number) {
        
        this.dummy.position.copy(this._positions[i]);
        let d = this.currentPoint?.distanceTo(this._positions[i])!;
        
        if (d < 1) {
            this.growthSpeed[i] += 0.005;
        } else {
            this.growthSpeed[i] *= 0.9;
        }

        this.scales[i] += this.growthSpeed[i];
        this.scales[i] = Math.min(1, this.scales[i]);

        this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
        this.dummy.lookAt(this._normals[i]);
        this.dummy.updateMatrix();
        this.flowers?.setMatrixAt(i, this.dummy.matrix);
        
    }

    addObject() {
        this.finalMesh && (this.sampler = new MeshSurfaceSampler(this.finalMesh)
            .setWeightAttribute('uv').build());
        let s = 0.004;
        this.sunflower?.geometry.scale(s, s, s);

        this.flowers = new THREE.InstancedMesh(
            this.sunflower?.geometry,
            this.sunflower?.material,
            this.count
        );

        this.flowers.receiveShadow = this.flowers.castShadow = true;

        for (let i = 0; i < this.count; i++){
            this.scales[i] = 0.1;
            this.growthSpeed[i] = 0;

            this._positions.push(this._position.clone());
            this._normals.push(this._normal.clone());

            this.sampler && this.sampler.sample(this._position, this._normal);
            this._normal.add(this._position);

            this.dummy.position.copy(this._position);
            this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
            this.dummy.lookAt(this._normal);
            this.dummy.updateMatrix();

            this.flowers.setMatrixAt(i, this.dummy.matrix);           

        }
        
        this.flowers.instanceMatrix.needsUpdate = true;
        this.scene.add(this.flowers)
    }

    addLights() {
        const light1 = new THREE.AmbientLight(0xffffff, 0.3);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.8*Math.PI);
        light2.castShadow = true;
        light2.shadow.camera.near = 0.1;
        light2.shadow.camera.far = 20;
        light2.shadow.bias = -0.01;
        light2.shadow.camera.right = 10;
        light2.shadow.camera.left = -10;
        light2.shadow.camera.top = 10;
        light2.shadow.camera.bottom = -10;
        light2.shadow.mapSize.width = 2048;
        light2.shadow.mapSize.height = 2048;
        light2.position.set(3.7, 3, 0);

        this.scene.add(light1);
        this.scene.add(light2);
    }

    event() {
        window.addEventListener('pointermove', (event) => {
            this.point.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.point.y = - (event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.point, this.camera);
            const intersect = this.raycaster.intersectObjects(this.tank.children[0].children);
            if (intersect.length > 0) {
                this.currentPoint = intersect[0].point;
            }
        })
    }
}
