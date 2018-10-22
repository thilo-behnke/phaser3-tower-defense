import * as PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin'
import { AUTO, Game } from 'phaser';
import GameScene from './scenes/GameScene';

const config = {
    type: AUTO,
    parent: 'game',
    width: 320,
    height: 320,
    pixelArt: true,
    scene: GameScene,
    transparent: true,
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: {
                y: 0
            }
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin, // The plugin class
                key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
                mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
            }
        ]
    }
};

const game = new Game(config);
