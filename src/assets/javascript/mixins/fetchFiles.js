/* Function to get fetch file names to sort */
import _ from 'lodash'

export const fetchFiles = {
    methods: {
        fetchFiles(type, sortBy = 'ascending', filterBy = 'All') {

            if(type === '1D')
                var temp = _.cloneDeep(this.$store.getters.getFetched1D);
            else
                var temp = _.cloneDeep(this.$store.getters.getFetched2D);

            if(sortBy === 'ascending') {
                if(filterBy === 'All') {
                    return temp.sort(function(a,b) { return new Date(a.dateModified) - new Date(b.dateModified); });
                } else {
                    return temp.filter(el => el.jobTitle === filterBy)
                        .sort(function(a,b) { return new Date(a.dateModified) - new Date(b.dateModified); });
                }
            } else {
                if(filterBy === 'All') {
                    return temp.sort(function(a,b) { return new Date(b.dateModified) - new Date(a.dateModified); });
                } else {
                    return temp.filter(el => el.jobTitle === filterBy)
                        .sort(function(a,b) { return new Date(b.dateModified) - new Date(a.dateModified); });
                }
            }

        }
    }
}