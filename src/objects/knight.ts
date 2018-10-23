import { Enemy } from './enemyList';
import { CollisionGroup, default as GameScene } from '../scenes/GameScene';
const { Body, Bodies } = Phaser.Physics.Matter.Matter

export default class Knight implements Enemy {
    private scene: GameScene
    private sensors: {left: any, right: any}
    private isTouching: {left: boolean, right: boolean}
    private sprite: Phaser.Physics.Matter.Sprite
    private hp: number

    constructor(scene, v) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(0, 0, 'green-knight', 0)
        const { width: w, height: h } = this.sprite;
        const mainBody = Bodies.rectangle(0, 0, w * 0.6, h, { chamfer: { radius: 10 } });
        this.sensors = {
            left: Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { isSensor: true }),
            right: Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { isSensor: true })
        };
        const compoundBody = Body.create({
            parts: [mainBody, this.sensors.left, this.sensors.right],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 0.1
        });
        this.sprite
            .setExistingBody(compoundBody)
            .setVelocityY(4)
            .setFixedRotation()
            .setFrictionAir(0)
            .setPosition(v.x, v.y)
            .setCollisionGroup(CollisionGroup.ENEMY)
        this.sprite.anims.play('green-knight-idle')
        this.hp = 10
        this.isTouching = {left: false, right: false}
    }

    static create(scene, v) {
        return new Knight(scene, v)
    }

    update() {
        this.sprite.setVelocityY(4)
        console.log(this.scene.hasReachedGoal(this))
        // this.sprite.applyForce(new Phaser.Math.Vector2(0.005, 0))
    }

    onSensorCollide({ bodyA, bodyB, pair }) {
        // Watch for the player colliding with walls/objects on either side and the ground below, so
        // that we can use that logic inside of update to move the player.
        // Note: we are using the "pair.separation" here. That number tells us how much bodyA and bodyB
        // overlap. We want to teleport the sprite away from walls just enough so that the player won't
        // be able to press up against the wall and use friction to hang in midair. This formula leaves
        // 0.5px of overlap with the sensor so that the sensor will stay colliding on the next tick if
        // the player doesn't move.
        if (bodyB.isSensor) return; // We only care about collisions with physical objects
        if (bodyA === this.sensors.left) {
            this.isTouching.left = true;
            if (pair.separation > 0.5) this.sprite.x += pair.separation - 0.5;
        } else if (bodyA === this.sensors.right) {
            this.isTouching.right = true;
            if (pair.separation > 0.5) this.sprite.x -= pair.separation - 0.5;
        }
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

    hasReachedEnd(){
        return true
    }
}
