import Display from 'core/Display';

export default class Effect extends Display {
    update(options) {
        if (this.pass && options && options.enabled !== undefined) {
            this.pass.options.enabled = options.enabled;
        }

        return super.update(options);
    }

    setPass(pass) {
        this.pass = pass;
        this.pass.options.enabled = this.options.enabled;

        this.scene.updatePasses();
    }

    updatePass() {
        this.pass.setUniforms(this.options);
    }

    setSize(width, height) {
        const { pass } = this;

        if (pass) {
            pass.setSize(width, height);
        }
    }

    renderToScene() {
        if (this.hasUpdate) {
            this.updatePass();

            this.hasUpdate = false;
        }
    }
}
