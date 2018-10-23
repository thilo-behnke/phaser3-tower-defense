import { CollisionGroup } from '../scenes/GameScene';
import Scene = Phaser.Scene;
import Sprite = Phaser.Physics.Matter.Sprite;

export interface Bullet {
    destroy: () => void
}

export default class SmallBullet implements Bullet {

    private scene: Scene
    private sprite: Sprite

    constructor(scene, {x, y}, {dirX, dirY}) {
        this.scene = scene
        const sprite = this.scene.matter.add
            .sprite(x, y, 'none')
            .setScale(0.20, 0.20)
            .setVelocity(dirX * 30, -dirY * 30) as Sprite
        sprite.setCollisionGroup(CollisionGroup.BULLET)
        this.sprite = sprite
        this.scene.matterCollision.addOnCollideStart({
            objectA: this.sprite,
            context: this,
            callback: () => {
                setTimeout( () => this.destroy(), 5000)

            }
        })
    }

    static create(scene, {x, y}, {dirX, dirY}) {
        return new SmallBullet(scene, {x, y}, {dirX, dirY})
    }

    destroy() {
        this.sprite.destroy()
    }

}
