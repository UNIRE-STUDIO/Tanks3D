import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { idToCoordinates, coordinatesToId } from "./general.js";
import { shadowShader } from './shaders.js';
import { MyMaterial } from "./myMaterial.js";
import { ShadowPool } from "./shadowPool.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export default class ThreeManager {
    constructor(uiFields, config){
        this.uiFields = uiFields;
        this.config = config;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x687549); // Фон 0x6794AD
        const canvas = document.querySelector(".canvas");
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas,
            alpha: false,
            //logarithmicDepthBuffer: true
        });
        //this.renderer.sortObjects = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // const context = this.renderer.getContext();
        // context.disable(context.DEPTH_TEST);
        document.body.appendChild(this.renderer.domElement);

        ////

        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            12,
            60
        );
        this.cameraMaxClamp = 0;
        this.cameraMinClamp = 0;
        this.speedCamera = 0.003;
        this.axisCamera = 0;

        window.addEventListener("resize", () => {
            this.updateCameraFov();
            if (uiFields.currentScreen === 0) return;
            this.renderer.render(this.scene, this.camera);
        });
        this.updateCameraFov();

        this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        this.directionalLight.castShadow = false;
        let targetDirLight = new THREE.Object3D();
        this.directionalLight.target = targetDirLight;
        this.directionalLight.target.position.set(0.5, 0, -1);
        this.directionalLight.target.updateMatrixWorld(); // Расчитывает положение на сцене (что-бы не добавлять target на сцену)

        this.scene.add(this.directionalLight);
        this.scene.add(this.ambient);

        this.urlNpcTankModels = [
            '/models/npcTank1.glb'
        ]

        this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1);
        this.planeGeometry.rotateX((270 * Math.PI) / 180);
        this.planeGeometry.translate(0.5,0,0.5);

        this.brick;
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load("/models/brick2.glb", (gltf) => {
            this.brick = gltf.scene.children[0];
            this.brick.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.brick.material.map.magFilter = THREE.LinearFilter;
            this.brick.geometry.translate(0.5, 0.7, 0.5);
            //this.brick.material.map.colorSpace = THREE.SRGBColorSpace;
        });
        this.stone;
        this.gltfLoader.load("/models/stone.glb", (gltf) => {
            this.stone = gltf.scene.children[0];
            this.stone.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.stone.material.map.magFilter = THREE.LinearFilter;
            this.stone.geometry.translate(0.5, 0, 0.5);
        });
        this.border1;
        this.gltfLoader.load('/models/border-1.glb', (gltf) => {
            this.border1 = gltf.scene.children[0];
            this.border1.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.border1.material.map.magFilter = THREE.LinearFilter;
            this.border1.geometry.translate(0.5, 0, 0.5);
        });
        this.border2;
        this.gltfLoader.load('/models/border-2.glb', (gltf) => {
            this.border2 = gltf.scene.children[0];
            this.border2.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            this.border2.material.map.magFilter = THREE.LinearFilter;
            this.border2.geometry.translate(0.5, 0, 0.5);
        });
        

        let textureLoader = new THREE.TextureLoader();
        let floor1Texture = textureLoader.load('/sprites/floor1.jpg');
        floor1Texture.colorSpace = THREE.SRGBColorSpace;
        let floor1NormalTexture = textureLoader.load('/sprites/floor1-normalMap.jpg');

        let grassTexture = textureLoader.load('/sprites/grass.jpg');
        grassTexture.colorSpace = THREE.SRGBColorSpace;

        let waterTexture = textureLoader.load('/sprites/water.jpg');
        waterTexture.wrapS = THREE.RepeatWrapping;
        waterTexture.wrapT = THREE.RepeatWrapping;
        let waterNormalTexture = textureLoader.load("/sprites/water-normalMap.jpg");
        waterNormalTexture.wrapS = THREE.RepeatWrapping;
        waterNormalTexture.wrapT = THREE.RepeatWrapping;

        this.materials = [
            new THREE.MeshLambertMaterial({ map: floor1Texture, normalMap:  floor1NormalTexture}), // пол
            new THREE.MeshLambertMaterial({ map: floor1Texture }), // пол
            new THREE.MeshLambertMaterial({ map: floor1Texture }), // пол
            new THREE.MeshLambertMaterial({ map: floor1Texture }), // пол
            new THREE.MeshLambertMaterial({ color: 0x3F4141	 }),  // стены окружающие воду
            new THREE.MeshLambertMaterial({ map: waterTexture}),  // водав
            new THREE.MeshBasicMaterial({ color: 0x1fad6d }),     // тент
            new THREE.MeshLambertMaterial({map: grassTexture}),   // трава
            new THREE.MeshBasicMaterial({color: 0x000, transparent: true, opacity: 0.5}),
        ];

        let uniforms = {};
        uniforms.uBaseColor = { value: new THREE.Color(0,0,0) },
        uniforms.uBaseVertRatio = { value: new THREE.Vector2(0.50,0.50) },
        uniforms.opacity = { value: 0.5 }
        this.shadowMatrial = new THREE.ShaderMaterial({fragmentShader: shadowShader, uniforms: uniforms, transparent: true, opacity: 0.5});

        // ТЕНЬ ----------------------------------------------------------------------
        let gr = this.config.grid;
        const shapeAbove = new THREE.Shape();
        shapeAbove.moveTo(0, 0);
        shapeAbove.lineTo(0.5, 0.5);
        shapeAbove.lineTo(1.5, 0.5);
        shapeAbove.lineTo(1, 0);

        const shapeRight = new THREE.Shape();
        shapeRight.moveTo(1, -1);
        shapeRight.lineTo(1, 0);
        shapeRight.lineTo(1.5, 0.5);
        shapeRight.lineTo(1.5, -0.5);

        let shadowRightGeometry = new THREE.ShapeGeometry(shapeRight);
        shadowRightGeometry.rotateX((270 * Math.PI) / 180);

        let shadowAboveGeometry = new THREE.ShapeGeometry(shapeAbove);
        shadowAboveGeometry.rotateX((270 * Math.PI) / 180);

        this.shadows3D = new THREE.Object3D();

        this.shadowPool = new ShadowPool(this.shadows3D,
            new THREE.Mesh(shadowRightGeometry, this.materials[8]),
            new THREE.Mesh(shadowAboveGeometry, this.materials[8]),
            this.config.mapSize.x);

        // ----------------------------------------------------------------------

        this.bulletOrigin;
        this.player1TankMesh; 
        this.player2TankMesh;
        this.npc1TankOrigin;

        this.covers3D = new THREE.Object3D();
        this.stones3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';
        
        this.floors1 = []; //Массив с плоскостями пола, затем преобразовываем в единый объект
        this.floors3D = new THREE.Object3D();

        this.grass = []; //Массив с плоскостями пола, затем преобразовываем в единый объект
        this.grass3D = new THREE.Object3D();

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
        this.scene.add(this.stones3D);
        this.scene.add(this.bricks3D);
        this.scene.add(this.floors3D);
        this.scene.add(this.grass3D);
        this.scene.add(this.borders3D);
        this.scene.add(this.abroad3D);
        this.scene.add(this.shadows3D);

        // Для дебага
        // Создаем CSS2D рендерер для текста
        // this.labelRenderer = new CSS2DRenderer();
        // this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        // this.labelRenderer.domElement.style.position = 'absolute';
        // this.labelRenderer.domElement.style.top = '0px';
        // this.labelRenderer.domElement.style.pointerEvents = 'none'; // Важно! Пропускает события мыши
        // document.body.appendChild(this.labelRenderer.domElement);
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
        let p = this.planeGeometry.clone();
        p.translate(posX, posY, posZ);
        this.waters.push(p);
    }

    createWallForWater(posX, posY, posZ, left = false, right = false){
        let p = this.planeGeometry.clone();
        p.rotateX(-270 * Math.PI / 180);
        if (left) p.rotateY((90 * Math.PI) / 180);
        else if (right) p.rotateY((-90 * Math.PI) / 180);
        p.scale(1, 0.8, 1);
        p.translate(posX, posY, posZ);
        this.wallsForWaters.push(p);
    }

    createFloor(posX, posY, posZ){
        let p = this.planeGeometry.clone(); // Плоскости
        p.translate(posX, posY, posZ);
        this.floors1.push(p);
    }
    
    createGrass(posX, posY, posZ){
        let p = this.planeGeometry.clone(); // Плоскости
        p.translate(posX, posY, posZ);
        this.grass.push(p);
    }

    createCover(posX, posY, posZ){
        let p = new THREE.Mesh(this.planeGeometry, this.materials[6]);
        p.position.set(posX, posY, posZ);
        p.rotation.x = (-90 * Math.PI) / 180;
        this.covers3D.add(p);
    }

    createBrick(posX, posY, posZ, length){
        let base = new THREE.Object3D();
        base.name = coordinatesToId(posX, posZ, length);

        // Кирпич
        let b1 = new THREE.Mesh(this.brick.geometry, this.brick.material);
        b1.position.set(posX, posY, posZ);
        base.add(b1);
        
        this.bricks3D.add(base);
    }

    createStone(posX, posY, posZ, length){
        let b = new THREE.Mesh(this.stone.geometry, this.stone.material);
        b.name = coordinatesToId(posX, posY, length);
        b.position.set(posX, posY, posZ);
        this.stones3D.add(b);
    }

    createBorder(posX, posY, posZ, length, type){
        let b
        if (type === 1){
            b = new THREE.Mesh(this.border1.geometry, this.border1.material);
        }else{
            b = new THREE.Mesh(this.border2.geometry, this.border2.material);
        }
        
        b.name = coordinatesToId(posX, posY, length);
        b.position.set(posX, posY, posZ);
        this.borders3D.add(b);
    }

    createBullet(){
        return new THREE.Mesh(this.bulletOrigin.geometry, this.bulletOrigin.material);
    }

    createShadowAbove(posX, posZ){
        this.shadowPool.createAbove(posX, 0.001, posZ, this.config.mapSize.x);
    }

    createShadowRight(posX, posZ){
        this.shadowPool.createRight(posX, 0.001, posZ, this.config.mapSize.x);
        // this.createLabel(posX, posZ, coordinatesToId(posX, posZ, this.config.mapSize.x));
    }

    createLabel(posX, posZ, id) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.textContent = id + "";
        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        labelDiv.style.color = 'white';
        labelDiv.style.padding = '5px';
        labelDiv.style.borderRadius = '3px';
        labelDiv.style.fontSize = '10px';
        labelDiv.style.pointerEvents = 'none';
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(posX + 0.5, 1.2, posZ + 0.5); // Над объектом
        this.scene.add(label);
    }

    addToScene(){ // Работает при старте уровня
        this.camera.position.set(this.config.mapSize.x / 2, 18, this.config.mapSize.y - 4); // z = 20
        this.cameraMaxClamp = this.config.mapSize.y + 1; //23
        this.cameraMinClamp = this.config.mapSize.y - 4; //20

        let floorMerge1 = BufferGeometryUtils.mergeGeometries([...this.floors1]);

        this.floors1 = [];
        this.floors3D.add(new THREE.Mesh(floorMerge1, this.materials[0]));

        let grassMerge = BufferGeometryUtils.mergeGeometries([...this.grass])
        this.grass3D.add(new THREE.Mesh(grassMerge, this.materials[7]))

        let waterMerge = BufferGeometryUtils.mergeGeometries([...this.waters]);
        this.waters = [];
        this.waters3D.add(new THREE.Mesh(waterMerge, this.materials[5]))

        let wallForWaterMerge = BufferGeometryUtils.mergeGeometries(this.wallsForWaters);
        this.wallsForWaters = [];
        this.wallsForWater3D.add(new THREE.Mesh(wallForWaterMerge, this.materials[4]));
    }

    removeBlock(posX, posY, width){
        let nameObj = this.scene.getObjectByName(
            coordinatesToId(posX, posY, width)
        );
        this.shadowPool.remove(posX, posY, width);
        this.scene.getObjectByName('bricks').remove(nameObj);
    }

    reset(){
        this.waters3D.clear();
        this.covers3D.clear();
        this.stones3D.clear();
        this.bricks3D.clear();
        this.floors3D.clear();
        this.grass3D.clear();
        this.borders3D.clear();
    }

    setCameraMove(axis){
        this.axisCamera = axis;
    }
    
    update(lag){
        let inc = this.axisCamera * this.speedCamera * lag;
        if (this.camera.position.z + inc > this.cameraMaxClamp || this.camera.position.z + inc < this.cameraMinClamp) return;
        this.camera.position.z += inc;
        this.camera.lookAt(
            new THREE.Vector3(
                this.config.mapSize.x / 2,
                0,
                this.config.mapSize.y - (this.config.arenaSize.y/2) - 2
            )
        );
        
    }

    render(){
        this.renderer.render(this.scene, this.camera);
        //this.labelRenderer.render(this.scene, this.camera);
        this.temp1 += 0.003;
        if (this.temp1 >= 2 * Math.PI) this.temp1 = 0;
        this.waters3D.children[0].material.map.offset.set(Math.sin(this.temp1), Math.cos(this.temp1));
    }
}