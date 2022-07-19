import { Controller } from "./core/controller";
import { Address } from "./modules/address";
import { Functions } from "./modules/functions";
import * as AutoKana from "vanilla-autokana";

export class Input extends Controller {
    constructor(obj) {
        super(obj);
        const that = Functions.setProps(this, obj, ["formQuery", "formItemWrapQuery"]);
        that.address = new Address(obj);
        window.addEventListener('load', that.load);
        return that;
    }

    /**
     * window.onload function
     */
    load = () => {
        // run form-validate
        this.form = document.querySelector(this.formQuery);
        this.setAutoKana(this.getKanaConf());
        this.setTransitionBtn();
        this.validate.initControl(Functions.getNames(this.formQuery));
        this.display.insertErrorArea(Object.keys(this.validate.control));
        // autocomplete from session
        this.initValidate();
        // set event
        const nodelist = document.querySelectorAll("input, textarea, select");
        nodelist.forEach(node => {
            ["blur", "change"].forEach(event => node.addEventListener(event, this.checkItem));
        });

    }

    /**
     * フォームデータを取得して値をセット
     * valid 処理を実行
     */
    initValidate = async () => {
        const sessionData = await this.datasync.getSession("formData");
        // sessionDataの中身があった場合、ページ内のフォームに値をセットしvalidation処理を実行する
        if(sessionData && 1 < Object.keys(sessionData).length) {
            this.value.setValue(this.formQuery, sessionData).forEach(name => this.validate.checkItem(name));
        }
        this.display.endLoadingAnimation();
        const formData = this.value.getValue(this.formQuery);
        const validResult = this.validate.run(formData);
        this.display.toggleErrors(validResult, this.validate.getCheckedNames());
    }

    /**
     * autokanaの設定値[autokana]オプション設定をconfig から取得する
     * @return {array} [ { "from": "i_last_name", "to": "i_last_kana", "katakana": true },... ]
     */
    getKanaConf = () => {
        return Object.keys(this.config).filter(key => this.config[key].hasOwnProperty('autokana')).map(key => {
            if(!Functions.getNames(this.formQuery).includes(key)) return;
            const obj = this.config[key].autokana;
            obj.from = key;
            return obj;
        });
    }

    /**
     * 連結文字の設定値[mixed]オプション設定をconfig から取得する
     * @return {array} [ { name: "i_CUSTOMER_FAMILYNAME", "mix": ["i_CUSTOMER_LASTNAME", "i_CUSTOMER_FIRSTNAME"], join: "　" },... ]
    */
    getMixedConf = () => {
       return Object.keys(this.config).filter(key => this.config[key].hasOwnProperty('mixed')).map(key => {
            const obj = this.config[key].mixed;
            obj.name = key;
            return obj;
        });
    }

    /**
     * ex) obj = { from: "#i_last_name", to: "#i_last_kana", katakana: true, }
     * katakana: true => from要素からto要素へカタカナ自動入力
     * @param {array} array
     */
    setAutoKana = (array) => {
        array.forEach(obj => {
            if(!obj) return;
            AutoKana.bind(`#${obj.from}`, `#${obj.to}`, { katakana: obj.katakana });
        });
    }

    /**
     * form item events
     * @param {object} e EventListener
     */
    checkItem = async (e) => {
        const data = Object.assign(
            // formData.files => ファイルURLが格納されているがvalidation不要項目のため除外
            Functions.branchObject(await this.datasync.getSession("formData"), ["files"]), 
            this.value.getValue(this.formQuery)
        );
        const fileControl = e.target.type === "file" ? this.files.changeFiles(e) : [];
        fileControl.forEach(obj => data[obj.itemName].push(obj));

        const validateData = Functions.getObjectIncludeNames(data, this.formQuery);

        this.validate.control[e.target.name] = true;


        const validResult = this.validate.run(validateData);


        this.display.toggleErrors(validResult, this.validate.getCheckedNames());
    };

    /**
     * 自動入力とバリデーション処理
     * @param {tring} formQuery
     * @param {object} data
     */
    autoInput = (formQuery, data) => {
        this.value.setValue(formQuery, data);
        this.validate.checkAll();
        const mixedData = this.value.getValue(formQuery, {mix: this.getMixedConf()});
        const result = this.validate.run(mixedData);
        this.display.toggleErrors(result, this.validate.getCheckedNames());
        this.display.toggleSubmitBtn(result.check);
        console.log(mixedData);
        console.log(result);
    }
}
