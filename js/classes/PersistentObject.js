// TODO Handle Key already exists...

class PersistentObject {

    constructor(keyPrefix, key) {
        this.keyPrefix = keyPrefix;
        this.key = key;
    }

    static getAllKeys(keyPrefix) {
        let keys = [];
        for (let key in window.localStorage){
            if (window.localStorage.hasOwnProperty(key) && key.startsWith(keyPrefix)) {
                keys.push(key);
            }
        }

        return keys;
    }

    static getAllJSON(keyPrefix) {
        let jsonObjs = [];
        for (let key in window.localStorage){
            if (window.localStorage.hasOwnProperty(key) && key.startsWith(keyPrefix)) {
                let jsonObj = PersistentObject.load(key);
                if (jsonObj !== null) {
                    jsonObjs.push(jsonObj);
                }
            }
        }

        return jsonObjs;
    }

    static load(key) {
        let jsonStr = window.localStorage.getItem(key);
        return jsonStr === null ? null : JSON.parse(jsonStr);
    }

    // Abstract methods
    toJson() {}

    getKey() {
        return this.key;
    }

    save() {
        window.localStorage.setItem(this.getKey(), JSON.stringify(this.toJson()));
    }
}
