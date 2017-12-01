export const isPlotted = {
  methods: {
    isPlotted(filename) {
      //Dynamically style the file lists for plotted data
      if (this.filesToPlot.indexOf(filename) > -1) {
        return "success";
      } else {
        return "default";
      }
    }
  }
}
