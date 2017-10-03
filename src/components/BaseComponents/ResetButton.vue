<template>
    <button @click="onClick" class="btn btn-success btn-xs pull-left btn-reset">
        <slot>Button</slot>
    </button>
</template>

<script>
export default {
    name: 'reset-button',
    props: {
        onClick: {
            type: Function,
            required: true
        }
    }
}
</script>

<style scoped>
.btn-reset {
    position: relative;
    top: 10px;
    left: 10px;
    z-index: 999;
}

.btn-reset:active, .btn-reset:target, .btn-reset:focus {
    outline: none;
    border: none;
    background-color: #5cb85c;
}
</style>