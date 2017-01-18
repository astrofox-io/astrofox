import Display from '../displays/Display';

export default class Effect extends Display {
    constructor(type, options) {
        super(type, options);
    }

    update(options) {
        if (this.pass && options && options.enabled !== undefined) {
            this.pass.options.enabled = options.enabled;
        }

        return super.update(options);
    }

    setPass(pass) {
        this.pass = pass;
        pass.options.enabled = this.options.enabled;

        this.owner.updatePasses();
    }

    updatePass() {
        this.pass.setUniforms(this.options);
    }

    setSize(width, height) {
        let pass = this.pass;

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