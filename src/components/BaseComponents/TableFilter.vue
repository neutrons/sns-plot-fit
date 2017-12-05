<template>
<div>
    <div class='input-group'>
      <span class='input-group-addon'>Filter By:</span>
        <multiselect
            selectLabel=''
            selectedLabel=''
            :limit='1'
            :limitText='count => { return "+" + count + " more"; }'
            v-model='value'
            :options='tags'
            :multiple='true'
            :close-on-select='false'
            @input='onInput'
        ></multiselect>
    </div>
</div>
</template>

<script>
import Multiselect from 'vue-multiselect';

export default {
    name: 'TableFilter',
    components: {
        Multiselect,
    },
    props: {
        id: String,
    },
    data() {
        return {
            value: [],
        };
    },
    methods: {
        onInput(tag) {
            this.$emit('update-filter', this.value);
        }
    },
    computed: {
        getUploaded() {
            return this.$store.getters.getUploaded(this.id);
        },
        getFetched() {
            return this.$store.getters.getFetched(this.id);
        },
        mergedList() {
            return Object.assign({}, this.getUploaded, this.getFetched);
        },
        filenames() {
            return Object.keys(this.mergedList);
        },
        tags() {
            let temp = [];

            this.filenames.forEach(name => {
                this.mergedList[name].tags.forEach(tag => {
                    if (temp.indexOf(tag) === -1) {
                        temp.push(tag);
                    }
                })
            });

            return temp;
        },
    },
}
</script>

<style lang='less' scoped>
@import '../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';

.multiselect {
    padding-left: 0px;
}
</style>