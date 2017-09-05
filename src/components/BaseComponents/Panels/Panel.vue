<template>
<div class="panel">

        <!-- Contents of a Single Panel Below  -->
    <div :class="'panel panel-' + PANELTYPE">
        <div class="panel-heading">
            <div class="panel-title">
                <span class="collapser" @click="isCollapsed = !isCollapsed">{{PANELTITLE}} 
                    <span class="pull-right collapser-icon" v-if="isCollapsed"><i class="fa fa-plus-square" aria-hidden="true"></i></span>
                    <span class="pull-right" v-else><i class="fa fa-minus-square" aria-hidden="true"></i></span>
                </span>
            </div>
        </div>

        <div class="panel-collapse collapse in">
            <div class="panel-body">
                <slot>
                    <p>Panel body content goes here.</p>
                </slot>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import $ from 'jquery'

export default {
  name: 'panel',
  props: {
      PANELTITLE: {
          type: String,
          required: true
      },
      PANELTYPE: {
          type: String,
          default: 'default'
      }
  },
  data: function() {
    return {
        isCollapsed: false
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

.collapser {
    padding: 10px;
    display: block;
    cursor: pointer;
}

.panel {
    margin: 0px;
}
</style>