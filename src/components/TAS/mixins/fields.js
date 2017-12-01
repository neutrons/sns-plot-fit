import * as d3 from 'd3';

export const initFields = {
    methods: {
        initFields() {
            let vm = this;

            this.fields.x = this.plotParameters.fields.x;
            this.fields.y = this.plotParameters.fields.y;

            // Assign fields if none were provided yet
            if (this.fields.x === null || this.fields.y === null) {
                [this.fields.x, this.fields.y] = this.getFields();
            }

            // console.log("FIELDS:", this.fields);
        }
    }
}

export const getFields = {
    methods: {
        getFields() {
            
            let keys = Object.keys(this.plotData[0]);
            keys.sort();
            // console.log("KEYS", keys);
            let tx = keys[0];
            let ty = keys[0];

            return [tx, ty];
        }
    }
}
