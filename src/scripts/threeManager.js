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
        this.camera.position.set(this.config.viewSize.x / 2, 18, 20);
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

        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        this.directionalLight.castShadow = true;
        let targetDirLight = new THREE.Object3D();
        this.directionalLight.target = targetDirLight;
        this.directionalLight.target.position.set(0.5, 0, -1);
        this.directionalLight.target.updateMatrixWorld(); // Расчитывает положение на сцене (что-бы не добавлять target на сцену)

        this.scene.add(this.directionalLight);
        this.scene.add(this.ambient);

        this.urlNpcTankModels = [
            '/models/npcTank1.glb'
        ]

        this.planeGeomentry = new THREE.PlaneGeometry(1, 1, 1);
        this.planeGeomentry.rotateX((270 * Math.PI) / 180);

        this.brick;
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load("/models/brick.glb", (gltf) => {
            this.brick = gltf.scene.children[0];
            this.brick.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.brick.material.map.magFilter = THREE.LinearFilter;
            this.brick.scale.set(1, 1.4, 1);
        });
        this.block;
        this.gltfLoader.load("/models/block.glb", (gltf) => {
            this.block = gltf.scene.children[0];
            this.block.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.block.material.map.magFilter = THREE.LinearFilter;
            this.block.scale.set(1, 1.4, 1);
        });
        this.border; // -> в Async

        let textureLoader = new THREE.TextureLoader();
        let floor1Texture = textureLoader.load('/sprites/floor1.png');
        let floor2Texture = textureLoader.load('/sprites/floor2.png');
        let floor3Texture = textureLoader.load('/sprites/floor3.png');
        let floor4Texture = textureLoader.load('/sprites/floor4.png');
        floor1Texture.colorSpace = THREE.SRGBColorSpace;
        floor2Texture.colorSpace = THREE.SRGBColorSpace;
        floor3Texture.colorSpace = THREE.SRGBColorSpace;
        floor4Texture.colorSpace = THREE.SRGBColorSpace;

        let floor1NormalTexture = textureLoader.load('/sprites/floor1-normalMap.jpg');
        let floor2NormalTexture = textureLoader.load('/sprites/floor2-normalMap.jpg');
        let floor3NormalTexture = textureLoader.load('/sprites/floor3-normalMap.jpg');
        let floor4NormalTexture = textureLoader.load('/sprites/floor4-normalMap.jpg');

        let waterTexture = textureLoader.load('/sprites/water.jpg');
        waterTexture.wrapS = THREE.RepeatWrapping;
        waterTexture.wrapT = THREE.RepeatWrapping;
        let waterNormalTexture = textureLoader.load("/sprites/water-normalMap.jpg");
        waterNormalTexture.wrapS = THREE.RepeatWrapping;
        waterNormalTexture.wrapT = THREE.RepeatWrapping;

        let grassTexture = textureLoader.load('/sprites/grass128.jpg');
        grassTexture.colorSpace = THREE.SRGBColorSpace;

        this.boxGeometry = new THREE.BoxGeometry(1, 1.4, 1);
        this.materials = [
            new THREE.MeshLambertMaterial({ map: floor1Texture, normalMap: floor1NormalTexture }), // пол
            new THREE.MeshLambertMaterial({ map: floor2Texture, normalMap: floor2NormalTexture }), // пол
            new THREE.MeshLambertMaterial({ map: floor3Texture, normalMap: floor3NormalTexture }), // пол
            new THREE.MeshLambertMaterial({ map: floor4Texture, normalMap: floor4NormalTexture }), // пол
            new THREE.MeshLambertMaterial({ color: 0x3F4141	 }), // стены окружающие воду
            new THREE.MeshLambertMaterial({ map: waterTexture}), // вода
            new THREE.MeshBasicMaterial({ color: 0x1fad6d }), // тент
            new THREE.MeshLambertMaterial({map: grassTexture}) // трава
        ];

        this.bulletOrigin;
        this.player1TankMesh; 
        this.player2TankMesh;
        this.npc1TankOrigin;

        this.covers3D = new THREE.Object3D();
        this.blocks3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';
        this.floors1 = []; //Массив с плоскостями пола, затем преобразовываем в единый объект
        this.floors2 = [];
        this.floors3 = [];
        this.floors4 = [];

        this.floors3D = new THREE.Object3D();

        this.waters = []
        this.waters3D = new THREE.Object3D();

        this.wallsForWaters = [];
        this.wallsForWater3D = new THREE.Object3D();

        this.borders3D = new THREE.Object3D();

        this.abroad3D = new THREE.Object3D();

        this.temp1 = 0;

        this.scene.add(this.wallsForWater3D);
        this.scene.add(this.waters3D);
        this.scene.add(this.covers3D);
        this.scene.add(this.blocks3D);
        this.scene.add(this.bricks3D);
        this.scene.add(this.floors3D);
        this.scene.add(this.borders3D);
        this.scene.add(this.abroad3D);
    }

    async initAsync(){
        this.bulletOrigin = (await this.gltfLoader.loadAsync('/models/bullet.glb')).scene.children[0];
        //model.material.map.minFilter = THREE.LinearFilter <------ Вернуть когда появится настоящий материал
        
        let player1TankOrigin = (await this.gltfLoader.loadAsync('/models/tank1.glb')).scene.children[0];
        let player2TankOrigin = (await this.gltfLoader.loadAsync('/models/tank2.glb')).scene.children[0];
        player1TankOrigin.material.map.minFilter = THREE.LinearFilter;
        player2TankOrigin.material.map.minFilter = THREE.LinearFilter;
        this.player1TankMesh = new THREE.Mesh(player1TankOrigin.geometry, player1TankOrigin.material);
        this.player2TankMesh = new THREE.Mesh(player2TankOrigin.geometry, player2TankOrigin.material);
    
        this.npc1TankOrigin = (await this.gltfLoader.loadAsync(this.urlNpcTankModels[0])).scene.children[0];
        this.npc1TankOrigin.material.map.minFilter = THREE.LinearFilter;

        this.border = (await this.gltfLoader.loadAsync('/models/border.glb')).scene.children[0];
        this.border.material.map.minFilter = THREE.LinearMipMapLinearFilter;
        this.border.material.map.magFilter = THREE.LinearFilter;

        this.createBorders();
        
        this.createAbroad();
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

    createBorders()
    {
        let borders = [];
        function create(posX, posY, posZ, clone){
            clone.translate(posX, posY, posZ);
            borders.push(clone);
        }
        let size = this.config.grid2;
        let halfSize = this.config.grid;
        // Верх
        for (let i = -halfSize; i < this.config.viewSize.x + size; i=i+size) {
            create(i, 0.7, -halfSize, this.border.geometry.clone());
        }
        // Лево
        for (let i = halfSize; i < this.config.viewSize.y + size; i=i+size) {
            create(-halfSize, 0.7, i, this.border.geometry.clone());
        }
        // Низ
        for (let i = halfSize; i < this.config.viewSize.x + size; i=i+size) {
            create(i, 0.7, this.config.viewSize.y + halfSize, this.border.geometry.clone());
        }
        // Лево
        for (let i = halfSize; i < this.config.viewSize.y; i=i+size) {
            create(this.config.viewSize.x + halfSize, 0.7, i, this.border.geometry.clone());
        }

        let bordersMerge = BufferGeometryUtils.mergeGeometries(borders);
        this.borders3D.add(new THREE.Mesh(bordersMerge, this.border.material));
    }

    createAbroad()
    {
        let width = 5;
        let abroadGeomnetries = [];
        checki: for (let i = -5.5; i <= 5; i++) 
        {
            checkj: for (let j = -9; j <= this.config.viewSize.x + 9; j++) 
            {
                //if (i >= -1 && i < this.config.viewSize.y) continue checki;
                if (j >= -1 && j < this.config.viewSize.x) continue checkj;
                let p = this.planeGeomentry.clone(); // Плоскости
                p.translate(j, 0, i);
                p.scale(2, 1, 2);
                abroadGeomnetries.push(p);
            }
        }

        let abroadsMerge = BufferGeometryUtils.mergeGeometries([...abroadGeomnetries]);
        this.abroad3D.add(new THREE.Mesh(abroadsMerge, this.materials[7]));
    }

    createPlayerTank()
    {

    }

    createNpcTank()
    {
        return new THREE.Mesh(this.npc1TankOrigin.geometry, this.npc1TankOrigin.material);
    }

    createWater(posX, posY, posZ){
        let p = this.planeGeomentry.clone();
        p.translate(posX, posY, posZ);
        this.waters.push(p);
    }

    createWallForWater(posX, posY, posZ, left = false, right = false){
        let p = this.planeGeomentry.clone();
        p.scale(1, 0.8, 1);
        p.rotateX(-270 * Math.PI / 180);
        if (left) p.rotateY((90 * Math.PI) / 180);
        else if (right) p.rotateY((-90 * Math.PI) / 180);
        p.translate(posX, posY, posZ);
        this.wallsForWaters.push(p);
    }

    createFloor(posX, posY, posZ){
        let p = this.planeGeomentry.clone(); // Плоскости
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
        let p = new THREE.Mesh(this.planeGeomentry, this.materials[6]);
        p.position.set(posX, posY, posZ);
        p.rotation.x = (-90 * Math.PI) / 180;
        this.covers3D.add(p);
    }

    createBrick(posX, posY, posZ, j, i, length){
        let b1 = new THREE.Mesh(this.brick.geometry, this.brick.material);
        b1.scale.set(1, 1.4, 1);
        b1.name = coordinatesToId(j, i, length);
        b1.position.set(posX, posY, posZ);
        this.bricks3D.add(b1);
    }

    createBlock(posX, posY, posZ, j, i, length){
        let b = new THREE.Mesh(this.block.geometry, this.block.material);
        b.scale.set(1, 1.4, 1);
        b.name = coordinatesToId(j, i, length);
        b.position.set(posX, posY, posZ);
        this.blocks3D.add(b);
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
        this.floors3D.add(new THREE.Mesh(floorMerge1, this.materials[0]));
        this.floors3D.add(new THREE.Mesh(floorMerge2, this.materials[1]));
        this.floors3D.add(new THREE.Mesh(floorMerge3, this.materials[2]));
        this.floors3D.add(new THREE.Mesh(floorMerge4, this.materials[3]));

        let waterMerge = BufferGeometryUtils.mergeGeometries([...this.waters]);
        this.waters = [];
        this.waters3D.add(new THREE.Mesh(waterMerge, this.materials[5]))

        let wallForWaterMerge = BufferGeometryUtils.mergeGeometries(this.wallsForWaters);
        this.wallsForWaters = [];
        this.wallsForWater3D.add(new THREE.Mesh(wallForWaterMerge, this.materials[4]));
    }

    removeBlock(posX, posY, length){
        let nameObj = this.scene.getObjectByName(
            coordinatesToId(posX, posY, length)
        );
        this.scene.getObjectByName('bricks').remove(nameObj);
    }

    reset(){
        this.waters3D.clear();
        this.covers3D.clear();
        this.blocks3D.clear();
        this.bricks3D.clear();
        this.floors3D.clear();
    }

    render(){
        this.renderer.render(this.scene, this.camera);
        this.temp1 += 0.003;
        if (this.temp1 >= 2 * Math.PI) this.temp1 = 0;
        this.waters3D.children[0].material.map.offset.set(Math.sin(this.temp1), Math.cos(this.temp1));
    }
}