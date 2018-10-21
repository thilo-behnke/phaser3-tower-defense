import { AUTO, Game } from 'phaser';
import GameScene from './scenes/GameScene';

const config = {
    type: AUTO,
    parent: 'phaser-example',
    width: 320,
    height: 320,
    pixelArt: true,
    scene: GameScene,
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: {
                y: 0
            }
        }
    }
};

const game = new Game(config);
