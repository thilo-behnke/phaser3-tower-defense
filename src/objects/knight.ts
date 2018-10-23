import { Enemy } from './enemyList';


export default class Knight implements Enemy {
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Sprite
    private hp: number

    constructor(scene, v) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x, v.y, 'green-knight', 0)
            .setVelocityY(4) as Phaser.Physics.Matter.Sprite
        this.sprite
            .setFixedRotation()
            .setFrictionAir(0)
        this.sprite.anims.play('green-knight-idle')
        this.hp = 50
    }

    static create(scene, v) {
        return new Knight(scene, v)
    }

    update() {
        this.sprite.setVelocity(4)
        // this.sprite.applyForce(new Phaser.Math.Vector2(0.005, 0))
    }

    getXY(){
        return {
            x: this.sprite.x,
            y: this.sprite.y
        }
    }

    getSprite(){
        return this.sprite
    }

    getHit(){
        this.hp -= 1
    }

    isDead(){
        return this.hp <= 0
    }

    destroy(){
        this.sprite.destroy()
    }
}