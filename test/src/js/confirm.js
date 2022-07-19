import { Input } from "../../../input";
import { Confirm } from "../../../confirm";
import json from "./config.json";
import "../scss/confirm.scss";

const FormTestConfirm = new Confirm({
    config: json,
    location: [
        { query: ".js-back-btn", nextUrl: "./index.html", replace: true },
    ],
});

console.log(FormTestConfirm);

const FormTestIndex = new Input({
    formQuery: "#form-test", // 必須：指定するform#id
    formItemWrapQuery: ".item-group", // 必須：各input の.wrap => errorText の表示場所に利用される
    config: json, // 必須：validationなどフォームの項目に関する設定
    location: [ // 必須：フォームの遷移先を指定する
        { 
            query: ".js-submit-btn", nextUrl: "./finish.html", errorUrl: "./error.html", post: "form",
            valid: { class: "valid-btn", value: "この内容で申し込む" },
            invalid: { class: "invalid-btn", value: "未入力項目があります" },
            promiss: { class: "posting", value: "送信中..." },
        },
    ],
    changeStructure: (data, config, Functions) => { // 任意：フォーム送信前に任意の構造に変更する場合に使用
        data.i_date = Functions.getStrDate("YYYY/MM/DD hh:mm:ss");
        return data;
    },

});

console.log(FormTestIndex);
