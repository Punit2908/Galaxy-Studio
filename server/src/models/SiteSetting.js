import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  key:{type:String,required:true,unique:true,index:true},
  value:{type:String,default:''},
  updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
},{timestamps:true})
export default mongoose.model('SiteSetting',schema)
