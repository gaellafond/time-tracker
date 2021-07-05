class Category extends PersistentObject {
    constructor(timeTracker, name, order, key=null) {
        if (key === null) {
            super(Category.keyPrefix, false);
        } else {
            super(key, true);
        }

        this.timeTracker = timeTracker;
        this.name = name;
        this.order = order;

        // Create the JQuery element
        this.markup = $(`
            <fieldset class="category"><legend class="category-header">${this.getName()}</legend></fieldset>
        `);
    }

    static get keyPrefix() {
        return "cat";
    }

    static load(timeTracker, jsonCategory) {
        return new Category(
            timeTracker,
            jsonCategory.name,
            jsonCategory.order,
            jsonCategory.key
        );
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    getOrder() {
        return this.order;
    }
    setOrder(order) {
        this.order = order;
    }

    getMarkup() {
        return this.markup;
    }

    toJson() {
        return {
            "key": this.getKey(),
            "name": this.name,
            "order": this.order
        }
    }

}
