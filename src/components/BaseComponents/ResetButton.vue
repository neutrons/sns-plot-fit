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

<style lang="less" scoped>

.btn-reset {

    position: relative;
    top: 0px;
    left: 5px;
    z-index: 999;
    padding: 0px 5px;

    @media screen and (min-width: 1441px) { font-size: 12px; }
    
    @media screen and (max-width: 1440px) { font-size: 10px; }

    &:active, &:target, &:focus {
        outline: none;
        border: none;
        background-color: #5cb85c;
    }
}
</style>