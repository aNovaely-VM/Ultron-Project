import * as THREE from "three";

class SceneInit {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
        this.clock = new THREE.Clock();
        this.updateCallbacks = [];
    }

    initialize() {
        this.camera.position.z = 50;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        this.updateCallbacks.forEach(callback => callback(delta));
        this.renderer.render(this.scene, this.camera);
    }

    addUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
    }

    dispose() {
        this.renderer.dispose();
        this.scene.clear();
    }
}

export default SceneInit;

