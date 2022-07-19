import { Functions } from "./functions";
import * as Validator from "validatorjs";
Validator.useLang("ja");

/**
 * vanillaJSライブラリ validatorjs を利用
 * rule, message の設定については公式ドキュメントを参照
 * https://github.com/mikeerickson/validatorjs
 */
export class Validate {
    constructor(obj) {
        const that = Functions.setProps(this, obj, ["config", "addValidMessages", "addValidRules"]);
        that.control = {};
        that.setRules();
        return that;
    }

    /**
     * validate対象の初期化
     * @param {array} names
     * configでrulesとmessages を持っている && 指定したformの中に存在する項目name である場合にvalidationの対象とする
     */
    initControl = (names) => {
        this.control = Object.keys(this.config).reduce((self, name) => {
            if( !["rules", "messages"].every(prop => this.config[name].hasOwnProperty(prop)) || !names.includes(name) ) return self;
            self[name] = false;
            return self;
        },{});
    };

    /**
     * 全項目をcheck済フラグにする
     */
    checkAll = () => {
        Object.keys(this.control).forEach(key => this.control[key] = true);
    };

    /**
     * 指定nameをcheck済フラグにする
     */
    checkItem = (name) => {
        this.control[name] = true;
    };

    /**
     * check済のItemを配列でreturnする
     * @return {array}
     */
    getCheckedNames = () => {
        return Object.keys(this.control).filter(key => this.control[key]);
    }

    /**
     * data[key]の値を持つruleを検索してreturnする
     * @param {object} data
     * @return {object}
     */
    getRules = (data) => {
        return Object.keys(data).reduce((self, key) => {
            if(!this.config[key] || !this.config[key].hasOwnProperty("rules") ) return self;
            self[key] = this.config[key].rules;
            return self;
        },{});
    }

    /**
     * 追加の専用バリデーションを定義
     */
    setRules = () => {

        // 全角ひらがな･カタカナのみ
        Validator.register("kana", function(value, requirement, attribute) {
            return /^([ァ-ヶーぁ-ん]+)$/.test(value);
        }, "全角ひらがな･カタカナを入力してください");

        // 全角ひらがなのみ
        Validator.register("hiragana", function(value, requirement, attribute) {
            return /^([ぁ-ん]+)$/.test(value);
        }, "全角ひらがなを入力してください");

        // 半角カタカナのみ
        Validator.register("katakana", function(value, requirement, attribute) {
            return /^([ｧ-ﾝﾞﾟ]+)$/.test(value);
        }, "半角カタカナを入力してください");

        // 全角カタカナのみ
        Validator.register("katakana", function(value, requirement, attribute) {
            return /^([ァ-ヶー]+)$/.test(value);
        }, "全角カタカナを入力してください");

        // メール用正規表現
        Validator.register("email", function(value, requirement, attribute) {
            // type=emailのマルチバイト対策
            return /^[a-zA-Z0-9]+[a-zA-Z0-9\._-]*@[a-zA-Z0-9]+[a-zA-Z0-9\._-]*\.[a-zA-Z0-9]+$/.test(value);
        }, "メールアドレスの形式で入力してください");

        // 電話番号用正規表現
        Validator.register("tel", function(value, requirement, attribute) {
            return /^\d{10,11}$/.test(value);
        }, "電話番号は10～11文字以内で入力してください");

        // 郵便番号用正規表現
        Validator.register("zip", function(value, requirement, attribute) {
            return  /^\d{7}$/.test(value);
        }, "入力された郵便番号が正しくありません");

        // 画像専用の拡張子チェック
        Validator.register('acceptImg', function(array, requirement, attribute) {
            return array.every(obj => requirement.split("|").includes(obj.type));
        }, "指定された画像形式でアップロードして下さい");
    
        // ファイルサイズのバリデーション(byte/1048576 = mega-byte, param = mega-byte)
        Validator.register('filesize', function(array, requirement, attribute) {
            return array.every(obj => obj.size/1048576 <= requirement);
        }, "ファイルサイズは:filesizeMBまでです");

        if(this.hasOwnProperty("addValidRules")) this.addValidRules(Validator);
    }

    /**
     * data[key]の値を持つmessageを検索してreturnする
     * @param {object} data
     * @return {object}
     */
    getMessages = (data) => {
        return Object.assign(this.getCommonMessages(this.addValidMessages ?? null),
            Object.keys(data).reduce((self, key) => {
                if(!this.config[key] || !this.config[key].hasOwnProperty("messages") ) return self;
                Object.keys(this.config[key].messages).forEach(rule => self[`${rule}.${key}`] = this.config[key].messages[rule]);
                return self;
            },{})
        );
    }

    /**
     * 単純rule共通のmessageをreturnする
     * required, max など共通で利用したいメッセージがあれば設定
     * 引数addに定義したものがあれば上書きする
     * @param {object} add 
     * @return {object}
     */
    getCommonMessages = (add = {}) => {
        return Object.assign({
            in: "指定された選択肢からお選びください",
        },add);
    }

    /**
     * validate 実行し結果をreturnする
     * @param {object} data
     * @return {object} { check: boolean, errors: { name: [string, string], ... }, length: int }
     */
    run = (data) => {
        const validator = new Validator(data, this.getRules(data), this.getMessages(data));
        const bool = validator.check();
        const errors = validator.errors.all();
        const errorNames = Object.keys(errors);
        const checkedErrorNames = this.getCheckedNames().filter(name => errorNames.includes(name));
        const errorInfo = checkedErrorNames.reduce((self, name) => {
            self[name] = errors[name];
            return self;
        },{});
        return { check: bool, errors: errorInfo, length: checkedErrorNames.length };
    }

}
