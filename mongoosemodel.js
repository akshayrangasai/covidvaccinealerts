const mongoose = require('mongoose');

const vaccineDataSchema = new mongoose.Schema(
    {
        center_id: { type: Number, required: true },
        name: {type: String, require:true},
        state_name: {type: String, require:true},
        district_name: {type: String, require:true},
        pincode: {type: Number, require:true},
        lat: {type: Number, require:false},
        long: {type: Number, require: false},
        fee_type: {type: String, enum : ['Free', 'Paid'], require:true},
        date: {type: Date, require:true},
        available_capacity: {type: Number, require:true},
        min_age_limit: {type: Number, enum: [18,45], require:true},
        vaccine: {type: String, enum : ['COVISHIELD', 'COVAXIN']},
    },
    {collection : "vaccineDataCurrent" }
);

const model = mongoose.model('vaccineDataModel', vaccineDataSchema);
export default model;