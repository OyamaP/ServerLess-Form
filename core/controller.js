import { DataSync } from '../modules/datasync';
import { Display } from '../modules/display';
import { Files } from '../modules/files';
import { Functions } from '../modules/functions';
import { Validate } from '../modules/validate';
import { Value } from '../modules/value';

export class Controller {
    constructor(obj) {
        const that = Functions.setProps(this, obj, ["config", "formQuery", "location", "afterToggleErrors"]);
        that.datasync = new DataSync(obj);
        that.display = new Display(obj);
        that.files = new Files(obj);
        that.validate = new Validate(obj);
        that.value = new Value();
        return that;
    }

    /**
     * 遷移に関するイベントを設定
     * location = [ { query: ".js-submit", post: "form" }, {...} ]
     * query プロパティで設定された要素にイベントを追加
     */
    setTransitionBtn = () => {
        this.location.forEach(obj => {
            const ele = document.querySelector(obj.query);
            if(obj.post) {
                ele.addEventListener("click", () => this.submit(obj));
            }
            else {
                ele.addEventListener("click", () => Functions.transition(obj, "nextUrl"));
            }
        });

    }

    /**
     * 送信処理後遷移する
     * @param {object} location
     */
    submit = async (location) => {
        // 送信中ならキャンセル
        if(this.display.isSending(location)) return;

        // 全項目チェック対象に変更
        this.validate.checkAll();
        // 非同期：画像 読込中のファイルがあれば中止
        const files = this.files.control;
        const loadingFiles = files.filter(obj => (!obj.blob || !obj.endpoint) );
        if(loadingFiles.length) {
            console.log("Caution: Loading files");
            alert("ファイルの読込中です、完了後に送信をお願いします。");
            return;
        }
        // フォームから入力値を加工して取得しsessionに上書きする
        const data = Object.assign(
            Functions.branchObject(await this.datasync.getSession("formData"), ["files"]),
            this.value.getValue(this.formQuery, {mix: this.getMixedConf()})
        );

        // file情報の加工
        const fileInfo = this.files.getFileInfo(this.formQuery);
        data.fileInfoObject = fileInfo;
        let validateData = Functions.branchObject(data);
        Object.keys(fileInfo).forEach(key => validateData[key] = fileInfo[key]);

        // ページに表示されているアイテムのみに整理する
        validateData = Functions.getObjectIncludeNames(validateData, this.formQuery);
        // validationエラーの場合は送信しない
        const validResult = this.validate.run(validateData);

        if(!validResult.check) {
            console.log("Invalid", validResult);
            this.display.toggleErrors(validResult, this.validate.getCheckedNames());
            this.display.errorScroll();
            return;
        }

        // 送信ボタンを切替
        this.display.toggleSending(location);

        // 画像送信
        const promiseS3Image = files.length ? this.datasync.postS3Image(files) : [];

        // 非同期処理終了後
        const promises = [].concat(promiseS3Image);
        // デバッグモードの場合終了
        if(Functions.getParam("debug_submit")) {
            console.log("data", data);
            console.log("validResult", validResult);
            console.log("files", files);
            console.log("promises", promises);
            this.display.toggleSending(location);
            return;
        }
        Promise.all(promises).then(async values => {
            let result;
            switch(location.post) {
                case "form":
                    result = await this.datasync.postForm(data, location);
                    break;
                case "session":
                    result = await this.datasync.postSession(data, location);
                    break;
                default:
                    result = false;
                    break;
            }
            if(!result) this.display.toggleSending(location);
        })
        .catch(error => {
            // 送信ボタンを切替
            this.display.toggleSending(location);
            // errorUrl 未定義の場合は遷移しない
            if(!location.errorUrl) return;
            // errorUrl はreplace して遷移する
            Functions.transition(location, "errorUrl");
        });
    }

}
