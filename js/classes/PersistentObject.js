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
        if (keyPrefix === null || keyPrefix === undefined) {
            for (let key in window.localStorage){
                if (window.localStorage.hasOwnProperty(key)) {
                    if (
                        key === 'timeTrackerPauseData' ||
                        key === 'timeTrackerData' ||
                        key.match(/^cat[0-9]+$/) ||
                        key.match(/^project[0-9]+$/) ||
                        key.match(/^log_project[0-9]+_[0-9]+$/)
                    ) {
                        keys.push(key);
                    }
                }
            }
        } else {
            let allKeys = PersistentObject.getAllKeys();
            for (let i=0; i<allKeys.length; i++){
                let key = allKeys[i];
                if (key.startsWith(keyPrefix)) {
                    keys.push(key);
                }
            }
        }

        return keys;
    }

    static getAllJSON(keyPrefix) {
        let jsonObjs = [];
        let allKeys = PersistentObject.getAllKeys();
        for (let i=0; i<allKeys.length; i++){
            let key = allKeys[i];
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

        return jsonObjs;
    }

    static getDBBackup() {
        let jsonObjs = {};
        let allKeys = PersistentObject.getAllKeys();
        for (let i=0; i<allKeys.length; i++){
            let key = allKeys[i];
            let jsonObj = PersistentObject.load(key);
            if (jsonObj !== null) {
                jsonObjs[key] = jsonObj;
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
        let json = null;
        if (jsonStr !== null) {
            try {
                json = JSON.parse(jsonStr);
            } catch(err) {
                console.error("Invalid JSON found in the Database.\nKey: " + key + "\nJSON: " + jsonStr + "\nError: " + err);
            }
        }
        return json;
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
