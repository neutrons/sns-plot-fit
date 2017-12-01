import _ from 'lodash';
import * as d3 from 'd3';

export const getXScales = state => {
    return state.xScales
}

export const getYScales = state => {
    return state.yScales
}

export const getXScaleByID = state => (id) => {
    return state.xScales[id].copy() // copy is used to prevent scales being changed from another plot
}

export const getYScaleByID = state => (id) => {
    return state.yScales[id].copy() // copy is used to prevent scales being changed from another plot
}

export const getGroups = state => (type) => {
    return state.fetched[type].map(el => el.jobTitle);
}

export const getSANS2DFile = state => (id) => {
    let temp = null;

    for (let i = 0, len = state.fetched.SANS2D.length; i < len; i++) {

        let tempFile = state.fetched.SANS2D[i];

        if (id === tempFile.filename) {
            temp = tempFile;
            break;
        }
    }

    return temp;
}

export const inUploadedSANS2D = state => (fname) => {
    let match = null
    let uploaded = state.uploaded.SANS2D;

    for (let i = 0, len = uploaded.length; i < len; i++) {

        let temp = uploaded[i]

        if (fname === temp.filename) {
            match = temp;
            break;
        }
    }

    return match;
}

/* NEW FIT GETTERS */
export const getFitConfigs = state => (id) => {
    return _.cloneDeep(state.fit[id])
}

export const getFitConfigsByID = state => (id, fit) => {
    return _.cloneDeep(state.fit[id][fit])
}

export const getFitConfigsXTrans = state => (id, fit) => {
    return _.cloneDeep(state.fit[id][fit].transformations.x)
}

export const getFitConfigsYTrans = state => (id, fit) => {
    return _.cloneDeep(state.fit[id][fit].transformations.y)
}

// export const getFitConfigTrans = state => (id, fit) => {
//     return [_.cloneDeep(state.fit[id][fit].yTransformation), _.cloneDeep(state.fit[id][fit].yTransformation)]
// }

export const getFitSettings = state => {
    return _.cloneDeep(state.fit.settings)
}

export const getFirstConfig = state => (id) => {
    return _.cloneDeep(state.fit[id].Linear);
}

export const getFirstConfigSettings = (state, getters) => (id) => {
    return _.cloneDeep(getters.getFirstConfig(id).settings);
}
/* END OF FIT GETTERS */

// export const getFitConfigs = state => {
//     return _.cloneDeep(state.fitConfigurations)
// }

// export const getFitConfigsByID = state => (id) => {
//     return _.cloneDeep(state.fitConfigurations[id])
// }

// export const getFitConfigsXTrans = state => (id) => {
//     return _.cloneDeep(state.fitConfigurations[id].xTransformation)
// }

// export const getFitConfigsYTrans = state => (id) => {
//     return _.cloneDeep(state.fitConfigurations[id].yTransformation)
// }

// export const getFitSettings = state => {
//     return _.cloneDeep(state.fitSettings)
// }

export const getUploaded = state => (type) => {
    return _.cloneDeep(state.uploaded[type]);
}

export const getFetched = state => (type) => {
    return _.cloneDeep(state.fetched[type]);
}

export const getSaved = state => (type) => {
    return _.cloneDeep(state.saved[type]);
}

export const getColorDomain = state => (type) => {
    return _.cloneDeep(state.colorDomain[type]);
}

export const getSavedFile = state => (type, file) => {
    let temp = state.saved[type][file];

    if (temp === undefined) {
        return '999'
    } else {
        return _.cloneDeep(temp)
    }
}

// Finding urls for SANS1D, Stitch, and TAS files
export const getURLs = (state) => (files, type) => {

    let tempURLs = [], 
        fetchList = [], 
        uploadList = [];

    let fetchedFiles = state.fetched[type];
    let uploadedFiles = state.uploaded[type];

    for (let i = 0, len = files.length; i < len; i++) {
        let fname = files[i];

        let inFetch = fetchedFiles.find(el => { return el.filename === fname; });

        if (inFetch !== undefined) {
            fetchList.push(files[i]);
        } else {
            uploadList.push(files[i]);
        }
    }

    if (fetchList.length > 0) {
        
        for (let i = 0, len = fetchedFiles.length; i < len; i++) {
            let t = fetchedFiles[i];

            if (fetchList.indexOf(t.filename) > -1) {
                tempURLs.push({type: 'fetch', url: t.url, filename: t.filename});
            }
        }

    } 
    
    if (uploadList.length > 0) {

        for (let i = 0, len = uploadedFiles.length; i < len; i++) {

            let t = uploadedFiles[i];

            if (uploadList.indexOf(t.filename) > -1) {
                tempURLs.push({type: 'upload', url: t.blob, filename: t.filename});
            }
        }

    }

    return tempURLs;
}