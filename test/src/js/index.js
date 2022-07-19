import { Input } from "../../../input";
import json from "./config.json";
import "../scss/index.scss";

const FormTestIndex = new Input({
    formQuery: "#form-test", // 必須：指定するform#id
    formItemWrapQuery: ".item-group", // 必須：各input の.wrap => errorText の表示場所に利用される
    config: json, // 必須：validationなどフォームの項目に関する設定
    location: [ // 必須：フォームの遷移先を指定する
        { 
            query: ".js-submit-btn", nextUrl: "./confirm.html", errorUrl: "./error.html", post: "session",
            valid: { class: "valid-btn", value: "この内容で申し込む" },
            invalid: { class: "invalid-btn", value: "未入力項目があります" },
            promiss: { class: "posting", value: "送信中..." },
        },
    ],
    afterToggleErrors: (validResult, Input, Functions) => { // 任意：エラー表示処理を追加で実行する
        const wrap = document.querySelector(".form-error");
        document.querySelector(".form-error-title").textContent = validResult.length ? "入力エラー" : "";
        document.querySelector(".form-error-text").textContent = validResult.length ? `入力エラーが${validResult.length}個あります` : "";
        wrap.style.height = `${Functions.getInnerHeight(wrap)}px`;
    },
    errorScrollBuffer: () => { // 任意：エラー時のスクロール位置バッファー調整 ⇒ headerの高さを取得して変数をreturnさせることを推奨
        return document.querySelector("header").getBoundingClientRect().height;
    },
    addValidMessages: { // 任意：validate共通のmessageを追加する
        in: "指定された選択肢からお選びください(追加message)"
    },
    addValidRules: (Validator) => { // 任意：validate共通のrule を追加する
        // 電話番号用正規表現
        Validator.register("tel", function(value, requirement, attribute) {
            return /^\d{10,11}$/.test(value);
        }, "電話番号は10～11文字以内で入力してください(追加rule)");
    },

});

console.log(FormTestIndex);
// デバッグ用 自動入力
window.addEventListener("load", () => {
    document.querySelector("#debug_set_value").addEventListener("click",() => {
        FormTestIndex.autoInput("#form-test", {
            "i_last_name":"テスト姓",
            "i_first_name":"テスト名",
            "i_last_kana":"テストセイ",
            "i_first_kana":"テストメイ",
            "i_tel":"09012345678",
            "i_mail":"test@example.com",
            "i_mail_confirm":"test@example.com",
            "i_zip":"9071801",
            "i_pref":["沖縄県"],
            "i_city":"八重山郡与那国町与那国",
            "i_town":"1-2-3",
            "i_building":"マンションAAA",
            "i_plan":"プランA",
            "i_day_of_week":["土曜日", "日曜日"],
            "i_hour":["午前", "12時~13時"],
            "i_message":"TEST MESSAGE",
        });
    });
});

