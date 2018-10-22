import Knight from './knight';
import { default as GameScene } from '../scenes/GameScene';
import Body = MatterJS.Body;

export default class Gun {
    private scene: GameScene
    private sprite: Phaser.Physics.Matter.Sprite
    private aimingAt: Knight

    constructor(scene, v, tv) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x + tv.tileWidth / 2, v.y + tv.tileHeight / 2, 'gun-red', 0, {isStatic: true})
            .setAngle(90)
    }

    static create(scene, v, tv) {
        return new Gun(scene, v, tv)
    }

    update() {
        this.aimingAt = this.scene.getNearestKnight({x: this.sprite.x, y: this.sprite.y})
        const {x, y} = this.aimingAt.getXY()
        const v = {x: x - this.sprite.x, y: this.sprite.y - y}
        const magn = Math.sqrt(v.x ** 2 + v.y ** 2)
        const normV = {x: v.x / magn, y: v.y / magn}
        const angle = Math.asin(normV.y) * 180 / Math.PI
        if (normV.x > 0) {
            this.sprite.setAngle(90 - angle)
        } else {
            this.sprite.setAngle(angle - 90)
        }
        this.scene.spawnBullet({x: this.sprite.x, y: this.sprite.y}, {dirX: normV.x, dirY: normV.y})
        // const bullet = this.scene.matter.add
        //     .sprite(this.sprite.x, this.sprite.y, "none")
        //     .setScale(0.10, 0.10)
        //     .setVelocity(normV.x * 10, -normV.y * 10)
            // .applyForce(new Phaser.Math.Vector2({x: 1, y: 1}))
    }

}