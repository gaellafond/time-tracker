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
            if (window.localStorage.hasOwnProperty(key)) {
                let selected = true;
                if (keyPrefix) {
                    selected = key.startsWith(keyPrefix);
                }
                if (selected) {
                    let jsonObj = PersistentObject.load(key);
                    if (jsonObj !== null) {
                        jsonObjs.push(jsonObj);
                    }
                }
            }
        }

        return jsonObjs;
    }

    static getDBBackup() {
        let jsonObjs = {};
        for (let key in window.localStorage){
            if (window.localStorage.hasOwnProperty(key)) {
                let jsonObj = PersistentObject.load(key);
                if (jsonObj !== null) {
                    jsonObjs[key] = jsonObj;
                }
            }
        }

        return jsonObjs;
    }

    static reset() {
        PersistentObject._reset();
        Utils.notifyLocalStorageChange();
    }

    static _reset() {
        window.localStorage.clear();
    }

    static restoreDBBackup(jsonDB) {
        PersistentObject._reset();
        for (let key in jsonDB) {
            if (jsonDB.hasOwnProperty(key)) {
                let jsonObj = jsonDB[key];
                window.localStorage.setItem(key, JSON.stringify(jsonObj));
            }
        }
        Utils.notifyLocalStorageChange();
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
        Utils.notifyLocalStorageChange();
    }

    delete() {
        window.localStorage.removeItem(this.getKey());
        Utils.notifyLocalStorageChange();
    }
}
