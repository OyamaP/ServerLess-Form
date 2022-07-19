import { Functions } from "./functions";

export class Value {
    constructor() {
    }

    /**
     * フォームitem に値をsetしてnameを配列でreturn
     * @param {string} formQuery use querySelector
     * @param {object} data key value
     * @return {array} names
     */
    setValue = (formQuery, data) => {
        const form = document.querySelector(formQuery);
        const nodeList = form.querySelectorAll('input, select, textarea');
        return Array.from(new Set(
            Array.from(nodeList).reduce((self, ele) => {
                const key = ele.name;
                if(!data[key]) return self;
                switch(ele.type) {
                    case "text":
                    case "textarea":
                    case "email":
                    case "tel":
                        ele.value = data[key];
                        break;
                    case "radio":
                        if(ele.value === data[key]) ele.setAttribute("checked", true);
                        break;
                    case "checkbox":
                        data[key].forEach(value => {
                            if(ele.value === value) ele.setAttribute("checked", true);
                        });
                        break;
                    default:
                        break;
                }
                if(ele.tagName === "SELECT") {
                    ele.querySelectorAll('option').forEach(option => {
                        if(data[key].includes(option.value)) option.setAttribute("selected", true);
                    });
                }
                self.push(ele.name);
                return self;
            },[])
        ));

    }

    /**
     * 指定したフォームから値を全取得する
     * @param {string} formQuery use querySelector
     * @param {object} option
     * @returns {object} res
     */
    getValue = (formQuery, option = {}) => {
        let res = {};
        const form = document.querySelector(formQuery);
        const nodeList = form.querySelectorAll('input, select, textarea');
        nodeList.forEach(ele => {
            switch(ele.type) {
                case "text":
                case "textarea":
                case "email":
                case "tel":
                    res[ele.name] = ele.value.trim();
                    break;
                case "file":
                    res[ele.name] = [];
                    break;
                case "radio":
                    if(ele.checked) res[ele.name] = ele.value;
                    break;
                case "checkbox":
                    if(!res.hasOwnProperty(ele.name)) res[ele.name] = [];
                    if(ele.checked) res[ele.name].push(ele.value);
                    break;
                default:
                    break;
            }
            if(ele.tagName === "SELECT") {
                res[ele.name] = [];
                ele.querySelectorAll('option').forEach(option => {
                    if( option.selected && !option.getAttribute("disabled") ) res[ele.name].push(option.value);
                });
            }
        });
        if(option.mix) res = this.mixValue(res, option.mix);
        return res;
    }

    /**
     * フォームから取得した入力値をmixしてjoinで区切ったwordをnameに代入してdataを返す
     * @param {object} data = { last_name_sei: "SEI", last_name_mei: "MEI", year: 2022, month: 10, day: 20 }
     * @param {object} conf = [ { name: "full_name", mix: ["last_name_sei", "last_name_mei",], join: "　" }, { name: "time", mix: ["year", "month", "day"], join: "/", } ]
     * @return {object} data = { last_name_sei: "SEI", last_name_mei: "MEI", full_name: "SEI　MEI", year: 2022, month: 10, day: 20, time: "2022/10/20" }
     */
    mixValue = (data, conf) => {
        Object.keys(conf).forEach(i => {
            let wordArray = [];
            const mix = conf[i].mix;
            Object.keys(mix).forEach((n) => {
                const v = mix[n];
                if(!data[v]) return;
                if(Array.isArray(data[v])) {
                    wordArray = wordArray.concat(data[v]);
                }
                else {
                    wordArray.push(data[v]);
                }
            });
            if(wordArray.length) {
                const name = conf[i].name;
                data[name] = wordArray.join(conf[i].join);
            }
        });
        return data;
    }

    /**
     * confirm_XXX classを持つ要素のテキスト代入する
     * 配列の場合 (, ) で区切って出力
     * @param {object} data
     * @param {object} config
     */
    setConfirm = (data, config) => {
        Object.keys(data).forEach(key => {
            const ele = document.querySelector(`.js-confirm_${key}`);
            if(!ele) return;
            const joinWord = config[key].join ?? ", ";
            const value = Array.isArray(data[key]) ? data[key].join(joinWord) : data[key];
            if(typeof value !== "string") return;
            ele.textContent = value;
        });

    }

}
