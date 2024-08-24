var db=require('../config/connection')
var objectId=require("mongodb").ObjectId
module.exports={
    addproduct:(product,callback)=>{
        product.price=parseInt(product.price)
    db.get().collection('product').insertOne(product).then((data)=>{
        callback(data.insertedId)
})
    },
    getproducts:()=>{
        return new Promise(async(resolve,reject)=>{
         let products=await db.get().collection('product').find().toArray()
         resolve(products)
        })
        
    }, 
    deleteProduct:(proId)=>{ 
        return new Promise((resolve,reject)=>{
        db.get().collection('product').deleteOne({_id:new objectId(proId)}).then((response)=>{
            console.log(response)
            resolve(response)
        })
        })
    },
    getProducts:(proId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection('product').findOne({ _id: new objectId(proId) }).then((product)=>{
                resolve(product)
            })
        })
        
},
updateProduct:(proId,productdetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection('product').updateOne({_id:new objectId(proId)},{
        $set:{
        name:productdetails.name,
        des:productdetails.des,
        price:parseInt(productdetails.price)}
    }
     ).then((response)=>{
        resolve()
    }) 
     })
    }
}
