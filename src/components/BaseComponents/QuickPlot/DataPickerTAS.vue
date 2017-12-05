<script>
import DataPicker from './DataPicker.vue';
import { parseData } from '../../../assets/javascript/mixins/readFiles/parse/TAS.js';
import { emitpick } from './emitpick.js';
import _ from 'lodash';

export default {
    name: 'DataPickerTAS',
    extends: DataPicker,
    mixins: [parseData, emitpick],
    methods: {
        callback(results) {
            let defaults = this.extractDefaults(results.metadata);
            let data = this.swapDefaults(defaults, results.data);
            data = this.addErrors(data);
            
            // emit metadata
            this.$emit('update-metadata', results.metadata);

            // extract default x,y from metadata
            // substitute those for quick plot data
            this.$emit('picked', data);
        },
        extractDefaults(md) {
            let temp = [...md];
            let obj = {x: 'x', y:'y'};

            temp.forEach(el => {
                let item = [];

                if (el.search('def_x') > -1) {
                    item = el.trim().split(' = ');
                    obj.x = item[1];    
                } else if (el.search('def_y') > -1) {
                    item = el.trim().split(' = ');
                    obj.y = item[1];
                }
            })

            return obj;
        },
        swapDefaults(def, data) {
            data = _.cloneDeep(data);
            let temp = [];

            data.forEach(el => {
                let keys = Object.keys(el);
                let obj = {};

                keys.forEach(k => {
                    if (def.x === k) {
                        obj.x = el[k];
                    } else if (def.y === k) {
                        obj.y = el[k];
                    } else {
                        obj[k] = el[k];
                    }
                });

                temp.push(obj);
            });

            return temp;
        },
        addErrors(data) {
            data = _.cloneDeep(data);

            data.forEach(d => {
                let error = Math.sqrt(d.y);
                d.error = Number.isFinite(error) ? error : 0;
            })
            
            return data;
        }
    }
}
</script>