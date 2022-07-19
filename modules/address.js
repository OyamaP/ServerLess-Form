const YubinBango = require("yubinbango-core2");

export class Address {
    constructor(obj) {
        this.config = {
            form: obj.formQuery, // formタグ
            postal: ".p-postal-code", // 郵便番号
            region: ".p-region", // 都道府県
            locality: ".p-locality", // 市区町村
            street: ".p-street", // 丁番
        };
        window.addEventListener('load', this.load);
    }

    load = () => {
        this.form = document.querySelector(this.config.form);
        const postal = this.form.querySelector(this.config.postal);
        if(!postal) return;
        ["blur", "change"].forEach(event => { postal.addEventListener(event, this.run) });
    }

    /**
     * Event発火:住所を取得してセットする
     * @param {object} e
     */
    run = (e) => {
        const postal = this.formatNumber(e.target.value);
        this.form.querySelector(this.config.postal).value = postal;
        if(!/^\d{7}$/.test(postal)) return;
        new YubinBango.Core(postal, (addr) => {
            const targets = this.getTargets();
            this.clearValue(targets);
            this.setValue(targets, addr);
        });
    }

    /**
     * 大文字数字を半角に置換する
     * @param {string} number
     * @returns {string}
     */
    formatNumber = (number) => {
        return number.replace(/[０-９]/g, (n) => {
            return String.fromCharCode(n.charCodeAt(0) - 0xFEE0);
        });
    }

    /**
     * 都道府県,市区町村,丁番 で利用する要素をオブジェクト形式で取得
     * @returns {object} = { locality: node, region: node, street: node }
     */
    getTargets = () => {
        return Object.keys(this.config).filter(key => !["form", "postal"].includes(key)).reduce((self, key) => {
            const target = this.form.querySelector(this.config[key]);
            if(!target) return self;
            self[key] = target;
            return self;
        },{});
    }

    /**
     * 各nodeの値をリセットする
     * @param {object} targets = { locality: node, region: node, street: node }
     */
    clearValue = (targets) => {
        Object.values(targets).forEach(node => {
            node.value = "";
        });
    }

    /**
     * 指定された要素に住所をセットする
     * @param {object} targets = { locality: node, region: node, street: node }
     * @param {object} addr = { extended: "", locality: "八重山郡与那国町", region: "沖縄県", region_id: 47, street: "与那国" }
     */
    setValue = (targets, addr) => {
        Object.keys(targets).forEach(key => {
            targets[key].value += addr[key];
        });
    }

}
