const mongoClient=require('mongodb').MongoClient
const state={
  db:null
} 
module.exports.connect=function(done){

  const url=process.env.MONGO_URI;
  const dbname='shopping';
  mongoClient.connect(url).then((data)=>{
   {
   state.db=data.db(dbname);
   done();}
  }).catch((err)=>{
      return done(err);
  })
}
module.exports.get=function(){
  return state.db;
}
