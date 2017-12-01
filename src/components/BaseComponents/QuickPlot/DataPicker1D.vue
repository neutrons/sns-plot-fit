<script>
import DataPicker from './DataPicker.vue';
import { parseData } from '../../../assets/javascript/mixins/readFiles/parse/SANS1D.js';
import { emitpick } from './emitpick.js';

export default {
    name: 'DataPicker1D',
    extends: DataPicker,
    mixins: [parseData, emitpick],
    methods: {
        callback(results) {
            this.$emit('picked', results.data);
        },
        
    }
}
</script>