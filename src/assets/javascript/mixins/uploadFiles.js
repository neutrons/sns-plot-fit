/* Function to get fetch file names to sort */
import _ from 'lodash'

export const uploadFiles = {
    data() {
        return {
            filters: [],
        }
    },
    methods: {
        updateFilters(tags) {
            this.filters = _.cloneDeep(tags);
        },
    },
    computed: {
        getUploaded() {
            return this.$store.getters.getUploaded(this.ID);
        },
        filteredUpload() {
            let vm = this;
            
            if (this.filters.length === 0) {
              return this.getUploaded;
            };
            
            let temp = {};
            let filenames = Object.keys(this.getUploaded);
            
            this.filters.forEach(tag => {
              filenames.forEach(name => {
                if (this.getUploaded[name].tags.indexOf(tag) > -1) {
                  temp[name] = this.getUploaded[name];
                }
              })
            })
            
            return temp;
        },
    }
}