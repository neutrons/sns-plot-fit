<template>
<div>

    <div class="panel-group-bg">
        <div class="panel-group">

            <!-- Collapsible panel -->
            <div :class="'panel panel-' + PANELTYPE">
                <div class="panel-heading">
                    <div class="panel-title">
                        <span class="collapser" @click="isCollapsed = !isCollapsed">{{MAINTITLE}} 
                            <span class="pull-right" v-if="isCollapsed"><i class="fa fa-plus-square" aria-hidden="true"></i></span>
                            <span class="pull-right" v-else><i class="fa fa-minus-square" aria-hidden="true"></i></span>
                        </span>
                    </div>
                </div>
                <!-- End Collasible panel -->

                <div class="panel-collapse collapse in">
                    <div class="group-body">

                        <!-- Insert Panel Components Here  -->
                        <slot></slot>

                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<script>
import $ from 'jquery'

export default {
  props: {
      MAINTITLE: {
          type: String,
          default: 'Main Title'
      },
      PANELTYPE: {
          type: String,
          default: 'default'
      }
  },
  data: function () {
    return {
        isCollapsed: false
    }
  },
  computed: {
    titleFormatted() {
        return this.MAINTITLE.replace(" ", "-");
    }
  },
  mounted() {   
      $('.collapser').click(function() {
          
          $(this).parent().parent().next().collapse('toggle');
      })
  }
}
</script>

<style scoped>
.panel-heading {
    text-align: center;
    padding: 0px;
}

.group-body {
    padding-top: 10px;
}

.collapser {
    padding: 10px;
    display: block;
    cursor: pointer;
}

.panel-group-bg {
    background: white;
}
</style>