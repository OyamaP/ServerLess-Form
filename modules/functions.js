/**
 * 共通のstatic functionを 定義
 * オブジェクトや配列の複雑な操作など
 */
export class Functions {

    /**
     * クラス初期化時にセットしたobjの中から特定のpropのみをthisにセットしてreturnする
     * const that = Functions.setProps(this, obj, [...]);
     * return that;
     * @param {object} that
     * @param {object} obj
     * @param {array} keys
     * @returns {object}
     */
    static setProps = (that, obj, keys) => {
        keys.forEach(key => {
            if(!obj.hasOwnProperty(key)) return;
            that[key] = obj[key];
        });
        return that;
    }

    /**
     * オブジェクトを非参照型で複製
     * removeに含まれるプロパティ以外で生成したobjectをreturnする
     * delete 参照先を考慮した代替関数
     * @param {object} obj = { name: "Jhon", age: 20, tel: "09012345678", email: "example@example.com" }
     * @param {array} remove = [ "age", "email" ]
     * @return {object} { name: "Jhon", tel: "09012345678" }
     */
    static branchObject = (obj, remove = []) => {
        return Object.keys(obj).reduce((self, key) => {
            if(!remove.includes(key)) self[key] = obj[key];
            return self;
        },{});
    };

    /**
     * 任意パラメーターのvalue値を取得
     * @param {string} name パラメータのkey文字列
     * @return {string} 指定パラメーターのvalue文字列 
     */
    static getParam = (name) => {
        const url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    /**
     * 指定要素の子要素全ての高さの合計値を取得
     * @param {node} ele
     * @return {int} height
     */
    static getInnerHeight = (ele) => {
        return Array.from(ele.children).reduce((number, child) => number += this.getRealHeight(child), 0, this);
    }
    static getRealHeight = (ele) => {
        const {marginTop, marginBottom} = window.getComputedStyle(ele);
        return parseFloat(ele.getBoundingClientRect().height.toFixed(3)) + // 文字列を小数点に置換
            parseInt(marginTop.replace("px", "")) + // 文字列を数値に置換
            parseInt(marginBottom.replace("px", ""));  // 文字列を数値に置換
    }

    /**
     * 遷移機能
     * replaceオプション => confirmからfinish へ遷移する場合などにback機能を制限する
     * @param {object} location = { nextUrl: "/form-test/finish/", errorUrl:"/form-test/", replace: true }
     * @param {string} destination = ("nextUrl" || "errorUrl")
     */
    static transition = (location, destination) => {
        const url = location[destination];
        if(!url) return;
        if(location.replace) {
            window.location.replace(url);
        }
        else{
            window.location.href = url;
        }
    }

    /**
     * 表示しているフォーム内の項目nameを重複なし配列で取得
     * @param {string} formQuery
     * @return {array}
     */
    static getNames = (formQuery) => {
        const nodeList = document.querySelector(formQuery).querySelectorAll('input, select, textarea');
        return Array.from(new Set(Array.from(nodeList).map(node => node.name)));
    }
    /**
     * data内からname値以外のプロパティを削除する
     * @param {object} data
     * @param {string} formQuery
     */
    static getObjectIncludeNames = (data, formQuery) => {
        return Object.keys(data).reduce((self, key) => {
            if(this.getNames(formQuery).includes(key)) self[key] = data[key];
            return self;
        },{});
    }

    /**
     * 現在時刻をブラウザ基準で取得する
     * @param {string} format
     * @returns {string} "2022/04/01 09:00:00"
     */
    static getStrDate = (format = "YYYY/MM/DD hh:mm:ss") => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1);
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const secounds = date.getSeconds();
        const config = {
            "YYYY": year, "Y": year,
            "MM": ("0" + (month)).slice(-2), "M": month,
            "DD": ("0" + (day)).slice(-2), "D": day,
            "hh": ("0" + hours).slice(-2), "h": hours,
            "mm": ("0" + minutes).slice(-2), "m": minutes,
            "ss": ("0" + secounds).slice(-2), "s": secounds,
        };
        const replaceStr = "(" + Object.keys(config).join("|") + ")";
        const regex = new RegExp(replaceStr, "g");
        return format.replace(regex, (str) => config[str]);
    }

}
