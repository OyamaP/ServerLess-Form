import { Functions } from "./functions";
import axios from "axios";

export class DataSync {
    constructor(obj) {
        const that = Functions.setProps(this, obj, ["config", "changeStructure"]);
        that.session = this.getSessionData(); // セッション初回読込
        return that;
    }

    /**
     * S3 Image を全て削除後に画像を1ずつPOSTする
     * @param {array} files
     * @return {promise}
     */
    postS3Image = async (files) => {
        const deleteResponse = await this.deleteAllS3Image().then(value => value);
        if(!deleteResponse) {
            console.log("Faled: Remove Exist Images");
            alert("画像アップロード処理で問題が発生しました、再度お試しください");
            return Promise.reject(false);
        }
        const postResponse = await files.reduce((self, obj) => {
            self[obj.endpoint] = this.setS3Image(obj);
            return self;
        },{});
        return await Promise.all(Object.values(postResponse)).then(async values => {
            await Object.keys(postResponse).forEach(async key => {
                await postResponse[key].then(value => {
                    if(!value) {
                        const fileInfo = files.find(obj => obj.endpoint === key);
                        console.log(`Failed Upload Image:${fileInfo.fileName}`);
                        alert(`${fileInfo.fileName}のアップロードに失敗しました。\n利用可能な画像は以下の通りです。再度ご確認ください。\n・ファイル容量:5MB\n・拡張子:png,jpg,jpeg`);
                    }
                });
            });
            const errorCount = values.filter(value => !value).length;
            return errorCount ? Promise.reject(false) : Promise.resolve(true);
        });
    }

    /**
     * フォームセッションを保存しpromiseをreturnする
     * @param {object} data
     * @param {object} location = { nextUrl: "/form-test/finish/", errorUrl:"/form-test/" }
     */
    postSession = async (data, location) => {
        return this.setFormSession(JSON.stringify(data)).then(value => {
            if(value) {
                Functions.transition(location, "nextUrl");
            }
            else {
                // errorUrl が定義されていれば遷移、もしくはエラー通知
                if(location.errorUrl) {
                    Functions.transition(location, "errorUrl");
                }
                else {
                    console.log(`Failed: Put form data into session`);
                    alert('セッションの保存に失敗しました。再度お試しください');
                    return value;
                }
            }
        });

    }

    /**
     * フォーム送信処理 ⇒ レスポンス結果で遷移 or アラート
     * @param {object} data
     * @param {object} location = { nextUrl: "/form-test/finish/", errorUrl:"/form-test/" }
     */
    postForm = async (data, location) => {
        // 送信データの調整(追加除外)
        // exclude = フォーム処理に利用するが送信値には含めないプロパティを削除
        const excludes = Object.keys(this.config).filter(key => this.config[key].exclude).concat("fileInfoObject", "files");
        let sendData = Functions.branchObject(data, excludes);
        // fixed = 固定値 フォームの入力値に左右されない識別子などを追加
        Object.keys(this.config).filter(key => this.config[key].fixed).forEach(key => sendData[key] = this.config[key].value);
        // join = checkbox, select は配列で取得しているためarray ⇒ string に変換
        Object.keys(this.config).filter(key => this.config[key].join).forEach(key =>  sendData[key] = sendData[key].join(this.config[key].join));
        // 追加で変更する場合の特殊関数(初期化時に設定可能)
        sendData = this.changeStructure(sendData, this.config, Functions);
        return this.send_db(sendData).then(value => {
            if(value) {
                sessionStorage.removeItem("temp");
                Functions.transition(location, "nextUrl");
            }
            else {
                // errorUrl が定義されていれば遷移、もしくはエラー通知
                if(location.errorUrl) {
                    Functions.transition(location, "errorUrl");
                }
                else {
                    console.error(`Failed: Submit form data`);
                    alert("フォームの送信に失敗しました");
                    return value;
                }
            }
        });
    }

    /**
     * 送信するJSONの構造を独自に変更する
     * constructor で上書きして利用する
     * @param {object} data
     * @param {object} config
     * @param {object} Functions
     * @return {object} data
     */
    changeStructure = (data, config, Functions) => {
        return data;
    }

    /**
     * Promise型のsessionオブジェクトから指定のデータを取得
     * 
     * @param {string} connect
     * @return {*}
     */
    getSession = async (connect = '') => {
        return await this.session.then(value => {
            if( !connect || (null !== value && typeof value !== "object") ) return value;
            return connect.split(".").reduce((obj, str) => obj[str], value);
        });
    }


    /***************************************************
     * 仮関数群
     ***************************************************/

    /**
     * セッションデータ取得API
     * @return {Object, undefined}
     */
    getSessionData = async () => {
        return await axios
        .get("https://jsonplaceholder.typicode.com/todos/1")
        .then(response => {
            const session = {
                route: {},
                params: {},
                formData: JSON.parse(sessionStorage.getItem("temp")) ?? {},
            };
            session.formData.files = {};
            const fileInfo = session.formData.fileInfoObject ?? {};
            Object.keys(fileInfo).forEach(key => {
                session.formData.files[key] = [];
                fileInfo[key].forEach(obj => {
                    session.formData.files[key].push(sessionStorage.getItem(obj.endpoint));
                });
            });
            return session;
        })
        .catch(error => {
            console.error(error);
            return;
        });
    }

    /**
     * フォームセッションを送信する仮非同期関数
     */
    setFormSession = async (data) => {
        return await axios
        .get("https://jsonplaceholder.typicode.com/todos/1")
        .then(response => {
            sessionStorage.setItem("temp", data);
            return response.status;
        })
        .catch(error => {
            console.error(error);
            return false;
        });
    }

    /**
     * S3画像を送信する仮非同期関数
     */
    setS3Image = async (data) => {
        return await axios
        .get("https://jsonplaceholder.typicode.com/todos/1")
        .then(async response => {
            // エンドポイントにblob を送信
            sessionStorage.setItem(data.endpoint, data.blob);
            return response.status;
        })
        .catch(error => {
            console.error(error);
            return false;
        });

    }

    /**
     * S3画像全削除
     */
    deleteAllS3Image = async () => {
        return await axios
        .get("https://jsonplaceholder.typicode.com/todos/1")
        .then(response => {
            return response.status;
        })
        .catch(error => {
            console.error(error);
            return;
        });
    }

    /**
     * フォーム情報送信API
     */
    send_db = async (data) => {
        return await axios
        .get("https://jsonplaceholder.typicode.com/todos/1")
        .then(response => {
            return response.status;
        })
        .catch(error => {
            console.error(error);
            return false;
        });

    }

}
