<template>
    <div id="Transformation">

        <!-- X and Y Transformation Panel -->
        <fieldset :disabled="DISABLE">
            <div class="input-group">
                <span class="input-group-addon">X</span>
                <input type="text" class="form-control" :value="XTRANS" id="x-transform" @keyup.enter="enterTransformations" @focus="isTransFocus = !isTransFocus" @blur="isTransFocus = !isTransFocus">
            </div>

            <div class="input-group">
                <span class="input-group-addon">Y</span>
                <input type="text" class="form-control" :value="YTRANS" id="y-transform" @keyup.enter="enterTransformations" @focus="isTransFocus = !isTransFocus" @blur="isTransFocus = !isTransFocus">
            </div>
            
            <p class="transformation-title" v-if="isTransFocus">Press <strong>[enter]</strong> to change transformations</p>
            <div id="transformation-error"></div>
            <button class="btn btn-warning btn-sm btn-block" @click="resetTransformations"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
        </fieldset>

    </div>
</template>

<script>
import fd from '../../assets/javascript/mixins/fittings/fitData.js';

export default {
    name: 'Transformation',
    props: {
        DISABLE: {
            type: Boolean,
            default: false
        },
        XTRANS: {
            type: String,
            required: true
        },
        YTRANS: {
            type: String,
            required: true
        }
    },
    data: function () {
      return {
        isTransFocus: false,
      }
    },
    methods: {
        enterTransformations() {
            let newXTrans = document.getElementById('x-transform').value;
            let newYTrans = document.getElementById('y-transform').value;

            if (fd.isSymbols([newXTrans, newYTrans])) {
                // console.log("Invalid entry!");
                // Generate error message for invalid transformation
                document.getElementById('transformation-error').innerHTML = 
                    '<div class="alert alert-danger alert-dismissable">\
                    <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>\
                    <strong>Error:</strong> Incorrect input.\
                        <ol>\
                            <li>Make sure to enter an appropriate transformation (e.g., "x+2")</li>\
                            <li>Check case, "x" <em>must</em> be lowercase</li>\
                            <li>No additional variables (e.g., "x+c" is incorrect)</li>\
                        </ol>\
                    </div>';
            } else {
                document.getElementById('transformation-error').innerHTML = "";
                this.$emit('set-transformations', newXTrans, newYTrans);
            }
        },
        resetTransformations() {
            this.$emit('reset-transformations');
        }
    }
  }
</script>

<style scoped>
#Transformation {
    text-align: center;
}
</style>
