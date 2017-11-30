<template>

        <div class="panel-group">

            <!-- Collapsible panel -->
            <div :class="'panel panel-' + PANELTYPE">
                <div class="panel-heading">
                    <div class="panel-title">
                    
                        <slot name='title-content'></slot>

                        <div class="collapser" @click="isCollapsed = !isCollapsed">
                            <span>{{MAINTITLE}} </span>
                            <span class="collapser-icon" v-if="isCollapsed"><i class="fa fa-plus-square" aria-hidden="true"></i></span>
                            <span class="collapser-icon" v-else><i class="fa fa-minus-square" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </div>
                <!-- End Collasible panel -->

                <div class="panel-collapse collapse in">
                        <!-- Insert Panel Components Here  -->
                        <slot></slot>
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
      $('.collapser:not(button)').click(function() {
          
          $(this).parent().parent().next().collapse('toggle');
      })
  }
}
</script>

<style lang="less" scoped>
@import '../../../assets/styles/less/panel-component.less';
</style>