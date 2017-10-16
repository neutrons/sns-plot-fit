<template>
<div class="panel">

        <!-- Contents of a Single Panel Below  -->
    <div :class="'panel panel-' + PANELTYPE">
        <div class="panel-heading">
            <div class="panel-title">
                <div class="collapser" @click="isCollapsed = !isCollapsed">
                    <slot name="header-content"></slot>
                    <span>{{PANELTITLE}} </span>
                    <span class="collapser-icon" v-if="isCollapsed"><i class="fa fa-plus-square" aria-hidden="true"></i></span>
                    <span class="collapser-icon" v-else><i class="fa fa-minus-square" aria-hidden="true"></i></span>
                </div>
            </div>
        </div>

        <div :class="'panel-collapse collapse' + collapsed">
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
      },
      COLLAPSE: {
          type: Boolean,
          default: false
      }
  },
  data: function() {
    return {
        isCollapsed: this.COLLAPSE ? true : false
    }
  },
  computed: {
      collapsed() {
        if(this.COLLAPSE === false)
            return " in";
        else
            return "";
      }
  },
  mounted() {
      $('.collapser').click(function() {          
          $(this).parent().parent().next().collapse('toggle');
      })
  }
}
</script>

<style lang="less" scoped>
@import '../../../assets/styles/less/panel-component.less';
</style>