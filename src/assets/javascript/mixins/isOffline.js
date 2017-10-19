export const isOffline = {
    computed: {
        isOffline() {
            return process.env.IS_OFFLINE;
        }
    }
}