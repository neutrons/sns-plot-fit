export const checkError = {
    methods: {
        checkError() {
            let vm = this;

            let len = document.getElementById("error-container").children.length;
            return len > 0 ? false : true;
        }
    }
}