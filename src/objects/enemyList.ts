import { flatten, partition } from 'lodash';
import Sprite = Phaser.Physics.Matter.Sprite;

export interface Enemy {
    getXY: () => { x: number, y: number }
    getSprite: () => Sprite
    getHit: () => void
    isDead: () => boolean
    hasReachedEnd: () => boolean
    destroy: () => void
    update: () => void
}

export interface List<T> {
    forEach: (callback: () => void) => void
    map: (callback: (v: T) => T, i: number, arr: T[]) => T[]
    reduce: <S>(callback: (acc: S, x: T) => S, acc: S) => S
}

export default class enemyList implements List<Enemy> {
    public list: Enemy[]

    constructor(...es) {
        this.list = flatten(es)
    }

    [Symbol.iterator] = function* () {
        yield* this.list
    }

    add(...es) {
        this.list = flatten([...es, ...this.list])
        return this
    }

    forEach(callback) {
        return this.list.forEach(callback)
    }

    map(callback: (v: Enemy, i: number, arr: Enemy[]) => Enemy) {
        return this.list.map(callback)
    }

    reduce<S>(callback: (acc: S, x: Enemy) => S, acc: S) {
        return this.list.reduce(callback, acc)
    }

    update() {
        this.list.forEach(e => e.update())
        const [dead, alive] = partition(this.list, e => e.isDead())
        dead.forEach(e => e.destroy())
        this.list = alive
    }
}