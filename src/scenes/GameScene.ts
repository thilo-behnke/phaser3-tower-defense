import { Scene } from "phaser";
import { head, range, tail } from 'lodash';
import * as tilesetImg from '../../assets/towerDefense_tilesheet@2_res.png'
import * as levelFile1 from '../../assets/maps/level1.json'
import * as greenKnightImg from '../../assets/green-knight.png'
import * as redGunImg from '../../assets/gun-red.png'
import Knight from '../objects/knight';
import GameObject = Phaser.GameObjects.GameObject;
import Graphics = Phaser.GameObjects.Graphics;
import Vector2 = Phaser.Math.Vector2;
import Tilemap = Phaser.Tilemaps.Tilemap;
import StaticTilemapLayer = Phaser.Tilemaps.StaticTilemapLayer;
import ObjectLayer = Phaser.Tilemaps.ObjectLayer;
import Sprite = Phaser.Physics.Matter.Sprite;
import Gun from '../objects/gun';

export type GameTile = Phaser.Tilemaps.Tile & { properties: { collides: boolean, mount: boolean } }
export type InstalledGun = { sprite: Gun, tile: { x: number, y: number } }

export default class GameScene extends Scene {

    private knights: Knight[]
    private goal: GameObject
    private marker: Graphics

    private tileMap: Tilemap
    private towerLayer: StaticTilemapLayer
    private gunLayer: ObjectLayer
    private guns: InstalledGun[]
    private bullets: GameObject[]

    preload() {
        this.load.image("tiles", tilesetImg)
        this.load.image('gun-red', redGunImg)
        this.load.spritesheet("green-knight", greenKnightImg, {
            frameWidth: 20,
            frameHeight: 29,
            // margin: 2,
            // spacing: 2
        })
        this.load.tilemapTiledJSON("map", levelFile1);
        this.guns = []
        this.bullets = []
    }

    private createMarker() {
        this.marker = this.add.graphics();
        this.marker.lineStyle(5, 0xffffff, 1);
        this.marker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
        this.marker.lineStyle(3, 0xff4f78, 1);
        this.marker.strokeRect(0, 0, this.tileMap.tileWidth, this.tileMap.tileHeight);
    }

    getNearestKnight({x: tileX, y: tileY}) {
        return this.knights.reduce((acc, knight) => {
            const {x: pX, y: pY} = acc.getXY()
            const {x, y} = knight.getXY()
            const pD = Math.sqrt((tileX - pX) ** 2 + (tileY - pY) ** 2)
            const d = Math.sqrt((tileX - x) ** 2 + (tileY - y) ** 2)
            return d < pD ? knight : acc
        })
    }

    spawnBullet({x, y}, {dirX, dirY}) {
        const bullet = this.matter.add
            .sprite(x, y, "none")
            .setScale(0.10, 0.10)
            .setVelocity(dirX * 10, -dirY * 10)
        this.bullets = [...this.bullets, bullet]
        this.bullets = this.bullets.length > 500 ? ((bs) => {
            const h = head(bs)
            h.destroy()
            return tail(bs)
        })(this.bullets) : this.bullets
        // TODO: Doesn't work - why? Too many subscribers?
        // this.matterCollision.addOnCollideStart({
        //     objectA: bullet,
        //     // objectB: this.knights.map(k => k.getSprite()),
        //     context: this,
        //     callback: () => ({gameObjectA, gameObjectB}) => {
        //         console.log(gameObjectA, gameObjectB)
        //     }
        // })
        // this.matterCollision.addOnCollideEnd({
        //     objectA: bullet,
        //     objectB: this.knights.map(k => k.getSprite()),
        //     callback: () => ({gameObjectA, gameObjectB}) => {
        //         console.log(gameObjectA, gameObjectB)
        //     }
        // })
    }

    create() {

        this.tileMap = this.make.tilemap({key: 'map'})
        const tileset = this.tileMap.addTilesetImage('tower_defense3', "tiles")
        this.towerLayer = this.tileMap.createStaticLayer('Towers', tileset, 0, 0)
        // this.gunLayer = this.tileMap.createDynamicLayer('Guns', tileset, 0, 0)
        const pathLayer = this.tileMap.createStaticLayer('Path', tileset, 0, 0)
        const backgroundLayer = this.tileMap.createStaticLayer('Background', tileset, 0, 0)
        const {x: spawnX, y: spawnY} = this.tileMap.findObject("Spawn", obj => obj.name === "Spawn Point")
        this.goal = this.tileMap.findObject("Goal", obj => obj.name === "Goal Area")

        this.matter.world.convertTilemapLayer(this.towerLayer)
        // this.matter.world.convertTilemapLayer(this.gunLayer)
        this.matter.world.convertTilemapLayer(pathLayer)
        this.towerLayer.setCollisionByProperty({collides: true})
        this.matter.world.setBounds(0, 0, this.tileMap.widthInPixels, this.tileMap.heightInPixels);

        this.anims.create({
            key: 'green-knight-idle',
            frames: this.anims.generateFrameNames('green-knight', {start: 0, end: 3}),
            frameRate: 3,
            repeat: -1
        })

        this.knights = range(3).map(i => Knight.create(this, {x: spawnX + (-1) ** i * i, y: spawnY}))

        this.createMarker()
        this.marker.setPosition(32, 32)

        document.getElementById('restart-button').addEventListener('click', this.restartGame.bind(this))

        this.matterCollision.addOnCollideStart({
            objectA: this.knights.map(k => k.getSprite()),
            context: this,
            callback: () => console.log('test')
        })
    }

    update(time, delta) {
        this.guns.forEach(({sprite}) => sprite.update())
        // this.knights.forEach(knight => {
        // if(knight.x >= this.goal.x && knight.x <= this.goal.x + this.goal.width && knight.y >= this.goal.y){
        // alert('You lost!')
        // this.add
        //     .text(16, 16, "Arrow keys to scroll\nLeft-click to draw tiles\nShift + left-click to erase", {
        //         font: "18px monospace",
        //         fill: "#000000",
        //         padding: { x: 20, y: 10 },
        //         backgroundColor: "#ffffff"
        //     })
        //     .setScrollFactor(0);
        // }
        // const rand = Math.Between(0, 1000)
        // if (rand > 950) {
        //     knight.setVelocityX(-1)
        //     knight.setVelocityY(1)
        // } else if (rand > 975) {
        //     knight.setVelocityX(2)
        //     knight.setVelocityY(1)
        // } else {
        //     knight.setVelocityX(0)
        // }
        // })
        // Convert the mouse position to world position within the camera
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Vector2;

        // Place the marker in world space, but snap it to the tile grid. If we convert world -> tile and
        // then tile -> world, we end up with the position of the tile under the pointer
        const pointerTileXY = this.towerLayer.worldToTileXY(worldPoint.x, worldPoint.y);
        const tileAt = this.towerLayer.getTileAt(pointerTileXY.x, pointerTileXY.y) as GameTile

        if (tileAt && tileAt.properties && tileAt.properties.mount && !this.guns.find(({tile: {x, y}}) => x === pointerTileXY.x && y === pointerTileXY.y)) {
            const snappedWorldPoint = this.towerLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y)
            this.marker.setVisible(true)
            this.marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y)
            if (this.input.manager.activePointer.isDown) {
                const gunSprite = Gun.create(this, snappedWorldPoint, this.tileMap)
                const gun = {sprite: gunSprite, tile: tileAt}
                this.guns = [gun, ...this.guns]
            }
        }

    }

    restartGame() {
        this.scene.restart()
    }
}