<template>
<div>
    <v-panel PANELTITLE='Metadata' PANELTYPE='default'>
        <div class='wrapper'>
            <ul class='metadata-list'>
                <li v-for='(item, index) in metadata' :key='index'>{{item}}</li>
            </ul>
        </div>
    </v-panel>
</div>
</template>

<script>
import Panel from '../Panels/Panel.vue';

export default {
    name: 'MetadataTable',
    components: {
        'v-panel': Panel,
    },
    props: {
        id: {
            type: String,
            default: 'metadata-id',
        },
        metadata: {
            type: Array,
            required: true,
        },
    },
}
</script>

<style lang='less' scoped>
.wrapper {
    padding-right: 5px;
    max-height: 400px;
    overflow-y: hidden;

    &:hover {
        overflow-y: auto;
    }
};

.metadata-list {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    font-size: 12px;
    padding: 0;
    list-style-type: none;
    word-wrap: break-word;
}
</style>