<template>
<div class="ControlPanel">

        <!-- Contents of a Single Panel Below  -->
    <div class="panel panel-success">
        <div class="panel-heading">
            <a class="panel-title" data-toggle="collapse" :href="'#collapse-'+titleFormatted">{{PANELTITLE}}</a>
        </div>

        <div :id="'collapse-'+titleFormatted" class="panel-collapse collapse in">
            <div class="panel-body">
                <slot>
                    <p>Control Panel Elements Go Here</p>
                </slot>
            </div>
        </div>
    </div>
    

</div>
</template>

<script>
export default {
  name: 'ControlPanel',
  props: {
      PANELTITLE: {
          type: String,
          required: true
      }
  },
  data: function() {
    return {
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
}

.ControlPanel {
    margin-bottom: 10px;
}
</style>