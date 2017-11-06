import pp from 'papaparse';
import config from '../configs/SANS2D.js';

export default function (data) {

    var results2D = pp.parse(data, config);

    return results2D;
}