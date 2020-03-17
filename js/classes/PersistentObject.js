class PersistentObject {

    constructor(keyPrefix, key) {
        this.keyPrefix = keyPrefix;
        this.key = key;
    }

    static getAllKeys(keyPrefix) {
        let keys = [];
        for (let key in window.localStorage){
            if (window.localStorage.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    }

    // Abstract methods
    toJson() {}

    getKey() {
        return this.key;
    }
}
