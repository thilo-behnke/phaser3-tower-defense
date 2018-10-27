import { flatten, partition } from 'lodash';
import { Enemy, default as GameObject, CanDie } from './GameObject';

export interface List<T> {
    forEach: (callback: () => void) => void
    map: (callback: (v: T) => T, i: number, arr: T[]) => T[]
    reduce: <S>(callback: (acc: S, x: T) => S, acc: S) => S
}

export default class AutoRemoveList<T extends CanDie> implements List<T> {
    public list: T[]

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

    map(callback: (v: T, i: number, arr: T[]) => T) {
        return this.list.map(callback)
    }

    reduce<S>(callback: (acc: S, x: T) => S, acc: S) {
        return this.list.reduce(callback, acc)
    }

    update(delta) {
        this.list.forEach(e => e.update(delta))
        const [dead, alive] = partition(this.list, e => e.isDead())
        dead.forEach(e => setTimeout(() => e.destroy(), 300))
        this.list = alive
    }
}