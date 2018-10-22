

export default class Knight {
    private scene: Phaser.Scene
    private sprite: Phaser.Physics.Matter.Sprite

    constructor(scene, v) {
        this.scene = scene
        this.sprite = this.scene.matter.add
            .sprite(v.x, v.y, 'green-knight', 0)
            .setVelocityY(2) as Phaser.Physics.Matter.Sprite
        this.sprite
            .setFixedRotation()
            .setFrictionAir(0)
        this.sprite.anims.play('green-knight-idle')
    }

    static create(scene, v) {
        return new Knight(scene, v)
    }

    update() {
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

}