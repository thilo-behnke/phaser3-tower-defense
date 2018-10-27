import { CollisionGroup, default as GameScene } from '../scenes/GameScene';
import { Enemy } from './GameObject';
import { Bullet, default as RegularBullet } from './Bullet';
import { range } from 'lodash'
import Vector2 = Phaser.Math.Vector2;

export type GunParams = { coolDown: number, sprite: string }


export default abstract class Gun {
    protected scene: GameScene
    protected sprite: Phaser.Physics.Matter.Sprite
    private aimingAt: Enemy
    private gunParams: GunParams
    private coolDown: number
    public bulletProto: Bullet

    abstract generateBullets(dirX: number, dirY: number): void

    abstract clone(v: any, tv: any): Gun

    constructor(scene, v, tv, gunParams) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x + tv.tileWidth / 2, v.y + tv.tileHeight / 2, gunParams.sprite, 0, {isStatic: false})
            .setCollisionGroup(CollisionGroup.BULLET)
            .setAngle(0)
        this.gunParams = gunParams
        this.coolDown = 0
    }

    update(delta) {

        if (this.aimingAt && this.aimingAt.isDead()) {
            this.aimingAt = undefined
        }

        this.coolDown -= 1
        const nearest = this.scene.getNearestKnight({x: this.sprite.x, y: this.sprite.y})

        if (nearest && this.aimingAt !== nearest) {
            this.aimingAt = nearest
        }

        if (this.aimingAt) {
            const {x, y} = this.aimingAt.getXY()
            const {velX, velY} = this.aimingAt.getVelXY()
            const dist = (new Vector2(x - this.sprite.x, this.sprite.y - y)).length()
            const fromGun = new Vector2(x + velX * delta * dist / 500 - this.sprite.x, this.sprite.y - y - velY * delta * dist / 500)
            const fromGunNormalized = fromGun.normalize()
            const angle = Math.asin(fromGunNormalized.y) * 180 / Math.PI
            const translatedAngle = fromGunNormalized.x > 0
                ? 90 - angle
                : angle - 90
            const angleDiff = this.sprite.angle - translatedAngle
            if (Math.abs(angleDiff) > 10) {
                const spriteAngle360 = this.sprite.angle < 0 ? 360 + this.sprite.angle : this.sprite.angle
                const aimingAtAngle360 = translatedAngle < 0 ? 360 + translatedAngle : translatedAngle
                const dir = aimingAtAngle360 > spriteAngle360
                    ? (aimingAtAngle360 - spriteAngle360 <= 180 ? 1 : -1)
                    : (spriteAngle360 - aimingAtAngle360 <= 180 ? -1 : 1)
                this.sprite.setAngularVelocity(dir / 5)
            } else {
                // TODO: Implement range
                if (this.coolDown <= 0) {
                    const spriteAngle360 = this.sprite.angle < 0 ? 360 + this.sprite.angle : this.sprite.angle
                    const {x, y} = {
                        x: Math.cos((450 - spriteAngle360) % 360 / 180 * Math.PI),
                        y: Math.sin((450 - spriteAngle360) % 360 / 180 * Math.PI)
                    }
                    this.generateBullets(x, y)
                    this.coolDown = this.gunParams.coolDown
                }
                this.sprite.setAngularVelocity(0)
            }
        } else {
            this.sprite.setAngularVelocity(0)
        }

    }

    getXY() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    getCenter() {
        return this.sprite.getCenter
    }
}

export class MachineGun extends Gun {

    constructor(scene, v, tv) {
        super(scene, v, tv, {coolDown: 10, sprite: 'machine_gun'})
        this.bulletProto = RegularBullet.create(this.scene, v, tv, {damage: 1, scale: {x: 0.7, y: 0.7}, frictionAir: 0, mass: 0.005})
    }

    static create(scene, v, tv) {
        return new MachineGun(scene, v, tv)
    }

    public clone(v, tv) {
        return MachineGun.create(this.scene, v, tv)
    }

    generateBullets(dirX, dirY) {
        const {x, y} = this.getXY()
        const spriteAngle360 = this.sprite.angle < 0 ? 360 + this.sprite.angle : this.sprite.angle
        this.scene.spawnBullet(this.bulletProto,
            {
                x: x + Math.cos((450 - (spriteAngle360 - 50)) / 180 * Math.PI) * 10,
                y: y - Math.sin((450 - (spriteAngle360 - 50)) / 180 * Math.PI) * 10,
            },
            {
                dirX: dirX / 2,
                dirY: dirY / 2
            }, this.sprite.angle)
        this.scene.spawnBullet(this.bulletProto, {
            x: x + Math.cos((450 - (spriteAngle360 + 50)) / 180 * Math.PI) * 10,
            y: y - Math.sin((450 - (spriteAngle360 + 50)) / 180 * Math.PI) * 10,
        }, {
            dirX: dirX / 2,
            dirY: dirY / 2
        }, this.sprite.angle)
    }

}

export class ShotGun extends Gun {

    constructor(scene, v, tv) {
        super(scene, v, tv, {coolDown: 100, sprite: 'shotgun'})
        this.bulletProto = RegularBullet.create(this.scene, v, tv, {damage: 20, scale: {x: 2, y: 1}, frictionAir: 0.2, mass: 2})
    }

    static create(scene, v, tv) {
        return new ShotGun(scene, v, tv)
    }

    public clone(v, tv) {
        return ShotGun.create(this.scene, v, tv)
    }

    generateBullets(dirX, dirY) {
        const {x, y} = this.getXY()
        const spriteAngle360 = this.sprite.angle < 0 ? 360 + this.sprite.angle : this.sprite.angle
        return range(6).map(i => this.scene.spawnBullet(this.bulletProto,
            {
                x: x + Math.cos((450 - (spriteAngle360 - ((-1) ** i) * Math.ceil(i / 2) * 15)) / 180 * Math.PI) * 50,
                y: y - Math.sin((450 - (spriteAngle360 - ((-1) ** i) * Math.ceil(i / 2) * 15)) / 180 * Math.PI) * 50,
            },
            {dirX, dirY}, this.sprite.angle))
    }

}

export class SingleRocketLauncher extends Gun {

    constructor(scene, v, tv) {
        super(scene, v, tv, {coolDown: 100, sprite: 'shotgun'})
        this.bulletProto = RegularBullet.create(this.scene, v, tv, {damage: 20, scale: {x: 0.5, y: 0.5}})
    }

    static create(scene, v, tv) {
        return new SingleRocketLauncher(scene, v, tv)
    }

    public clone(v, tv) {
        return SingleRocketLauncher.create(this.scene, v, tv)
    }

    generateBullets(dirX, dirY) {
        const {x, y} = this.getXY()
        return range(5).map(i => this.scene.spawnBullet(this.bulletProto, {
            x: x + 10 * i,
            y: y + Math.floor(i / 3) * 5
        }, {dirX, dirY}, this.sprite.angle))
    }

}