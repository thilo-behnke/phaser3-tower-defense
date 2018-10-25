import { CollisionGroup } from '../scenes/GameScene';
import Scene = Phaser.Scene;
import Sprite = Phaser.Physics.Matter.Sprite;

export interface Bullet {
    bulletParams: BulletParams
    hasCollided: () => boolean
    destroy: () => void
    getSprite: () => Sprite
}

export type BulletParams = {
    scale: {x: number, y: number},
    damage: number
}

export default class SmallBullet implements Bullet {

    private scene: Scene
    private sprite: Sprite
    private collided: boolean

    public bulletParams: BulletParams

    constructor(scene, {x, y}, {dirX, dirY}, bulletParams) {
        this.scene = scene
        this.bulletParams = bulletParams
        const {scale: {x: scaleX, y: scaleY}} = bulletParams
        const sprite = this.scene.matter.add
            .sprite(x, y, 'none')
            .setScale(scaleX, scaleY)
            .setVelocity(dirX * 30, -dirY * 30) as Sprite
        sprite.setCollisionGroup(CollisionGroup.BULLET)
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
        return new SmallBullet(scene, {x, y}, {dirX, dirY}, bulletParams)
    }

    clone(pos, dir){
        return SmallBullet.create(this.scene, pos, dir, this.bulletParams)
    }

    getSprite(){
        return this.sprite
    }

    hasCollided(){
        return this.collided
    }

    destroy() {
        this.sprite.destroy()
    }

}
