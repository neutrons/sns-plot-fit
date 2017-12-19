import fd from './fitData.js';
import { eventBus } from '../../eventBus.js';

export const fitMethods = {
    data() {
        return {
            currentConfiguration: {},
            fileFitChoice: [],
            fileToFit: null,
            test: undefined,
        }
    },
    created() {
        // Initialize the current configuration upon mounting to Linear settings
        this.initConfig();

        eventBus.$on('revise-initial-values', this.reviseInitialValues);
    },
    methods: {
        initConfig() {
            this.currentConfiguration = this.$store.getters.getFirstConfig(this.ID);
            this.currentConfiguration.settings = this.$store.getters.getFitSettings;
        },
        setFileToFit() {
            if (this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
  	
            // If fileToFit is set to Null, don't transform anything and reset the fit to none
            // console.log("File is being fit:", this.fileToFit);
            if (this.fileToFit === null) {
                this.initConfig();
            } else {
                this.selectedData.forEach( el => {
                    el.dataTransformed = fd.transformData(el.data, this.currentConfiguration.transformations, this.field);
                });
            }
        },
        setFitSettings(options) {
            this.fitSettings = options;
            this.setParameters();
        },
        resetFileFitChoice() {
            this.fileFitChoice = [];
            this.fileToFit = null;
        },
        fitTransform(value) {
            this.currentConfiguration.fit = value.fit;
            this.currentConfiguration.xLabel = value.xLabel;
            this.currentConfiguration.yLabel = value.yLabel;
            this.currentConfiguration.note = value.note;
            this.currentConfiguration.transformations = value.transformations;

            if (this.currentConfiguration.transformations.x !== 'x' || this.currentConfiguration.transformations.y !== 'y') {
                this.selectedData.forEach( el => {
                    el.dataTransformed = fd.transformData(el.data, this.currentConfiguration.transformations, this.field);
                });
            } else {
                this.selectedData.forEach( el => {
                    el.dataTransformed = _.cloneDeep(el.data);
                });
            }

            this.setParameters();
        },
        resetFitSettings() {
            this.currentConfiguration.settings = _.cloneDeep(this.$store.getters.getFitSettings);

            this.setParameters();
        },
        reviseInitialValues(v) {
            // Function to simply update intial values after fitting
            // console.log('Changing init values', v);
            this.currentConfiguration.initialValues = _.cloneDeep(v);
        },
        updateConfigSettings(v) {
            this.currentConfiguration.settings = _.cloneDeep(v);

            this.setParameters();
        },
    },
};