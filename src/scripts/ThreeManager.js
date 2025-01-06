import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { idToCoordinates, coordinatesToId } from "./general.js";

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

        this.urlPlayerTankModels = [
            '/models/tank1.glb',    // 0
            '/models/tank2.glb',    // 1
        ]
        this.urlNpcTankModels = [
            '/models/npcTank1.glb'
        ]

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

        let textureLoader = new THREE.TextureLoader();
        let floor1Texture = textureLoader.load('/sprites/floor1.png');
        let floor2Texture = textureLoader.load('/sprites/floor2.png');
        let floor3Texture = textureLoader.load('/sprites/floor3.png');
        let floor4Texture = textureLoader.load('/sprites/floor4.png');
        floor1Texture.colorSpace = THREE.SRGBColorSpace;
        floor2Texture.colorSpace = THREE.SRGBColorSpace;
        floor3Texture.colorSpace = THREE.SRGBColorSpace;
        floor4Texture.colorSpace = THREE.SRGBColorSpace;

        this.boxGeometry = new THREE.BoxGeometry(1, 1.4, 1);
        this.materials = [
            new THREE.MeshBasicMaterial({ map: floor1Texture }), // пол
            new THREE.MeshBasicMaterial({ map: floor2Texture }), // пол
            new THREE.MeshBasicMaterial({ map: floor3Texture }), // пол
            new THREE.MeshBasicMaterial({ map: floor4Texture }), // пол
            new THREE.MeshBasicMaterial({ color: 0xb5c3c1 }), // бетонная стена
            new THREE.MeshBasicMaterial({ color: 0x4bc8e4 }), // вода
            new THREE.MeshBasicMaterial({ color: 0x1fad6d }), // тент
        ];
        this.bulletOrigin;
        this.player1TankMesh; 
        this.player2TankMesh;
        this.npc1TankOrigin;

        this.water3D = new THREE.Object3D();
        this.covers3D = new THREE.Object3D();
        this.blocks3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';
        this.floors1 = []; //Массив с плоскостями пола, затем преобразовываем в единый объект
        this.floors2 = [];
        this.floors3 = [];
        this.floors4 = [];
        this.floor3D_1 = new THREE.Object3D();
        this.floor3D_2 = new THREE.Object3D();
        this.floor3D_3 = new THREE.Object3D();
        this.floor3D_4 = new THREE.Object3D();
    }

    async initAsync(){
        this.bulletOrigin = (await this.gltfLoader.loadAsync('/models/bullet.glb')).scene.children[0];
        //model.material.map.minFilter = THREE.LinearFilter <------ Вернуть когда появится настоящий материал
        
        let player1TankOrigin = (await this.gltfLoader.loadAsync(this.urlPlayerTankModels[0])).scene.children[0];
        let player2TankOrigin = (await this.gltfLoader.loadAsync(this.urlPlayerTankModels[1])).scene.children[0];
        player1TankOrigin.material.map.minFilter = THREE.LinearFilter;
        player2TankOrigin.material.map.minFilter = THREE.LinearFilter;
        this.player1TankMesh = new THREE.Mesh(player1TankOrigin.geometry, player1TankOrigin.material);
        this.player2TankMesh = new THREE.Mesh(player2TankOrigin.geometry, player2TankOrigin.material);
    
        this.npc1TankOrigin = (await this.gltfLoader.loadAsync(this.urlNpcTankModels[0])).scene.children[0];
        this.npc1TankOrigin.material.map.minFilter = THREE.LinearFilter;
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

    createPlayerTank()
    {

    }

    createNpcTank()
    {
        return new THREE.Mesh(this.npc1TankOrigin.geometry, this.npc1TankOrigin.material);
    }

    createWater(posX, posY, posZ){
        let p = new THREE.Mesh(this.plane, this.materials[5]);
        p.position.set(posX, posY, posZ);
        p.rotation.x = (-90 * Math.PI) / 180;
        this.water3D.add(p);
    }

    createFloor(posX, posY, posZ){
        let p = this.plane.clone(); // Плоскости
        p.rotateX((-90 * Math.PI) / 180);
        p.translate(posX, posY, posZ);
        posX -= 0.5;
        posZ += 0.5;
        if (posX % 2 === 0 && posZ % 2 === 0)  // 0, 0
        {
            this.floors1.push(p);
        }
        else if (posX % 2 === 0 && posZ % 2 === 1) // 0, 1
        {
            this.floors2.push(p);
        }
        else if (posX % 2 === 1 && posZ % 2 === 1) // 1, 1
        {
            this.floors3.push(p);
        }
        else {
            this.floors4.push(p);
        }
        
    }

    createCover(posX, posY, posZ){
        let p = new THREE.Mesh(this.plane, this.materials[6]);
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
        let cube = new THREE.Mesh(this.boxGeometry, this.materials[4]);
        cube.name = coordinatesToId(j, i, length);
        cube.position.set(posX, posY, posZ);
        this.blocks3D.add(cube);
    }

    createBullet(){
        return new THREE.Mesh(this.bulletOrigin.geometry, this.bulletOrigin.material);
    }

    addToScene(){
        let floorMerge1 = BufferGeometryUtils.mergeGeometries([...this.floors1]);
        let floorMerge2 = BufferGeometryUtils.mergeGeometries([...this.floors2]);
        let floorMerge3 = BufferGeometryUtils.mergeGeometries([...this.floors3]);
        let floorMerge4 = BufferGeometryUtils.mergeGeometries([...this.floors4]);
        this.floors1 = [];
        this.floors2 = [];
        this.floors3 = [];
        this.floors4 = [];
        this.floor3D_1 = new THREE.Mesh(floorMerge1, this.materials[0]);
        this.floor3D_2 = new THREE.Mesh(floorMerge2, this.materials[1]);
        this.floor3D_3 = new THREE.Mesh(floorMerge3, this.materials[2]);
        this.floor3D_4 = new THREE.Mesh(floorMerge4, this.materials[3]);

        this.scene.add(this.water3D);
        this.scene.add(this.covers3D);
        this.scene.add(this.blocks3D);
        this.scene.add(this.bricks3D);
        this.scene.add(this.floor3D_1);
        this.scene.add(this.floor3D_2);
        this.scene.add(this.floor3D_3);
        this.scene.add(this.floor3D_4);
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
        this.floor3D_1.clear();
        this.floor3D_2.clear();
        this.floor3D_3.clear();
        this.floor3D_4.clear();
    }

    render(){
        this.renderer.render(this.scene, this.camera);
    }
}