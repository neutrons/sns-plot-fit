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
    return state.fetched.SANS2D[id];
}

export const inUploadedSANS2D = state => (fname) => {
    let temp = state.uploaded.SANS2D[fname];
    return temp === undefined ? false : temp;
}

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

export const getFitSettings = state => {
    return _.cloneDeep(state.fit.settings)
}

export const getFirstConfig = state => (id) => {
    return _.cloneDeep(state.fit[id].Linear);
}

export const getFirstConfigSettings = (state, getters) => (id) => {
    return _.cloneDeep(getters.getFirstConfig(id).settings);
}

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
    let fetchKeys = Object.keys(fetchedFiles);
    let uploadedFiles = state.uploaded[type];

    for (let i = 0, len = files.length; i < len; i++) {
        let fname = files[i];
        let inFetch = fetchKeys.indexOf(fname) > -1;

        if (inFetch) {
            fetchList.push(files[i]);
        } else {
            uploadList.push(files[i]);
        }
    }

    if (fetchList.length > 0) {
        
        for (let key in fetchedFiles) {
            let temp = fetchedFiles[key];

            if (fetchList.indexOf(key) > -1) {
                tempURLs.push({type: 'fetched', url: temp.url, filename: temp.filename, tags: temp.tags});
            }
        }
    } 
    
    if (uploadList.length > 0) {

        for (let key in uploadedFiles) {
            let temp = uploadedFiles[key];

            if (uploadList.indexOf(key) > -1) {
                tempURLs.push({type: 'uploaded', url: temp.blob, filename: temp.filename, tags: temp.tags});
            }
        }
    }

    return tempURLs;
}