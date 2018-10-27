import { CollisionGroup } from '../scenes/GameScene';
import { CanDie, Enemy } from './GameObject';
import Scene = Phaser.Scene;
import Sprite = Phaser.Physics.Matter.Sprite;
import Bodies = Phaser.Physics.Matter.Matter.Bodies;
import Vector2 = Phaser.Math.Vector2;

export interface Bullet extends CanDie {
    bulletParams: BulletParams
    destroy: () => void
    getSprite: () => Sprite
    setAngle: (angle: number) => void
    clone: (pos, dir, angle) => Bullet
    onCollide: () => void
}

export type BulletParams = {
    scale: { x: number, y: number },
    damage: number,
    frictionAir: number,
    mass: number
}

export default abstract class RegularBullet implements Bullet {

    protected scene: Scene
    protected sprite: Sprite
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

    // TODO: No better way to structure hierarchie?
    clone(pos, dir, angle){
        return {} as any
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

    onCollide(){

    }

}

export class StraightBullet extends RegularBullet {
    static create(scene, {x, y}, {dirX, dirY}, bulletParams) {
        return new StraightBullet(scene, {x, y}, {dirX, dirY}, bulletParams)
    }
    clone(pos, dir, angle) {
        return StraightBullet.create(this.scene, pos, dir, this.bulletParams)
            .setAngle(angle)
    }
}

export class TrackingBullet extends RegularBullet {

    target: Enemy

    constructor(scene, {x, y}, {dirX, dirY}, bulletParams){
        super(scene, {x, y}, {dirX, dirY}, bulletParams)
    }

    static create(scene, {x, y}, {dirX, dirY}, bulletParams) {
        return new TrackingBullet(scene, {x, y}, {dirX, dirY}, bulletParams)
    }
    clone(pos, dir, angle) {
        return TrackingBullet.create(this.scene, pos, dir, this.bulletParams)
            .setAngle(angle)
    }

    setTarget(target){
        this.target = target
        return this
    }

    update(delta){
        super.update(delta)
        if(this.target.getSprite().body){
            // TODO: Refactor
            const {x: targetX, y: targetY} = this.target.getXY()
            const v = new Vector2(targetX - this.sprite.x, this.sprite.y - targetY)
            const vNorm = v.normalize()
            const angle = Math.asin(vNorm.y) * 180 / Math.PI
            const translatedAngle = vNorm.x > 0
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
                this.sprite.setVelocity(vNorm.x * 10, vNorm.y * 10)
            } else {
                this.sprite.setAngularVelocity(0)
            }
        }
    }

    onCollide(){
        // TODO: Create explosion
    }
}
