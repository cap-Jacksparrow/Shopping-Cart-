var db=require('../config/connection')
var objectId=require("mongodb").ObjectId
module.exports={
    addproduct:(product)=>{
    return new Promise(async(resolve,reject)=>{ product.price=parseInt(product.price)
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            resolve(data)
    })})   
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
            console.log(proId)
            db.get().collection('product').findOne({ _id: new objectId(proId) }).then((product)=>{
                console.log(product)
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
        price:parseInt(productdetails.price),
        image:productdetails.image}
    }
     ).then((response)=>{
        console.log(response)
        resolve()
    }) 
     })
    },
getOrderDetails:()=>{
    return new Promise(async(res,rej)=>{
          let orders=await db.get().collection('order').find().toArray()
           res(orders)
    })

}
}
