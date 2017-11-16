import fd from './fitData.js';

export const fitMethods = {
    data() {
        return {
            currentConfiguration: {
                fit: 'Linear',
                equation: 'm*x+b',
                transformations: {
                    x: 'x',
                    y: 'y',
                    e: 'e',
                },
                yLabel: "I",
                xLabel: "Q",
                note: "",
            },
            fitSettings: {
                damping: 0.001,
                initialValues: [],
                gradientDifference: 0.1,
                maxIterations: 100,
                errorTolerance: 0.001
            },
            fileFitChoice: [],
            fileToFit: null,
        }
    },
    methods: {
        setFileToFit() {
            if (this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
  	
            // If fileToFit is set to Null, don't transform anything and reset the fit to none
            // console.log("File is being fit:", this.fileToFit);
            if (this.fileToFit === null) {
                
                this.$refs.fit_configurations.setFitBack();
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
            this.setParameters();
        },
        setFit(fitname) {
            // console.log("Setting new fit configuration:", fitname);
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
    },
};