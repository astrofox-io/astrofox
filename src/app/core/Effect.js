import Display from 'core/Display';

export default class Effect extends Display {
    update(options = {}) {
        const { pass } = this;
        const { enabled } = options;

        if (pass && enabled !== undefined) {
            pass.options.enabled = enabled;
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
