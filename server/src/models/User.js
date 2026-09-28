import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:80},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},
  password:{type:String,required:true,minlength:8,select:false},
  role:{type:String,enum:['user','admin','superadmin'],default:'user',index:true},
},{timestamps:true})

schema.pre('save',async function(next){
  if(!this.isModified('password')) return next()
  this.password=await bcrypt.hash(this.password,12)
  next()
})
schema.methods.comparePassword=function(password){ return bcrypt.compare(password,this.password) }
schema.methods.toSafeJSON=function(){ return {id:this._id,name:this.name,email:this.email,role:this.role,createdAt:this.createdAt} }
export default mongoose.model('User',schema)
