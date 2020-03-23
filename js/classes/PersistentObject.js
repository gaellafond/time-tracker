// TODO Handle Key already exists...

class PersistentObject {

    constructor(key, load=false) {
        this.key = key;
        if (!load) {
            this.key = PersistentObject.getUniqueKey(this.key);
        }
    }

    static getUniqueKey(rawKey) {
        let counter = 0;
        let key = rawKey;
        do {
            counter++;
            key = rawKey + counter;
        } while (key in window.localStorage);

        return key;
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
