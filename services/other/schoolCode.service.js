var randomstring = require("randomstring");
const school = require('../../models/school');
const { Op } = require("sequelize");
const { stubString } = require("lodash");
var _ = require('lodash');
const { checkVisorSchoolCode } = require("../visor/schoolCode.service");

 exports.getSchoolCode = async ()=>{
    let code = randomstring.generate({
        length: 5,
        charset: 'alphanumeric',
        capitalization :'uppercase'
    });

     const getSchoolCodeCheck = await school.school_master.count({
        where:{scode:code}
    });
    if(getSchoolCodeCheck != 0){
        getSchoolCode();
    }
    return code;    

}

exports.getSchoolCodeWithState = async (statecode,fy,inc)=>{
    let states = statecode;
    let fys = fy;
    var ckCode = '';
    var inc = inc ? inc : 0;
    let get = await school.school_master.findAll({
        attributes:['ck_code'],
        where:[
            {
                ck_code:{
                    [Op.not]:null
                }
            }
            
        ]
    })
    let numArry = [];
    let codeArry = [];
    if(get.length == 0){
        let n = fy.toString();
        ckCode = statecode+n+"001";
    }else {
        let codeNum = 0;
        let res = get.map((e)=>{
            let codes = e.ck_code;
            if(statecode+fy == codes.substring(0,3)){
                codeNum += 1
            numArry.push(parseInt(codes.substring(3)));
            codeArry.push(codes.substring(0,3))
            }
        })
        if(numArry.length==0){
            let n = fy.toString();
            ckCode = statecode+n+"001";
        }else{
            let max = _.max(numArry);
            let maxLength = max.toString().length;
            max = max+1+inc;
            if(maxLength == 1){
                max = statecode+fy+"00"+max;
            }else if(maxLength == 2){
                max = statecode+fy+"0"+max;
            }else{
                max= statecode+fy+max
            }
            ckCode = max;
        }
        let breakCode = ckCode.replace(states+fy,'');
        breakCode = parseInt(breakCode);
        breakCode += inc;
        let numL = breakCode.toString();
        breakCode = breakCode.toString();
        console.log(numL.length);
        if(numL.length == 1){
            breakCode = "00"+breakCode;
        }else if(numL.length == 2){
            breakCode = "0"+breakCode;
        }else {
            breakCode = breakCode;
        }
        let newCode = states+fy+breakCode;
        let verify = await checkVisorSchoolCode(newCode);
        if(verify === true){
            inc += 1
          let m = await this.getSchoolCodeWithState(states,fys,inc)
          newCode = m
        }
        return newCode

    }
   
  
    // let count = await school.school_master.find
}

// module.exports = [getSchoolCode,getSchoolCodeWithState];