import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default class ThreeManager {
    constructor(uiFields){
        
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
        const gltfLoader = new GLTFLoader();
        gltfLoader.load("/models/block1.glb", (gltf) => {
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

        this.water3D = new THREE.Object3D();
        this.covers3D = new THREE.Object3D();
        this.blocks3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';
        this.floor3D = new THREE.Object3D();
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
}