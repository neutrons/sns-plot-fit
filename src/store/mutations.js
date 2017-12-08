import Vue from 'vue'

export const removePoint = (state, payload) => {
    let name = payload.name;
    let index = payload.index;
    let type = payload.dataType;

    state.saved[type][name].data.splice(index,1);
};

export const removeFile = (state, payload) => {
    let type = payload.dataType;
    let filename = payload.filename;

    // Remove from Uploads list
    // delete state.uploaded[type][filename];
    Vue.delete(state.uploaded[type], filename);

    // Delete from stored list if present
    delete state.saved[type][filename];
};

export const removeColor = (state, payload) => {
    let type = payload.dataType;
    let filename = payload.filename;
    let pos = state.colorDomain[type].indexOf(filename);

    if (pos > -1) {
        state.colorDomain[type].splice(pos, 1);
    }
};

export const addFiles = (state, payload) => {
    let loadType = payload.loadType;
    let type = payload.dataType;
    let files = payload.files;
    let keys = Object.keys(files);
    let matchKeys = Object.keys(state[loadType][type]);

    for (let i = 0, L = keys.length; i < L; i++) {
        let fname = keys[i];

        if (matchKeys.indexOf(fname) === -1) {
            // state[loadType][type][fname] = files[fname];
            Vue.set(state[loadType][type], fname, files[fname]);
        }
    }
    
    // Add to color domain if file is 'Stitch' '1D' or 'TAS' data
    if (type === 'SANS1D' || type === 'Stitch' || type === 'TAS') {
        
        for (let key in files) {
            let color = state.colorDomain[type];

            if (color.indexOf(key) === -1) {
                color.push(key);
            }
        };
    }
};

export const storeData = (state, payload) => {
    let filename = payload.filename;
    let data = payload.data;
    let type = payload.dataType;
        
    // console.log("Storing data:", filename, data, type);
    state.saved[type][filename] = data;
};

export const addTag = (state, payload) => {
    let id = payload.id;
    let loadType = payload.loadType;
    let file = payload.file;
    let tag = payload.tag;
    
    state[loadType][id][file].tags.push(tag);
};

export const removeTag = (state, payload) => {
    let id = payload.id;
    let loadType = payload.loadType;
    let file = payload.file;
    let tag = payload.tag;

    let index = state[loadType][id][file].tags.indexOf(tag);
    
    state[loadType][id][file].tags.splice(index, 1);
};