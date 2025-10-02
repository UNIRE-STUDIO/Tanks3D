import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { idToCoordinates, coordinatesToId } from "./general.js";
import { shadowShader } from './shaders.js';
import { MyMaterial } from "./myMaterial.js";
import { ShadowPool } from "./shadowPool.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import BlockPool from "./blockPool.js";

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


        // 3Д объекты ----------------------------------------------------------------------------------------
        this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1);
        this.planeGeometry.rotateX((270 * Math.PI) / 180);
        this.planeGeometry.translate(0.5,0,0.5);

        this.brick;
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.load("/models/brick.glb", (gltf) => {
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

        let textureLoader = new THREE.TextureLoader();
// Пул Floor
        let floorTexture = textureLoader.load('/sprites/floor.jpg');
        floorTexture.colorSpace = THREE.SRGBColorSpace;
        let floorNormalTexture = textureLoader.load('/sprites/floor-normalMap.jpg');
        let floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture, normalMap:  floorNormalTexture})
        this.floorPool = new BlockPool(floorMaterial, this.planeGeometry, 1000);
        this.scene.add(this.floorPool.instancedMesh);

// Пул Травы -----------------
            // Создаём материал
            let grassTexture = textureLoader.load('/sprites/grass.jpg');
            grassTexture.colorSpace = THREE.SRGBColorSpace;
            let grassMaterial = new THREE.MeshLambertMaterial({map: grassTexture});
            // Инициализируем со строгим кол-вом объектов
            this.grassPool = new BlockPool(grassMaterial, this.planeGeometry, 1600);
            this.scene.add(this.grassPool.instancedMesh);

// Пул Воды ------------------
            // Создаём материал
                let waterTexture = textureLoader.load('/sprites/water.jpg');
                waterTexture.wrapS = THREE.RepeatWrapping;
                waterTexture.wrapT = THREE.RepeatWrapping;
                let waterNormalTexture = textureLoader.load("/sprites/water-normalMap.jpg");
                waterNormalTexture.wrapS = THREE.RepeatWrapping;
                waterNormalTexture.wrapT = THREE.RepeatWrapping;
                this.waterMaterial = new THREE.MeshLambertMaterial({ map: waterTexture});
            this.watersPool = new BlockPool(this.waterMaterial, this.planeGeometry, 300);
            this.scene.add(this.watersPool.instancedMesh);
            
// Пул Стен для воды -----------
            // Создаём материал
                let wallsForWaterMaterial = new THREE.MeshLambertMaterial({ color: 0x3F4141 })
            // Создаём геометрию
            let waterGeometry = this.planeGeometry.clone();
            waterGeometry.rotateX((-270 * Math.PI) / 180);
            waterGeometry.scale(1, 0.8, 1);
            this.wallsForWaterPool = new BlockPool(wallsForWaterMaterial, waterGeometry, 300);
            this.scene.add(this.wallsForWaterPool.instancedMesh);

// Пул Borders1 ----------------
        let border1;
        this.gltfLoader.load('/models/border1.glb', (gltf) => {
            border1 = gltf.scene.children[0];
            border1.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            border1.material.map.magFilter = THREE.LinearFilter;
            border1.geometry.translate(0.5, 0, 0.5);
            this.borders1Pool = new BlockPool(border1.material, border1.geometry, 130);
            this.scene.add(this.borders1Pool.instancedMesh);
        });

// Пул Borders2 ----------------     
        let border2;
        this.gltfLoader.load('/models/border2.glb', (gltf) => {
            border2 = gltf.scene.children[0];
            border2.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            border2.material.map.magFilter = THREE.LinearFilter;
            border2.geometry.translate(0.5, 0, 0.5);
            this.borders2Pool = new BlockPool(border2.material, border2.geometry, 130);
            this.scene.add(this.borders2Pool.instancedMesh);
        });
// Пул Covers -------------------
        let cover;
        this.gltfLoader.load('/models/cover.glb', (gltf) => {
            cover = gltf.scene.children[0];
            cover.material.map.minFilter = THREE.LinearMipMapLinearFilter;
            cover.material.map.magFilter = THREE.LinearFilter;
            cover.geometry.translate(0.5, 0, 0.5);
            this.coversPool = new BlockPool(cover.material, cover.geometry, 130);
            this.scene.add(this.coversPool.instancedMesh);
        });          

// ТЕНЬ -----------------------
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
        this.shadowsPool = new ShadowPool(this.shadows3D,
            new THREE.Mesh(shadowRightGeometry, new THREE.MeshBasicMaterial({color: 0x000, transparent: true, opacity: 0.5})),
            new THREE.Mesh(shadowAboveGeometry, new THREE.MeshBasicMaterial({color: 0x000, transparent: true, opacity: 0.5})));

        // ----------------------------------------------------------------------

        this.bulletOrigin;
        this.player1TankMesh; 
        this.player2TankMesh;
        this.npc1TankOrigin;

        this.stones3D = new THREE.Object3D();
        this.bricks3D = new THREE.Object3D();
        this.bricks3D.name = 'bricks';

        this.temp1 = 0;

        this.scene.add(this.stones3D);
        this.scene.add(this.bricks3D);
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
        this.camera.position.set(this.config.mapSize.x / 2, 18, this.config.mapSize.y - 4); // z = 20
        this.cameraMaxClamp = this.config.mapSize.y + 1; //23
        this.cameraMinClamp = this.config.mapSize.y - 4; //20
        
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

    createNpcTank()
    {
        return new THREE.Mesh(this.npc1TankOrigin.geometry, this.npc1TankOrigin.material);
    }
    
    // Принимает массив с координатами все плоскостей травы
    createGrasses(matrixs)       { this.grassPool.init(matrixs)         }
    createWaters(matrixs)        { this.watersPool.init(matrixs)        }
    createWallsForWater(matrixs) { this.wallsForWaterPool.init(matrixs) }
    createBorders1(matrixs)      { this.borders1Pool.init(matrixs)      }
    createBorders2(matrixs)      { this.borders2Pool.init(matrixs)      }
    createCovers(matrixs)        { this.coversPool.init(matrixs)        }
    createAllShadows(rightMatrix, aboveMatrix, mapWidth) { this.shadowsPool.init(rightMatrix, aboveMatrix, mapWidth) }
    createFloors(matrixs)        { this.floorPool.init(matrixs)         }

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

    createBullet(){
        return new THREE.Mesh(this.bulletOrigin.geometry, this.bulletOrigin.material);
    }

    createShadowAbove(posX, posZ){
        this.shadowsPool.createAbove(posX, 0.001, posZ, this.config.mapSize.x);
    }

    createShadowRight(posX, posZ){
        this.shadowsPool.createRight(posX, 0.001, posZ, this.config.mapSize.x);
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
        this.cameraMaxClamp = this.config.mapSize.y + 1; //23
        this.cameraMinClamp = this.config.mapSize.y - 4; //20     //  Если Z камеры меньше минимума, то мы понимаем, что камера только создана и расположена на нужном месте
                                                                  //  Выставляем в крайнее положение. Если камера уже имеет нужную позицию то оставляем 
        this.camera.position.set(this.config.mapSize.x / 2, 18, this.camera.position.z < this.cameraMinClamp ? this.cameraMinClamp : this.camera.position.z); // z = 20
        this.camera.lookAt(
            new THREE.Vector3(
                this.config.mapSize.x / 2,
                0,
                this.config.mapSize.y - (this.config.arenaSize.y/2) - 2
            )
        );
    }

    removeBlock(posX, posY, width){
        let nameObj = this.scene.getObjectByName(
            coordinatesToId(posX, posY, width)
        );
        this.shadowsPool.remove(posX, posY, width);
        this.scene.getObjectByName('bricks').remove(nameObj);
    }

    reset(){
        this.stones3D.clear();
        this.bricks3D.clear();
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
        this.waterMaterial.map.offset.set(Math.sin(this.temp1), Math.cos(this.temp1));
    }
}