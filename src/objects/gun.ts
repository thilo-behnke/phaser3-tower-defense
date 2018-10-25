import { CollisionGroup, default as GameScene } from '../scenes/GameScene';
import { Enemy } from './GameObject';
import { Bullet, default as SmallBullet } from './Bullet';
import {range} from 'lodash'

export type GunParams = {coolDown: number, sprite: string}


export default abstract class Gun {
    protected scene: GameScene
    private sprite: Phaser.Physics.Matter.Sprite
    private aimingAt: Enemy
    private gunParams: GunParams
    private coolDown: number
    public bulletProto: Bullet

    abstract generateBullets(dirX: number, dirY: number): void
    abstract clone(v: any, tv: any): Gun

    constructor(scene, v, tv, gunParams) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x + tv.tileWidth / 2, v.y + tv.tileHeight / 2, gunParams.sprite, 0, {isStatic: true})
            .setAngle(90)
        this.sprite.setCollisionGroup(CollisionGroup.BULLET)
        this.gunParams = gunParams
        this.coolDown = gunParams.coolDown
    }

    update() {
        this.aimingAt = this.scene.getNearestKnight({x: this.sprite.x, y: this.sprite.y})
        this.coolDown -= 1
        if (this.aimingAt) {
            const {x, y} = this.aimingAt.getXY()
            const {velX, velY} = this.aimingAt.getVelXY()
            const v = {x: x + velX * 10 - this.sprite.x, y: this.sprite.y - y - velY * 10}
            const magn = Math.sqrt(v.x ** 2 + v.y ** 2)
            const normV = {x: v.x / magn, y: v.y / magn}
            const angle = Math.asin(normV.y) * 180 / Math.PI
            const translatedAngle = normV.x > 0
                ? 90 - angle
                : angle - 90
            this.sprite.setAngle(translatedAngle)
            if (this.coolDown <= 0) {
                this.generateBullets(normV.x, normV.y)
                this.coolDown = this.gunParams.coolDown
            }
        }

    }

    getXY(){
        return {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    getCenter(){
        return this.sprite.getCenter
    }
}

export class MachineGun extends Gun {

    constructor(scene, v, tv) {
        super(scene, v, tv, {coolDown: 10, sprite: 'machine_gun'})
        this.bulletProto = SmallBullet.create(this.scene, v, tv, {damage: 1, scale: {x: 0.20, y: 0.20}})
    }

    static create(scene, v, tv) {
        return new MachineGun(scene, v, tv)
    }

    public clone(v, tv){
        return MachineGun.create(this.scene, v, tv)
    }

    generateBullets(dirX, dirY){
        const {x, y} = this.getXY()
        this.scene.spawnBullet(this.bulletProto, {x, y}, {
            dirX: dirX,
            dirY: dirY
        })
        this.scene.spawnBullet(this.bulletProto, {x: x + 10, y}, {
            dirX: dirX,
            dirY: dirY
        })
    }

}

export class ShotGun extends Gun {

    constructor(scene, v, tv) {
        super(scene, v, tv, {coolDown: 100, sprite: 'shotgun'})
        this.bulletProto = SmallBullet.create(this.scene, v, tv, {damage: 20, scale: {x: 0.5, y: 0.5}})
    }

    static create(scene, v, tv) {
        return new ShotGun(scene, v, tv)
    }

    public clone(v, tv){
        return ShotGun.create(this.scene, v, tv)
    }

    generateBullets(dirX, dirY){
        const {x, y} = this.getXY()
        return range(5).map(i => this.scene.spawnBullet(this.bulletProto, {x: x + 10 * i, y: y + Math.floor(i / 3) * 5}, {dirX, dirY}))
    }

}