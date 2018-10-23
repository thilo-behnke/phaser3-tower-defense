import { Enemy } from './enemyList';
import { CollisionGroup } from '../scenes/GameScene';
// const { Body, Bodies } = Phaser.Physics.Matter.Matter

export default class Knight implements Enemy {
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Sprite
    private hp: number

    constructor(scene, v) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x, v.y, 'green-knight', 0)
        this.sprite
            .setVelocityY(4)
        this.sprite
            .setFixedRotation()
            .setFrictionAir(0)
        const { width: w, height: h } = this.sprite;
        // const mainBody = Bodies.rectangle(0, 0, w * 0.6, h, { chamfer: { radius: 10 } });
        // this.sensors = {
        //     bottom: Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { isSensor: true }),
        //     left: Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { isSensor: true }),
        //     right: Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { isSensor: true })
        // };
        // const compoundBody = Body.create({
        //     parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
        //     frictionStatic: 0,
        //     frictionAir: 0.02,
        //     friction: 0.1
        // });
        console.log(Phaser.Physics.Matter)
        this.sprite.setCollisionGroup(CollisionGroup.ENEMY)
        this.sprite.anims.play('green-knight-idle')
        this.hp = 10
    }

    static create(scene, v) {
        return new Knight(scene, v)
    }

    update() {
        this.sprite.setVelocity(4)
        // this.sprite.applyForce(new Phaser.Math.Vector2(0.005, 0))
    }

    getXY() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    getSprite() {
        return this.sprite
    }

    getHit() {
        this.hp -= 1
    }

    isDead() {
        return this.hp <= 0
    }

    destroy() {
        this.sprite.destroy()
    }
}
