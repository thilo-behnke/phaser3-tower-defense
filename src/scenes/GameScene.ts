import { Scene } from 'phaser';
import { isEmpty, range, take, zip } from 'lodash';
import * as tilesetImg from '../../assets/towerDefense_tilesheet@2_res.png'
import * as levelFile2 from '../../assets/maps/level2.json'
import * as greenKnightImg from '../../assets/green-knight.png'
import * as machineGunImg from '../../assets/machine_gun.png'
import * as shotgunImg from '../../assets/shotgun.png'
import * as singleRocketImg from '../../assets/single_rocket.png'
import * as smallBulletImg from '../../assets/small_bullet.png'
import Knight from '../objects/knight';
import Gun, { MachineGun, ShotGun, SingleRocketLauncher } from '../objects/gun';
import { Bullet } from '../objects/Bullet';
import { product } from '../utils/array';
import { Enemy } from '../objects/GameObject';
import Graphics = Phaser.GameObjects.Graphics;
import Vector2 = Phaser.Math.Vector2;
import Tilemap = Phaser.Tilemaps.Tilemap;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import Sprite = Phaser.Physics.Matter.Sprite;
import DynamicTilemapLayer = Phaser.Tilemaps.DynamicTilemapLayer;
import AutoRemoveList from "../objects/AutoRemoveList";

export enum WeaponType {
    SHOTGUN = 'shotgun', MACHINEGUN = 'machine_gun', 'SINGLE_ROCKET' = 'single_rocket'
}

export type GameTile =
    Phaser.Tilemaps.Tile
    & { properties: { collides: boolean, mount: boolean, weapon_type: WeaponType, weapon_price: number } }
export type InstalledGun = { sprite: Gun, tile: { x: number, y: number } }

export enum CollisionGroup {
    BULLET = -1, ENEMY = -2
}

const nrMap = range(10).reduce((acc, i) => ({...acc, [i]: 277 + i}), {})
console.log(nrMap)

export default class GameScene extends Scene {

    private enemies: AutoRemoveList<Enemy>
    private goal: Vector2[]
    private gameFieldMarker: Graphics
    private menuMarker: Graphics

    private money: number

    private gunManager: { selected: Gun, selectedPrice: number, available: { [key: string]: Gun } }

    private tileMap: Tilemap
    private towerLayer: StaticTilemapLayer
    private pathLayer: StaticTilemapLayer
    private moneyLayer: DynamicTilemapLayer
    private weaponSelectLayer: DynamicTilemapLayer
    private guns: InstalledGun[]
    private bullets: AutoRemoveList<Bullet>

    private bulletSubscriptions: (() => void)[]

    preload() {
        this.load.image('tiles', tilesetImg)
        this.load.image('machine_gun', machineGunImg)
        this.load.image('shotgun', shotgunImg)
        this.load.image('single_rocket', singleRocketImg)
        this.load.image('small_bullet', smallBulletImg)
        // this.load.image('nr_1', nr1Img)
        // this.load.image('nr_2', nr2Img)
        // this.load.image('nr_3', nr3Img)
        // this.load.image('nr_4', nr4Img)
        // this.load.image('nr_5', nr5Img)
        // this.load.image('nr_6', nr6Img)
        // this.load.image('nr_7', nr7Img)
        // this.load.image('nr_8', nr8Img)
        // this.load.image('nr_9', nr9Img)
        this.load.spritesheet('green-knight', greenKnightImg, {
            frameWidth: 20,
            frameHeight: 29,
            // margin: 2,
            // spacing: 2
        })
        this.load.tilemapTiledJSON('map', levelFile2);
        this.money = 1000
        this.guns = []
        this.bulletSubscriptions = []
    }

    private initGunManager(defaultSelect) {
        const machineGunProto = MachineGun.create(this, {x: 0, y: 0}, {x: 0, y: 0})
        const shotGunProto = ShotGun.create(this, {x: 0, y: 0}, {x: 0, y: 0})
        const singleRocketProto = SingleRocketLauncher.create(this, {x: 0, y: 0}, {x: 0, y: 0})
        const available = {[WeaponType.MACHINEGUN]: machineGunProto, [WeaponType.SHOTGUN]: shotGunProto, [WeaponType.SINGLE_ROCKET]: singleRocketProto}
        this.gunManager = {
            selected: available[defaultSelect.properties.weapon_type],
            selectedPrice: defaultSelect.properties.weapon_price,
            available
        }
    }

    private updateMoneyDisplay() {
        const money = ('' + this.money).padStart(4, '0').split('')
        const amountTiles = take(this.moneyLayer.culledTiles, 4)
        amountTiles.length === 4 && zip(money, amountTiles).forEach(([m, {x, y}]) => this.moneyLayer.putTileAt(nrMap[m], x, y))
    }

    private createGameFieldMarker() {
        this.gameFieldMarker = this.add.graphics();
        this.gameFieldMarker.lineStyle(5, 0xffffff, 1);
        this.gameFieldMarker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
        this.gameFieldMarker.lineStyle(3, 0xff4f78, 1);
        this.gameFieldMarker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
    }

    private createMenuMarker() {
        this.menuMarker = this.add.graphics();
        this.menuMarker.lineStyle(5, 0xffffff, 1);
        this.menuMarker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
        this.menuMarker.lineStyle(3, 0xff4f78, 1);
        this.menuMarker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
    }

    getNearestKnight({x: tileX, y: tileY}) {
        const [h, ...tail] = this.enemies
        return isEmpty(tail)
            ? h
            : tail.reduce((acc, knight) => {
                const {x: pX, y: pY} = acc.getXY()
                const {x, y} = knight.getXY()
                const pD = Math.sqrt((tileX - pX) ** 2 + (tileY - pY) ** 2)
                const d = Math.sqrt((tileX - x) ** 2 + (tileY - y) ** 2)
                return d < pD ? knight : acc
            }, h)
    }

    updateSubscriptions() {
        this.bulletSubscriptions.length > 0 && this.bulletSubscriptions.forEach(s => s())
        this.bulletSubscriptions = product(this.enemies, this.bullets).map(([knight, bullet]) => {
            return this.matterCollision.addOnCollideStart({
                objectA: knight.getSprite(),
                objectB: bullet.getSprite(),
                context: this,
                callback: (collision) => {
                    const {gameObjectB} = collision
                    if (!(gameObjectB instanceof Sprite)) {

                    } else if (!bullet.isDead()){
                        knight.getHit(bullet.bulletParams.damage)
                    }
                }
            })
        })
    }

    spawnBullet(bullet) {
        this.bullets.add(bullet)
    }

    spawnKnights() {
        const {x: spawnX, y: spawnY} = this.tileMap.findObject('Spawn', obj => obj.name === 'Spawn Point')
        window.setInterval((a) => {
            const knights = range(8)
                .map(i => Knight.create(this, {x: spawnX + (-1) ** i * Math.ceil(i / 2) * 15, y: spawnY + Math.floor(i / 4) * 30}))
            this.enemies.add(knights)
        }, 2000)

    }

    create() {

        this.tileMap = this.make.tilemap({key: 'map'})
        const tileset = this.tileMap.addTilesetImage('tower_defense3', 'tiles')
        const backgroundLayer = this.tileMap.createStaticLayer('Background', tileset, 0, 0)

        this.towerLayer = this.tileMap.createStaticLayer('Towers', tileset, 0, 0)
        this.pathLayer = this.tileMap.createStaticLayer('Path', tileset, 0, 0)
        this.weaponSelectLayer = this.tileMap.createDynamicLayer('TowerSelection', tileset, 0, 0)
        this.moneyLayer = this.tileMap.createDynamicLayer('Money', tileset, 0, 0)

        const goalArea = this.tileMap.findObject('Goal', obj => obj.name === 'Goal Area')

        this.goal = range(goalArea.width / this.tileMap.tileWidth).map(i => ({
            x: goalArea.x + i * this.tileMap.tileWidth,
            y: goalArea.y
        })) as Vector2[]

        this.towerLayer.setCollisionByProperty({collides: true})

        const matterTowerLayer = this.matter.world.convertTilemapLayer(this.towerLayer)
        matterTowerLayer.localWorld.bodies.forEach(body => {
            body.collisionFilter = {...body.collisionFilter, group: CollisionGroup.BULLET}
        })
        this.matter.world.setBounds(0, 0, this.tileMap.widthInPixels, this.tileMap.heightInPixels);

        this.anims.create({
            key: 'green-knight-idle',
            frames: this.anims.generateFrameNames('green-knight', {start: 0, end: 3}),
            frameRate: 3,
            repeat: -1
        })

        this.enemies = new AutoRemoveList<Enemy>()
        this.bullets = new AutoRemoveList<Bullet>()
        this.spawnKnights()

        this.createMenuMarker()
        this.menuMarker.setPosition(11 * 32, 32)
        this.createGameFieldMarker()
        this.gameFieldMarker.setPosition(32, 32)

        this.initGunManager(this.weaponSelectLayer.getTileAt(11, 1))

        document.getElementById('restart-button').addEventListener('click', this.restartGame.bind(this))
    }

    update(time, delta) {
        this.guns.forEach(({sprite}) => sprite.update(delta))
        this.enemies.update(delta)
        this.bullets.update(delta)
        this.updateMoneyDisplay()

        // Convert the mouse position to world position within the camera
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Vector2;

        // TODO: Refactor markers
        const pointerTileXY = this.towerLayer.worldToTileXY(worldPoint.x, worldPoint.y);
        const tileAt = this.towerLayer.getTileAt(pointerTileXY.x, pointerTileXY.y) as GameTile

        if (tileAt && tileAt.properties && tileAt.properties.mount && !this.guns.find(({tile: {x, y}}) => x === pointerTileXY.x && y === pointerTileXY.y)) {
            const snappedWorldPoint = this.towerLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y)
            this.gameFieldMarker.setVisible(true)
            this.gameFieldMarker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y)
            if (this.input.manager.activePointer.isDown) {
                if (this.money - this.gunManager.selectedPrice >= 0) {
                    const gunSprite = this.gunManager.selected.clone(snappedWorldPoint, this.tileMap)
                    const gun = {sprite: gunSprite, tile: tileAt}
                    this.guns = [gun, ...this.guns]
                    this.money -= this.gunManager.selectedPrice
                }
            }
        }

        const pointerTileXYMenu = this.weaponSelectLayer.worldToTileXY(worldPoint.x, worldPoint.y);
        const tileAtMenu = this.weaponSelectLayer.getTileAt(pointerTileXY.x, pointerTileXY.y) as GameTile

        if (tileAtMenu && tileAtMenu.properties && tileAtMenu.properties.weapon_type) {
            const snappedWorldPoint = this.weaponSelectLayer.tileToWorldXY(pointerTileXYMenu.x, pointerTileXYMenu.y)
            this.menuMarker.setVisible(true)
            this.menuMarker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y)
            if (this.input.manager.activePointer.isDown) {
                this.gunManager.selected = this.gunManager.available[tileAtMenu.properties.weapon_type]
                this.gunManager.selectedPrice = tileAtMenu.properties.weapon_price
            }

        }

        this.updateSubscriptions()

    }

    hasReachedGoal(e: Enemy) {
        return this.goal.some(({x: tileX, y: tileY}) => {
            const {x, y} = this.tileMap.worldToTileXY(tileX, tileY)
            const goalTile = this.pathLayer.getTileAt(x, y)
            const {x: eX, y: eY} = this.tileMap.worldToTileXY(e.getXY().x, e.getXY().y)
            const enemyTile = this.pathLayer.getTileAt(eX, eY)
            return goalTile === enemyTile
        })
    }

    restartGame() {
        this.scene.restart()
    }
}
