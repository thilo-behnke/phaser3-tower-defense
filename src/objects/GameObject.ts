import Sprite = Phaser.Physics.Matter.Sprite;

export default interface GameObject {
    getXY: () => { x: number, y: number }
    getVelXY: () => { velX: number, velY: number }
    getSprite: () => Sprite
    destroy: () => void
    update: () => void
}

export interface CanDie extends GameObject {
    isDead: () => boolean
}

export interface Enemy extends CanDie {
    getHit: (damage: number) => void
    hasReachedEnd: () => boolean
}