import { Controller } from "./core/controller";

export class Confirm extends Controller{
    constructor(obj) {
        super(obj);
        window.addEventListener('load', this.load);
    }

    load = async () => {
        const data = await this.datasync.getSession("formData");
        this.value.setConfirm(data, this.config);
        this.files.setFiles(data);
        this.display.endLoadingAnimation();
        this.setTransitionBtn();
    }

}
