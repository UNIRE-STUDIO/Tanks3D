import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default class ThreeManager {
    constructor(uiFields, config){
        this.uiFields = uiFields;
        this.config = config;
        this.scene = new THREE.Scene();
        const canvas = document.querySelector(".canvas");
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas,
            alpha: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);

        ////

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            10,
            40
        );
        this.camera.position.set(this.config.viewSize.x / 2, 17, 25);
        this.camera.lookAt(
            new THREE.Vector3(
                this.config.viewSize.x / 2,
                0,
                this.config.viewSize.y / 2
            )
        );

        window.addEventListener("resize", () => {
            this.updateCameraFov();
            if (uiFields.currentScreen === 0) return;
            this.renderer.render(this.scene, this.camera);
        });
        this.updateCameraFov();

        this.ambient = new THREE.AmbientLight(0xffffff, 1);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);

        this.scene.add(this.directionalLight);
        this.scene.add(this.ambient);

        this.plane = new THREE.PlaneGeometry(1, 1, 1, 1);

        // block1
        this.block1;
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load("/models/block1.glb", (gltf) => {
            this.block1 = gltf.scene.children[0];
            this.block1.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.block1.material.map.magFilter = THREE.LinearFilter;
            this.block1.scale.set(1, 1.4, 1);
        });

        this.boxGeometry = new THREE.BoxGeometry(1, 1.4, 1);
        this.materials = [
            new THREE.MeshBasicMaterial({ color: 0x242424 }), // пол
            new THREE.MeshBasicMaterial({ color: 0xb5c3c1 }), // бетонная стена
            new THREE.MeshBasicMaterial({ color: 0x4bc8e4 }), // вода
            new THREE.MeshBasicMaterial({ color: 0x1fad6d }), // тент
        ];
        this.bulletOrigin;

        this.water3D = new THREE.Object3D();
        this.covers3D = new THREE.Object3D();
        this.blocks3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';
        this.floor3D = new THREE.Object3D();
    }

    async initAsync(){
        await this.gltfLoader.loadAsync('/models/bullet.glb', (gltf) => {
            console.log(gltf);
            return gltf.scene.children[0];
            //model.material.map.minFilter = THREE.LinearFilter <------ Вернуть когда появится настоящий материал
        })
    }

    updateCameraFov() {
        let hw = window.innerHeight / window.innerWidth;
        let wh = window.innerWidth / window.innerHeight;
        this.camera.aspect = wh;
        this.camera.fov = 60;
        if (wh < 1.8) {
            this.camera.fov = 60 * hw * 1.9;
        }
        if (wh < 1.4) {
            this.camera.fov = 60 * hw * 1.7;
        }
        if (wh < 1.1) {
            this.camera.fov = 60 * hw * 1.6;
        }
        if (wh < 0.9) {
            this.camera.fov = 60 * hw * 1.5;
        }
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    createWater(posX, posY, posZ){
        let p = new THREE.Mesh(this.plane, this.materials[2]);
        p.position.set(posX, posY, posZ);
        p.rotation.x = (-90 * Math.PI) / 180;
        this.water3D.add(p);
    }

    createFloor(posX, posY, posZ){
        let p = this.plane.clone(); // Плоскости
        p.rotateX((-90 * Math.PI) / 180);
        p.translate(posX, posY, posZ);
        floor1.push(p);
    }

    createCover(posX, posY, posZ){
        let p = new THREE.Mesh(this.plane, this.materials[3]);
        p.position.set(posX, posY, posZ);
        p.rotation.x = (-90 * Math.PI) / 180;
        this.covers3D.add(p);
    }

    createBrick(posX, posY, posZ, j, i, length){
        let b1 = new THREE.Mesh(this.block1.geometry, this.block1.material);
        b1.scale.set(1, 1.4, 1);
        b1.name = coordinatesToId(j, i, length);
        b1.position.set(posX, posY, posZ);
        this.bricks3D.add(b1);
    }

    createBlock(posX, posY, posZ, j, i, length){
        let cube = new THREE.Mesh(this.boxGeometry, this.materials[1]);
        cube.name = coordinatesToId(j, i, length);
        cube.position.set(posX, posY, posZ);
        this.blocks3D.add(cube);
    }

    createBullet(){
        return new THREE.Mesh(this.bulletOrigin.geometry, this.bulletOrigin.material);
    }

    addToScene(){
        let floorMerge = BufferGeometryUtils.mergeGeometries([...floor1]);
        this.floor3D.add(new THREE.Mesh(floorMerge, this.materials[0]));
        this.scene.add(this.water3D);
        this.scene.add(this.covers3D);
        this.scene.add(this.blocks3D);
        this.scene.add(this.bricks3D);
        this.scene.add(this.floor3D);
    }

    removeBlock(posX, posY, length){
        let nameObj = this.scene.getObjectByName(
            coordinatesToId(posX, posY, length)
        );
        this.scene.getObjectByName('bricks').remove(nameObj);
    }

    reset(){
        this.water3D.clear();
        this.covers3D.clear();
        this.blocks3D.clear();
        this.bricks3D.clear();
        this.floor3D.clear();
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }
}