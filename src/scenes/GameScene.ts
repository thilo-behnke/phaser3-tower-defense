import { Scene, Math } from "phaser";
import { range } from 'lodash';
import { map, compose, pipe } from 'lodash/fp';
import * as tilesetImg from '../../assets/towerDefense_tilesheet@2_res.png'
import * as levelFile1 from '../../assets/maps/level1.json'
import * as greenKnightImg from '../../assets/green-knight.png'
import Sprite = Phaser.Physics.Matter.Sprite;
import GameObject = Phaser.GameObjects.GameObject;

export default class GameScene extends Scene {

    private knights: Sprite[]
    private goal: GameObject

    preload() {
        this.load.image("tiles", tilesetImg);
        this.load.spritesheet("green-knight", greenKnightImg, {
            frameWidth: 20,
            frameHeight: 29,
            // margin: 2,
            // spacing: 2
        })
        this.load.tilemapTiledJSON("map", levelFile1);
    }

    create() {

        const tileMap = this.make.tilemap({key: 'map'})
        const tileset = tileMap.addTilesetImage('tower_defense3', "tiles")
        const towerLayer = tileMap.createStaticLayer('Towers', tileset, 0, 0)
        const pathLayer = tileMap.createStaticLayer('Path', tileset, 0, 0)
        const backgroundLayer = tileMap.createStaticLayer('Background', tileset, 0, 0)
        const {x: spawnX, y: spawnY} = tileMap.findObject("Spawn", obj => obj.name === "Spawn Point")
        this.goal = tileMap.findObject("Goal", obj => obj.name === "Goal Area")

        this.matter.world.convertTilemapLayer(towerLayer)
        this.matter.world.convertTilemapLayer(pathLayer)
        towerLayer.setCollisionByProperty({collides: true})
        this.matter.world.setBounds(0, 0, tileMap.widthInPixels, tileMap.heightInPixels);

        this.matter.world.on('collisionstart', console.log)


        this.anims.create({
            key: 'green-knight-idle',
            frames: this.anims.generateFrameNames('green-knight', {start: 0, end: 3}),
            frameRate: 3,
            repeat: -1
        })

        this.knights = range(3).map(x => {
            const sprite = this.matter.add.sprite(spawnX + (-1) ** x * x, spawnY, 'green-knight', 0)
            sprite.setVelocityY(2)
            sprite.setFrictionAir(0)
            sprite.setFixedRotation()
            sprite.anims.play('green-knight-idle')
            return sprite
        })
    }

    update() {
        this.knights.forEach(knight => {
            if(knight.x >= this.goal.x && knight.x <= this.goal.x + this.goal.width && knight.y >= this.goal.y){
                alert('You lost!')
            }
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
        })
    }
}