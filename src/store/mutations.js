export const addFetched1DFiles = (state, files) => {
    state.fetched1DFiles = files

    //Add to color domain
    for(let i = 0, len = files.length; i < len; i++) {
        state.colorDomain.push(files[i].filename);
    }
}
export const addFetched2DFiles = (state, files) => {
    state.fetched2DFiles = files
}
export const addUploaded1DFiles = (state, files) => {
    // console.log("Add 1D files...", files);
    state.uploaded1DFiles = state.uploaded1DFiles.concat(files)

    //Add to color domain
    for(let i = 0, len = files.length; i < len; i++) {
        state.colorDomain.push(files[i].filename);
    }
}
export const addUploaded2DFiles = (state, files) => {
    // console.log("Add 2D files...", files);
    state.uploaded2DFiles = state.uploaded2DFiles.concat(files)
}
export const store1DData = (state, data) => {
    let tempName = data.filename
    let tempData = data.data
        
    state.saved1DData[tempName] = tempData
}
export const store2DData = (state, data) => {
    let tempName = data.filename
    let tempData = data.data
    state.saved2DData[tempName] = tempData
}
export const remove1DFile = (state, filename) => {
    let index = 0;

    for (let len = state.uploaded1DFiles.length; index < len; index++) {

        let temp = state.uploaded1DFiles[index];

        if (filename === temp.filename) break;
    }

    // Remove from 2D Uploads list
    state.uploaded1DFiles.splice(index, 1);

    // Delete from stored list if present
    delete state.saved1DData[filename];

}
export const remove2DFile = (state, filename) => {
    let index = 0;

    for (let len = state.uploaded2DFiles.length; index < len; index++) {

        let temp = state.uploaded2DFiles[index];

        if (filename === temp.filename) break;
    }

    // Remove from 2D Uploads list
    state.uploaded2DFiles.splice(index, 1);

    // Delete from stored list if present
    delete state.saved2DData[filename];
}

export const removeColor = (state,filename) => {
    let index = 0;
    for(let len = state.colorDomain.length; index < len; index++) {
        let temp = state.colorDomain[index];

        if(filename === temp) break;
    }

    state.colorDomain.splice(index, 1);
}

export const removePoint = (state, payload) => {
    let name = payload.name;
    let index = payload.index;

    console.log("removing " + name, state.saved1DData[name].data);
    state.saved1DData[name].data.splice(index,1);

    console.log("removing " + name, state.saved1DData[name].data);
}