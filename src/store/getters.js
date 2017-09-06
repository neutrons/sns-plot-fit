export const get1DFiles = state => {

}

export const get2DFile = state => (id) => {
    var temp = null;

    for (let i = 0, len = state.fetched2DFiles.length; i < len; i++) {
        let tempFile = state.fetched2DFiles[i];
        if (id === tempFile.filename) {
            temp = tempFile;
            break;
        }
    }

    return temp;
}

export const getColorDomain = state => {
    return state.colorDomain
}

export const getDataType = state => {

}

export const getXScales = state => {
    return state.xScales
}

export const getYScales = state => {
    return state.yScales
}

export const getXScaleByID = state => (id) => {
    return state.xScales[id]
}

export const getYScaleByID = state => (id) => {
    return state.yScales[id]
}

export const getFetched1D = state => {
    return state.fetched1DFiles
}

export const getFetched2D = state => {
    return state.fetched2DFiles
}

export const getUploaded1D = state => {
    return state.uploaded1DFiles
}

export const getUploaded2D = state => {
    return state.uploaded2DFiles
}

export const getGroups = state => (type) => {

    if (type === '1D') {
        return state.fetched1DFiles.map(el => el.jobTitle)
    } else {
        return state.fetched2DFiles.map(el => el.jobTitle)
    }

}

export const getSaved1D = state => (file) => {
    let temp = state.saved1DData[file];

    if (temp === undefined) {
        return '999'
    } else {
        return temp;
    }
}

export const getSaved2D = state => (file) => {
    let temp = state.saved2DData[file];

    if (temp === undefined) {
        return '999'
    } else {
        return temp;
    }
}

export const inUploaded1D = state => (fname) => {
    var match = false

    for (let i = 0, len = state.uploaded1DFiles.length; i < len; i++) {
        var temp = state.uploaded1[i]
        if (fname === temp.filename) {
            match = true
            break
        }
    }

    return match;
}

export const inUploaded2D = state => (fname) => {
    var match = null

    for (let i = 0, len = state.uploaded2DFiles.length; i < len; i++) {
        var temp = state.uploaded2DFiles[i]
        if (fname === temp.filename) {
            match = temp;
            break;
        }
    }

    return match;
}

export const getFitConfigs = state => {
    return state.fitConfigurations
}

export const get1DURL = state => (type, files) => {
    var temp = []

    if(type === 'fetch') {
        for(let i = 0, len = state.fetched1DFiles.length; i < len; i++) {
            let t = state.fetched1DFiles[i];

            if(files.indexOf(t.filename) > -1) {
                temp.push({type: 'fetch', url: t.url, filename: t.filename});
            }
        }
    } else {
        for(let i = 0, len = state.uploaded1DFiles.length; i < len; i++) {

            let t = state.uploaded1DFiles[i];

            if(files.indexOf(t.filename) > -1) {
                temp.push({type: 'upload', url: t.url, filename: t.filename});
            }
        }
    }

    return temp;
}