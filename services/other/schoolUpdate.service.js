const { MaxcrmID } = require('../../helpers/school/crmId.helper');
const school = require('../../models/school');
const getSchoolCode = require('./schoolCode.service');

const updateSchoolCodes = async()=>{
    try{
        
        const getSchool = await school.school_master.findAll({
            attributes:['id','temp_id'],
            where:{temp_id:null},
          
            
        })
        if(!getSchool){
            return false;
        }
        for(let i= 1; i<=getSchool.length; i++){

                let codes = await MaxcrmID();
            console.log(codes);
            if(!isNaN(codes)){
                const update = await school.school_master.update({
                    temp_id:codes
                },
                {
                    where:{id:getSchool[i].id}
                });
                if(!update){
                    return false;
                }
                
            }
        }
    }catch(e){
        console.log(e.message);
    }
}

module.exports = updateSchoolCodes;