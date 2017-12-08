<template>
  <v-panel :PANELTITLE='`Metadata - ${name}`' PANELTYPE='default'>
        <div class='button-group pull-left' slot='header-content'>
            <button class='btn btn-default btn-xs btn-left' @click='next("left")'><i class='fa fa-caret-left' aria-hidden='true'></i></button>
            <button class='btn btn-default btn-xs btn-deselect' @click='highlightAll'>Deselect</button>
            <button class='btn btn-default btn-xs btn-right' @click='next("right")'><i class='fa fa-caret-right' aria-hidden='true'></i></button>
        </div>

        <div class='metadata'>
            <ul class='metadata-list'>
                <li v-for='c in choice'>{{c}}</li>
            </ul>
        </div>
  </v-panel>
</template>

<script>
import * as d3 from 'd3';

import Panel from '../../BaseComponents/Panels/Panel.vue';

/* Import Event Bus */
import { eventBus } from '../../../assets/javascript/eventBus';

export default {
    name: 'metadata',
    components: {
        'v-panel': Panel,
    },
    props: {
        metadata: {
            required: true
        },
        ID: {
            type: String
        },
        fileToFit: [String, null],
    },
    data() {
        return {
            name: '',
            choice: [],
            index: 0
        }
    },
    computed: {
        keys() {
            return Object.keys(this.metadata);
        },
        keyLength() {
            return this.keys.length - 1;
        }
    },
    methods: {
        next(dir) {

            if  (this.keyLength === 0)  return;

            if (dir === 'left') {
                this.index = this.index === 0 ? this.keyLength : this.index - 1;
            } else {
                this.index = this.index === this.keyLength ? 0 : this.index + 1;
            }
        
            this.name = this.keys[this.index];
            this.choice = this.metadata[this.keys[this.index]];

            this.highlight(this.name);

        },
        highlight(name) {
            let vm = this;
            let tempKeys = this.keys;

            for (let i = 0, L = tempKeys.length; i < L; i++) {
                let key = tempKeys[i];

                // Lower opacity for scatters & lines not selected
                // console.log('KEY: ' + key + ' | NAME: ' + name + ' | ' + this.fileToFit);
                if (key !== name) {
                    d3.select(`#scatter-${this.ID}-${key}`).selectAll('circle').style('opacity', 0.10);
                    d3.select(`#line-${this.ID}-${key}`).select('path').style('opacity', 0.10);
                    d3.select(`#error-cap-bottom-${this.ID}-${key}`).selectAll('line').style('opacity', 0.10);
                    d3.select(`#error-cap-top-${this.ID}-${key}`).selectAll('line').style('opacity', 0.10);
                    d3.select(`#error-${this.ID}-${key}`).selectAll('line').style('opacity', 0.10);

                    if (name !== this.fileToFit && this.fileToFit !== null) {
                        d3.select(`#fit-line-${this.ID}`).select('.fitted-line').style('opacity', 0.10);
                    }
                } else {
                    d3.select(`#scatter-${this.ID}-${key}`).selectAll('circle').style('opacity', 1);
                    d3.select(`#line-${this.ID}-${key}`).select('path').style('opacity', 1);
                    d3.select(`#error-cap-bottom-${this.ID}-${key}`).selectAll('line').style('opacity', 1);
                    d3.select(`#error-cap-top-${this.ID}-${key}`).selectAll('line').style('opacity', 1);
                    d3.select(`#error-${this.ID}-${key}`).selectAll('line').style('opacity', 1);

                    if (name === this.fileToFit && this.fileToFit !== null) {
                        d3.select(`#fit-line-${this.ID}`).select('.fitted-line').style('opacity', 1);
                    }
                }
            }
        },
        highlightAll() {
            if  (this.keyLength === 0)  return;

            let vm = this;
            let tempKeys = this.keys;

            for (let i = 0, L = tempKeys.length; i < L; i++) {
                let key = tempKeys[i];
                d3.select(`#scatter-${this.ID}-${key}`).selectAll('circle').style('opacity', 1);
                d3.select(`#line-${this.ID}-${key}`).select('path').style('opacity', 1);
            }

            if (this.fileToFit !== null) {
                d3.select(`#fit-line-${this.ID}`).select('.fitted-line').style('opacity', 1);
            }
        }
    },
    watch: {
        metadata: {
            handler() {
                // console.log('Metadata updated...', this.metadata);
                let tname = this.name;

                this.name = this.keys.indexOf(tname) === -1 ? this.keys[0] : this.name;
                this.choice = this.keys.indexOf(tname) === -1 ? this.metadata[this.keys[0]] : this.choice;

                this.$nextTick(function() { this.highlight(this.name) });
            },
            deep: true
        }
    }
}
</script>

<style lang='less' scoped>
.metadata {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    position: relative;
    padding: 10px;
    margin: 0 auto;

    .metadata-list {
        -webkit-column-count: 3; /* Chrome, Safari, Opera */
        -moz-column-count: 3; /* Firefox */
        column-count: 3;

        word-wrap: break-word;
    }
}
  
.btn-left, .btn-deselect, .btn-right {
    position: relative;
    top: 0px;
}

.btn {

    @media screen and (min-width: 1441px) { font-size: 12px; }
    
    @media screen and (max-width: 1440px) and (min-width: 1200px) { font-size: 10px; }

    @media screen and (max-width: 1199px) { font-size: 9px; }

    &:active, &:target, &:focus {
        outline: none;
    }
}
</style>
