import mongoose from 'mongoose'

const schema=new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:160},
  slug:{type:String,required:true,unique:true,trim:true,index:true},
  description:{type:String,default:''},
  coverMedia:{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset',default:null},
  media:[{
    asset:{type:mongoose.Schema.Types.ObjectId,ref:'MediaAsset',required:true},
    sortOrder:{type:Number,default:0},
  }],
  sortOrder:{type:Number,default:0,index:true},
  isPublished:{type:Boolean,default:true,index:true},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
},{timestamps:true})
export default mongoose.model('Album',schema)
