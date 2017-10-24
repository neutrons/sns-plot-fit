import _ from 'lodash';

export const uploaded1DFiles = {
    computed: {
        uploaded1DFiles() {
            return _.cloneDeep(this.$store.getters.getUploaded1D);
        }
    }
}