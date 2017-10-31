export const removePoint = (state, payload) => {
    let name = payload.name;
    let index = payload.index;
    let type = payload.dataType;

    state.saved[type][name].data.splice(index,1);
}

export const removeFile = (state, payload) => {
    let index = 0;
    let type = payload.dataType;
    let uploaded = state.uploaded[type];
    let filename = payload.filename;

    for (let len = uploaded.length; index < len; index++) {

        let temp = uploaded[index];

        if (filename === temp.filename) break;
    }

    // Remove from Uploads list
    state.uploaded[type].splice(index, 1);

    // Delete from stored list if present
    delete state.saved[type][filename];
}

export const removeColor = (state, payload) => {
    let index = 0;
    let type = payload.dataType;
    let colors = state.colorDomain[type];
    let filename = payload.filename;

    for (let len = colors.length; index < len; index++) {
        let temp = colors[index];

        if (filename === temp) break;
    }

    state.colorDomain[type].splice(index, 1);
}

export const addFiles = (state, payload) => {
    let type = payload.dataType;
    let files = payload.files;

    if (payload.loadType === 'upload') {
        state.uploaded[type] = state.uploaded[type].concat(files)
    } else {
        state.fetched[type] = files;
    }
    
    // Add to color domain if file is 'Stitch' '1D' or 'TAS' data
    if (type === 'SANS1D' || type === 'Stitch' || type === 'TAS') {
        
        for (let i = 0, len = files.length; i < len; i++) {
            let fname = files[i].filename;
            let color = state.colorDomain[type];

            if (color.indexOf(fname) === -1)   color.push(fname);
        }
    }

}

export const storeData = (state, payload) => {
    let tempName = payload.filename;
    let tempData = payload.data;
    let type = payload.dataType;
        
    console.log("Storing data:", tempName, tempData, type);
    state.saved[type][tempName] = tempData
}