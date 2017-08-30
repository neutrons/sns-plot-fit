<template>
  <div class="Plot">

      <div class="plot-panel">

        <div class="plot-bg">
            <div class="panel panel-primary">
                <div :id="titleFormatted+'-main-plot-collapse'" class="panel-heading">{{MAINTITLE}} <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>
            <div :id="titleFormatted+'-plot-panel-group'">

                <div class="panel-group">

                <!-- Insert Plot Components Here  -->
                <slot></slot>

                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../../assets/javascript/eventBus';

import $ from 'jquery';

export default {
    name: 'Plot',
    props: {
        MAINTITLE: {
            type: String,
            required: true
        }
    },
    data: function() {
        return {
            plotParams: {}
        }
    },
    methods: {
        resetPlot: function () {
            this.plotData(this.plotParams);
        },
        setParameters: function(parameters) {
            // Check data is valid prior to plotting
            this.plotParams = _.cloneDeep(parameters);
        }
    },
    watch: {
        plotParams: {
            handler: function() {
                this.$nextTick(function() { this.plotData(this.plotParams);});
            },
            deep: true
        }
    },
    computed: {
        titleFormatted() {
            return this.MAINTITLE.replace(" ", "-");
        }
    },
    mounted() {
        // Code for Collapsible Panel
        var collapse = '#' + this.titleFormatted + '-main-plot-collapse';
        var collapseGroup = '#' + this.titleFormatted + '-plot-panel-group';

        $(collapse).click(function(e) {
            $(collapse).find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
            $(collapseGroup).slideToggle(300);
        });
    }
}
</script>

<style scoped>
.panel-heading {
    text-align: center;
    cursor: pointer;
}

.plot-bg {
    background: whitesmoke;
}
</style>