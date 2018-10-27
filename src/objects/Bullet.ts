import { CollisionGroup } from '../scenes/GameScene';
import { CanDie } from './GameObject';
import Scene = Phaser.Scene;
import Sprite = Phaser.Physics.Matter.Sprite;
import Bodies = Phaser.Physics.Matter.Matter.Bodies;

export interface Bullet extends CanDie {
    bulletParams: BulletParams
    destroy: () => void
    getSprite: () => Sprite
    setAngle: (angle: number) => void
}

export type BulletParams = {
    scale: { x: number, y: number },
    damage: number,
    frictionAir: number,
    mass: number
}

export default class RegularBullet implements Bullet {

    private scene: Scene
    private sprite: Sprite
    private collided: boolean

    public bulletParams: BulletParams

    constructor(scene, {x, y}, {dirX, dirY}, bulletParams) {
        this.scene = scene
        this.bulletParams = bulletParams
        const {scale: {x: scaleX, y: scaleY}} = bulletParams
        const sprite = this.scene.matter.add
            .sprite(x, y, 'small_bullet')
        sprite.setExistingBody(Bodies.rectangle(x, y, sprite.width, sprite.height, {chamfer: {radius: 20}}))
            .setScale(scaleX, scaleY)
            .setVelocity(dirX * 30, -dirY * 30)
            .setMass(bulletParams.mass)
            .setFrictionAir(bulletParams.frictionAir)
            .setCollisionGroup(CollisionGroup.BULLET)
        this.sprite = sprite
        this.scene.matterCollision.addOnCollideStart({
            objectA: this.sprite,
            context: this,
            callback: () => {
                this.collided = true
            }
        })
    }

    static create(scene, {x, y}, {dirX, dirY}, bulletParams) {
        return new RegularBullet(scene, {x, y}, {dirX, dirY}, bulletParams)
    }

    clone(pos, dir, angle) {
        return RegularBullet.create(this.scene, pos, dir, this.bulletParams)
            .setAngle(angle)
    }

    getSprite() {
        return this.sprite
    }

    getXY() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    getVelXY() {
        return {
            velX: (this.sprite.body as MatterJS.Body).velocity.x,
            velY: (this.sprite.body as MatterJS.Body).velocity.y
        }
    }

    setAngle(angle){
        this.sprite.setAngle(angle)
        return this
    }

    isDead() {
        return this.collided
    }

    destroy() {
        this.sprite.destroy()
    }

    update(delta) {
        if(Math.abs((this.sprite.body as MatterJS.Body).velocity.x) <= 0.001 && Math.abs((this.sprite.body as MatterJS.Body).velocity.x) <= 0.001){
            this.collided = true
        }
    }

}

export class TrackingBullet extends RegularBullet {
    update(delta){
        super.update(delta)

    }
}
