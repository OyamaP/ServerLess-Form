import { Functions } from "./functions";
import { Validate } from "./validate";

export class Files {
    constructor(obj) {
        const that = Functions.setProps(this, obj, ["loadStartFiles", "loadEndFiles"]);
        that.validate = new Validate(obj);
        that.control = [];
        return that;
    }

    /**
     * 指定したフォーム内のtype=file に紐づく情報をblobを除いて取得する
     * @param {string} formQuery use querySelector
     * @returns {object} fileInfoObject
     */
    getFileInfo = (formQuery) => {
        return Array.from(document.querySelector(formQuery).querySelectorAll("[type='file']")).reduce((self, ele) => {
            // 参照型のfiles からblob プロパティのみを削除
            self[ele.name] = this.control.filter(obj => obj.itemName === ele.name).map(obj => Functions.branchObject(obj, ["blob"]));
            return self;
        },{});
    }

    /**
     * confirm_XXX classを持つ要素にファイルを代入する
     * @param {object} data
     */
    setFiles = (data) => {
        const fileInfo = data.fileInfoObject;
        if(!fileInfo) return;
        Object.keys(fileInfo).forEach(key => {
            const ele = document.querySelector(`.js-confirm_${key}`);
            if(!ele) return;
            Object.keys(fileInfo).forEach(name => {
                for(let i = 0; i < fileInfo[name].length; i++) {
                    const preview = this.filePreviewArea
                        .replace(/\$name/g, fileInfo[name][i].fileName)
                        .replace(/src=''/, `src=${data.files[name][i]}`)
                        .replace(/\$animation-class/, "loaded");
                    ele.innerHTML += preview;
                }
            });
        });
    }

    /**
     * input type=file 変更時に動作
     * FileReaderは非同期のため、全ての画像を読込完了した際の処理を含める
     * loadStartFiles, loadEndFiles は任意で設定できる関数
     * @param {object} e
     */
    changeFiles = (e) => {
        const name = e.target.name;
        this.validate.control[name] = true;
        const prevArea = document.querySelector(`.${name}-prevArea`);
        if(!prevArea) return this.control;
        // init
        this.control = this.control.filter(obj => obj.itemName !== name);
        prevArea.innerHTML = "";
        // run
        const files = Array.from(e.target.files);
        // file(size,type)validation実行
        const fileData = [];
        const boolean = files.every(file => {
            // ファイル管理オブジェクトを生成
            const obj = { itemName: name, fileName: file.name, type: file.name.split(".").pop(), size: file.size };
            fileData.push(obj);
            const validData = {};
            validData[name] = [obj];
            const validResult = this.validate.run(validData);
            // 各ファイルのエラー処理を実行する
            if(Object.keys(validResult.errors).length) {
                console.log(`Failed Upload Image:${obj.fileName}`);
                console.log(`ErrorMessage:${validResult.errors[name].join("\n")}`);
                alert(`${obj.fileName}のアップロードに失敗しました。\n利用可能な画像は以下の通りです。再度ご確認ください。\n・ファイル容量:5MB\n・拡張子:png,jpg,jpeg`);
            }
            return validResult.check;
        });
        if(!boolean) return this.control;

        // validation後にFileReader 非同期処理を実施
        // 任意のファイル読込開始時関数を実行
        this.loadStartFiles(files, name);
        // getパラメーターを取得
        const interval = Functions.getParam("debug_changeFiles") ?? 1000;
        // ファイル名の1から連番にするためfor文で実施
        for(let i = 0; i < files.length; i++) {
            const file = files[i];
            const obj = fileData[i];
            obj.uploadName = `${name}_${i+1}.${obj.type}`;
            obj.endpoint = `https:/example.com/upload/${obj.uploadName}`;
            this.control.push(obj);
            // プレビュー表示
            prevArea.innerHTML += this.filePreviewArea.replace(/\$name/g, file.name).replace(/\$id/g, `${name}_${i+1}`);
            const reader = new FileReader();
            reader.addEventListener("load", e => {
                // blob 処理
                document.querySelector(`.file-preview-area.${name}_${i+1}-preview-area img`).setAttribute("src", e.target.result);
                // loading 非表示
                document.querySelector(`.file-preview-area.${name}_${i+1}-preview-area .animation.loading-file`).classList.add("loaded");
                obj.blob = e.target.result;
                // 全ファイル読込完了処理
                const useFiles = this.control.filter(obj => (obj.itemName === name) && obj.blob );
                if( files.length === useFiles.length ) this.loadEndFiles(useFiles, name);
            });
            // 複数枚の非同期処理実行時の挙動確認用 → debug_changeFiles パラメーターにms単位で指定 ex)2000
            setTimeout(() => {
                reader.readAsDataURL(file);
            },interval);
        };
        return  this.control;

    }

    /**
     * ファイル読込前の任意関数
     * constructor でオプションとして上書き可能
     * @param {array} files changeイベントのe.target.files
     * @param {string} name input.name
     */
    loadStartFiles = (files, name) => {
        console.log("Start: Loading files");
    };
    /**
     * 全ファイル読込後の任意関数
     * constructor でオプションとして上書き可能
     * @param {array} useFiles = [ {fileName: 'testimage01.png', type: 'png', ...}, {fileName: 'testimage02.png', type: 'png', ...} ]
     * @param {string} name input.name
     */
    loadEndFiles = (useFiles, name) => {
        console.log("End: Loading files");
    };

    /**
     * ファイルを表示するHTML要素を定義
     */
    filePreviewArea = `
        <figure class="file-preview-area $id-preview-area">
            <figcaption>$name</figcaption>
            <div class="img-wrap">
                <img src=''>
                <div class="animation loading-file $animation-class">
                    <div class="sk-circle">
                        <div class="sk-circle1 sk-child"></div>
                        <div class="sk-circle2 sk-child"></div>
                        <div class="sk-circle3 sk-child"></div>
                        <div class="sk-circle4 sk-child"></div>
                        <div class="sk-circle5 sk-child"></div>
                        <div class="sk-circle6 sk-child"></div>
                        <div class="sk-circle7 sk-child"></div>
                        <div class="sk-circle8 sk-child"></div>
                        <div class="sk-circle9 sk-child"></div>
                        <div class="sk-circle10 sk-child"></div>
                        <div class="sk-circle11 sk-child"></div>
                        <div class="sk-circle12 sk-child"></div>
                    </div>
                </div>
            </div>
        </figure>
    `;

}
