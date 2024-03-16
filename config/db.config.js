// const sequelizeStream = require('node-sequelize-stream');
const Sequelize = require('sequelize')


  const conf_sequelize = new Sequelize(
    process.env.db_name,
     process.env.db_user,
     process.env.db_password,
     
    {
      dialect:  process.env.db_dialect,
      dialectOptions: { 
        timezone: '+05:30' // for reading the data
      },
      timezone: '+05:30',
      host:  process.env.db_host,
      retry: {
        match: [/Deadlock/i],
        max: 5, // Maximum rety 3 times
        backoffBase: 2000, // Initial backoff duration in ms. Default: 100,
        backoffExponent: 2, // Exponent to increase backoff each try. Default: 1.1
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 120000,
        idle: 10000
      },
    
    },
    
    
  )
  // sequelizeStream(sequelize, 100, true);
  module.exports = conf_sequelize


