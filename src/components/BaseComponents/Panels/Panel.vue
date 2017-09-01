<template>
<div class="panel">

        <!-- Contents of a Single Panel Below  -->
    <div :class="'panel panel-' + PANELTYPE">
        <div class="panel-heading">
            <div class="panel-title">
                <a data-toggle="collapse" :href="'#collapse-'+titleFormatted" @click="isCollapsed = !isCollapsed">{{PANELTITLE}} 
                    <span class="pull-right" v-if="isCollapsed"><i class="fa fa-plus-square" aria-hidden="true"></i></span>
                    <span class="pull-right" v-else><i class="fa fa-minus-square" aria-hidden="true"></i></span>
                </a>
            </div>
        </div>

        <div :id="'collapse-'+titleFormatted" class="panel-collapse collapse in">
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
  computed: {
    titleFormatted() {
        return this.PANELTITLE.replace(" ", "-");
    }
  }
}
</script>

<style scoped>
.panel-heading {
    text-align: center;
    padding: 0px;
}

a {
    padding: 10px;
    display: block;
}

.panel {
    margin: 0px;
}
</style>