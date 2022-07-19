import { Functions } from "./functions";

export class Display {
    constructor(obj) {
        const that = Functions.setProps(this, obj, ["config", "location", "formQuery", "formItemWrapQuery", "afterToggleErrors", "errorScrollBuffer"]);
        return that;
    }

    /**
     * validationエラー表示切替
     * @param {object} validResult = { check: boolean, errors: { name1: [errorMessage1], name2: [errorMessage1, errorMessage2] }, length: int }
     * @param {array} checkedNames
     */
    toggleErrors = (validResult, checkedNames) => {
        const form = document.querySelector(this.formQuery);
        checkedNames.forEach(name => {
            const area = form.querySelector(`.js-validate-error-area.${name}-error`);
            const text = form.querySelector(`.js-validate-error-text.${name}-error`);
            if(!area || !text) return;
            const isError = Object.keys(validResult.errors).includes(name);
            if(isError) {
                // 個別のエラー文を表示
                text.innerHTML = validResult.errors[name].join("<br>");
                // 高さを設定
                area.style.height = `${Functions.getRealHeight(text)}px`;
            }
            else {
                // 個別のエラー文を非表示
                text.textContent = "";
                area.style.height = "0px";
            }
        });
        // 送信ボタン切替
        this.toggleSubmitBtn(validResult.check);

        // 任意関数実行
        this.afterToggleErrors(validResult, this, Functions);
    }

    /**
     * フォーム全体のvalidation結果で送信ボタンの活性切替
     * @param {boolean} bool
     */
    toggleSubmitBtn = (bool) => {
        const form = document.querySelector(this.formQuery);
        const location = this.location.filter(obj => obj.post);
        location.forEach(obj => {
            const btn = form.querySelector(obj.query);
            if(bool) {
                btn.textContent = obj.valid.value;
                btn.classList.add(obj.valid.class);
                btn.classList.remove(obj.invalid.class);
            }
            else {
                btn.textContent = obj.invalid.value;
                btn.classList.add(obj.invalid.class);
                btn.classList.remove(obj.valid.class);
            }
        });
    };

    /**
     * 送信ボタン非同期処理中の2重発火対策
     * ボタンが特定のクラスを持っているかで判定
     * @param {object} location
     * @returns {boolean}
     */
    isSending = (location) => {
        const form =  document.querySelector(this.formQuery);
        const btn = form.querySelector(location.query);
        return btn.classList.contains(location.promiss.class);
    }

    /**
     * valid状態と送信状態のボタン切替
     * 送信処理前後で使用する
     * @param {object} location 
     */
    toggleSending = (location) => {
        const form =  document.querySelector(this.formQuery);
        const btn = form.querySelector(location.query);
        const bool = btn.classList.contains(location.promiss.class);
        if(bool) {
            btn.textContent = location.valid.value;
            btn.classList.remove(location.promiss.class);
        }
        else {
            btn.textContent = location.promiss.value;
            btn.classList.add(location.promiss.class);
        }
    }

    /**
     * エラー処理終了後の任意関数
     * 初期化時に設定可能
     * @param {object} validResult  = { check: boolean, errors: { name1: [errorMessage1], name2: [errorMessage1, errorMessage2] }, length: int }
     * @param {Input} Input
     */
    afterToggleErrors = (validResult, Input) => {
    }

    /**
     * フォーム内の要素で一番最初のエラーがある箇所にスクロールする
     * buffer = function | int = 100
     */
    errorScroll = () => {
        const form = document.querySelector(this.formQuery);
        const ele = Array.from(form.querySelectorAll(".js-validate-error-area")).find(ele => ele.style.height !== "0px").closest(this.formItemWrapQuery);
        const buffer = (typeof(this.errorScrollBuffer) === "function" ? this.errorScrollBuffer() : this.errorScrollBuffer) ?? 100;
        const position = ele.getBoundingClientRect().top + window.pageYOffset - buffer;
        window.scrollTo({
            top: position,
            behavior: "smooth",
        });
    }

    /**
     * フォーム内の各項目にエラーエリアを追加する
     * @param {array} names
     */
    insertErrorArea = (names) => {
        const form = document.querySelector(this.formQuery);
        names.forEach(key => {
            const target = form.querySelector(`[name=${key}]`);
            if(!target) return;
            const errorHtml = `
                <div class="js-validate-error-area ${key}-error" style="transition: all 0.5s ease 0s; overflow: hidden; line-height: 1; height: 0px;">
                    <span class="js-validate-error-text ${key}-error"></span>
                </div>
            `;
            target.closest(this.formItemWrapQuery).insertAdjacentHTML('beforeend', errorHtml);
        });
    }

    /**
     * ページ読み込みアニメーションをストップ
     */
    endLoadingAnimation = () => {
        document.querySelector(".animation.before-on-load").classList.add("loaded");
    }

}
