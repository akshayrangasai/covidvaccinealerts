var request =  require('request');
const moment = require('moment');
const DISTRICTS = 787;
const mongoose = require('mongoose');


const availabilityByDistricts = new mongoose.Schema(
    {
        district_id: { type: Number, required: true },
        availability: {type: Array, required: true},
        timeStamp : {type: Date, required: true},
    },
    {collection : "availabilityByDistrict" }
);

const availabilityByDistrict = mongoose.model('availabilityByDistrict', availabilityByDistricts);



const vaccineDataSchema = new mongoose.Schema(
    {
        center_id: { type: Number, required: true },
        name: {type: String, require:true},
        state_name: {type: String, require:true},
        district_name: {type: String, require:true},
        pincode: {type: Number, require:true},
        lat: {type: Number, require:false},
        long: {type: Number, require: false},
        fee_type: {type: String, enum : ['Free', 'Paid', ''], require:true},
        date: {type: Date, require:true},
        available_capacity: {type: Number, require:true},
        min_age_limit: {type: Number, enum: [18,45], require:true},
        vaccine: {type: String, enum : ['COVISHIELD', 'COVAXIN']},
    },
    {collection : "vaccineDataCurrent" }
);

const vaccineDataModel = mongoose.model('vaccineDataModel', vaccineDataSchema);


mongoose.connect("mongodb://localhost:27017/testdb", {
  useNewUrlParser: "true",
  useUnifiedTopology: true
})
mongoose.connection.on("error", err => {
  console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected")
});


function main(){

for(let i =1; i <= DISTRICTS; i++){
    //console.log(i);

request('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id='+i+'&date=04-05-2021', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    parseResponse(body,i).then(/*res => saveResponse(res)*/).catch(e => console.log(e));  // Print the covin page
  }
})
}
}

var globalAvailabilityByDistrict ={};

var eighteenplus = 0;

async function parseResponse(responseBody, district_id)
{

    let parsedJSON = JSON.parse(responseBody);
    let availabilityByLocality = new Array();
    try
    {
        parsedJSON.sessions.forEach(session => {


            if(session.available_capacity > 0 && session.min_age_limit == 18)
            {
            availabilityByLocality.push({district_number : district_id, pincode : session.pincode, vaccine_availability : session.available_capacity, center_name : session.name, min_age : session.min_age})
            eighteenplus += session.available_capacity;
            }
        }
            
            
            
            );
            //console.log(availabilityByLocality, district_id);
            if(district_id == 787)
                console.log(eighteenplus);
            
            
            availabilityByDistrict.create({

                    'district_id' : district_id,
                    availability : availabilityByLocality,
                    timeStamp : moment()

            }).then(response => console.log(response.district_id)).catch(e => console.log(e));

            globalAvailabilityByDistrict[district_id] = availabilityByLocality;
    }

    catch (e)
    {
        return e;
    }

    return responseBody;

} 


function saveResponse(responseBody){

    let parsedJSON = JSON.parse(responseBody);

    parsedJSON.sessions.forEach(session => {
    
    
        vaccineDataModel.create({


        center_id: session.center_id,
        name: session.name,
        state_name: session.state_name,
        district_name: session.district_name,
        pincode: session.pincode,
        lat: session.lat,
        long: session.long,
        fee_type: session.fee_type,
        date: session.date,
        available_capacity: session.available_capacity,
        min_age_limit: session.min_age_limit,
        vaccine: session.vaccine,
        }).then(success => console.log(success.district_name)).catch(err => console.log(err))

       // if(session.min_age_limit == 45)
        //console.log(session.pincode, session.name, session.min_age_limit, session.available_capacity);

    });

    //console.log(parsedJSON.sessions[0])

};


function retieveDataByDistrict(){

    for(let i =1; i <= DISTRICTS; i++)
    availabilityByDistrict.findOne({district_id : i}).then(res => console.log(res)).catch(e => console.log(e));
}

retieveDataByDistrict();
