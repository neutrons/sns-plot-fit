<template>
    <button class="btn btn-success navbar-btn" @click="fetchFiles">Fetch Data</button>
</template>

<script>
import axios from 'axios';

// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'FetchButton',
    data() {
        return {

        };
    },
    mounted() {
        // Event listener for when stitch lines are saved
        eventBus.$on('fetch-files', this.fetchFiles);
    },
    computed: {
        fetchURL() {
            return this.$route.name === 'TAS' ? process.env.FETCH_TAS_URL : process.env.FETCH_SANS_URL;
        },
    },
    methods: {
        fetchFiles() {
            console.log(`Fetching ${this.$route.name} data...`);

            let vm = this;

            // If data is not stored, fetch it, store it, and send data to be plotted
            axios.get(this.fetchURL).then(response => {
                let data = response.data;                
                vm.$route.name === 'TAS' ? vm.fetchTAS(data) : vm.fetchSANS(data);
            }).catch(function (err) {
                console.log(err.message);
                eventBus.$emit('error-message', err.message, 'danger');
            })
        },
        fetchTAS(data) {
            let temp = {};

            data.forEach(file => {
                let filename = file.url.replace(/\/external\/files\/tas\//, '').replace(/.dat/g, '');
                
                temp[filename] = {
                    filename: filename,
                    url: file.url,
                    scan: file.scan,
                    scanTitle: file.scan_title,
                    tags: [],
                    loadType: 'fetched',
                };
            });

            if (Object.keys(temp).length > 0) {
                this.$store.commit('addFiles', {
                    loadType: 'fetched',
                    dataType: 'TAS',
                    files: temp,
                })
            }

        },
        fetchSANS(data) {            
            let temp = {
                'SANS1D': {},
                'SANS2D': {},
                'Stitch': {},
            };

            data.forEach(el => {
                var jobTitle = el.job_title;
                var jobModified = el.date_modified;

                el.results.forEach(r => {
                    let key = r.type;
                    
                    if (key === 'SANS1D-Stitch') {

                    temp.Stitch[r.filename] = {
                        id: r.id,
                        filename: r.filename,
                        url: r.url,
                        jobTitle: jobTitle,
                        dateModified: jobModified,
                        tags: [jobTitle],
                        loadType: 'fetched',
                    };

                    temp.SANS1D[r.filename] = {
                        id: r.id,
                        filename: r.filename,
                        url: r.url,
                        jobTitle: jobTitle,
                        dateModified: jobModified,
                        tags: [jobTitle],
                        loadType: 'fetched',
                    };
                    } else {
                    temp[key][r.filename] = {
                        id: r.id,
                        filename: r.filename,
                        url: r.url,
                        jobTitle: jobTitle,
                        dateModified: jobModified,
                        tags: [jobTitle],
                        loadType: 'fetched',
                    };
                    }
                })

            });

            for (let key in temp) {

                if (Object.keys(temp[key]).length > 0) {
                    this.$store.commit('addFiles', 
                    {
                        loadType: 'fetched',
                        dataType: key, 
                        files: temp[key] 
                    });
                }
            }
        }
    },
};
</script>

<style lang='less' scoped>
</style>