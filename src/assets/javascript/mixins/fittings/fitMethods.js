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
        this.currentConfiguration = this.initConfig();

        eventBus.$on('revise-initial-values', this.reviseInitialValues);
    },
    methods: {
        initConfig() {
            return this.$store.getters.getFirstConfig(this.ID);
        },
        setFileToFit() {
            if (this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
  	
            // If fileToFit is set to Null, don't transform anything and reset the fit to none
            // console.log("File is being fit:", this.fileToFit);
            if (this.fileToFit === null) {
                
                this.$refs.fit_configurations.setFit('Linear');
                this.setFitSettings(this.$store.getters.getFitSettings);
                this.setFit("Linear");
            } else {
                this.selectedData.forEach( el => {
                    el.dataTransformed = fd.transformData(el.data, this.currentConfiguration.transformations, this.field);
                });

                this.setParameters();
            }
        },
        setFitSettings(options) {
            this.fitSettings = options;
            this.setParameters();
        },
        setEquation(eq) {
            this.currentConfiguration.equation = eq;
            this.setParameters();
        },
        resetFileFitChoice() {
            this.fileFitChoice = [];
            this.fileToFit = null;
            this.$refs.fit_configurations.setFit('Linear');
        },
        setFit(fitname) {
            // Deep clone because if you change the equation later, the original fit config's equation would be altered as well
            this.currentConfiguration = _.cloneDeep(this.$store.getters.getFitConfigsByID(this.$route.name, fitname));

            // console.log("Current configurations changed!");
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
            this.currentConfiguration = _.cloneDeep(this.$store.getters.getFitConfigsByID(this.$route.name, this.currentConfiguration.fit));
            this.setParameters();
        },
        updateInitialValues(v) {
            // Function to accept user inputs of intial values
            this.currentConfiguration.settings.initialValues = _.cloneDeep(v);
            this.setParameters();
        },
        reviseInitialValues(v) {
            // Function to simply update intial values after fitting
            this.currentConfiguration.settings.initialValues = _.cloneDeep(v);
        },
        updateConfigParameters(v) {
            this.currentConfiguration.settings.parameters = _.cloneDeep(v);
            this.setParameters();
        },
    },
};