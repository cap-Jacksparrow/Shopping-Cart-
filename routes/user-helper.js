var db=require('../config/connection')
var bcrypt=require('bcrypt')
var objectId=require("mongodb").ObjectId
module.exports={
dosignup:(userdata)=>{
return new Promise(async(resolve,reject)=>{
    userdata.Password=await bcrypt.hash(userdata.Password,10);
    db.get().collection('user').insertOne(userdata).then((data)=>{
        resolve(data);
    })
        
    })
},
dologin:(userdata)=>{
    return new Promise(async(resolve,reject)=>{
    let response={}
    let user=await db.get().collection('user').findOne({Email:userdata.Email})
    if(user){
     bcrypt.compare(userdata.Password,user.Password).then((status)=>{
        if(status){console.log('success');
                   response.user=user;
                   response.status=true         
                  resolve(response)}
        else{console.log('failed');
               resolve({status:false})}})}

    else
    {console.log('failed')
    resolve({status:false})} 
     })
    },
    addtoCart:(proId,userId)=>{
        console.log("userId",userId);
        console.log("proId",proId);
        let proObj={
            item:new objectId(proId),
            qty:1
        }
        console.log("proObj",proObj);
       return new Promise(async(resolve,reject)=>{
            console.log("proObj",proObj);
            let cart=await db.get().collection('cart').findOne({user:new objectId(userId)})
            console.log("cart",cart);
            if(cart){
             let proExist=cart.products.findIndex(product=>product.item==proId)
             if(proExist!=-1)
                {
                    db.get().collection('cart').updateOne({user:new objectId(userId),'products.item':new objectId(proId)},
                {
                    $inc:{'products.$.qty':1}
                }).then(()=>{
                    resolve()
                }).catch((err)=>{
                    console.log("Error in updating cart", err);
                    reject(err);
                })
            }
           else{ db.get().collection('cart').updateOne({user: new objectId(userId)},
        {
            $push:{products:proObj}
        }).then((response)=>{
            resolve()
        })}
            }
            else{
                let cartObj={
                    user:new objectId(userId),
                    products:[proObj]
                }
                db.get().collection('cart').insertOne(cartObj).then((response)=>{
                    console.log("cart created");
                    console.log(response);
                    resolve()
                }).catch((err)=>{
                    console.log("Error in creating cart", err);
                    reject(err);
                })
            }
        })
    },
    getCartItems:(userId)=>{
        return new Promise(async(resolve,reject)=>{
       let cart=await db.get().collection('cart');
       let cartItems=cart.aggregate([
                {
                    $match:{user: new objectId(userId)}

                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:"$products.item",
                        qty:"$products.qty"
                    }

                },
                {
                    $lookup:{
                        from:'product',
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                     }
                },
                {
                    $project:{
                        item:1,qty:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
         ]).toArray()
            resolve(cartItems)
        })
    },
   getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart= await db.get().collection('cart').findOne({user:new objectId(userId)})
            console.log("cart",cart);
            if(cart)
                {
             for(let i=0;i<parseInt(cart.products.length);i++)
          {         
            count+=cart.products[i].qty}
             }
            resolve(count)
        })

    },
    changeProductQty:(details)=>{ 
        cartId=details.cart       
      proId=details.product 
     count=parseInt(details.count)
     qty=parseInt(details.qty)
return new Promise((resolve,reject)=>
{
   if(count==-1 && qty==1) 
    { db.get().collection('cart').updateOne({_id:new objectId(cartId)},
   {
       $pull:{products:{item:new objectId(proId)}}
   }).then((response)=>{
    resolve({removeProduct:true})
   })  
    } 
    else{
    db.get().collection('cart').updateOne({_id:new objectId(cartId),'products.item':new objectId(proId)},
                    {
                        $inc:{'products.$.qty':count}
                    })
                    resolve({status:true})}
})
    },
   removeProduct:(details)=>{
    console.log(details);
    cartId=details.cartId;
    proId=details.proId;
    return new Promise((resolve,reject)=>{
        
        db.get().collection('cart').updateOne({_id:new objectId(cartId)},
   {
       $pull:{products:{item:new objectId(proId)}}
   }).then((response)=>{
    resolve(true)
    
   })  
    })
   },
priceTotal:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let total=await db.get().collection('cart').aggregate([
                 {
                     $match:{user: new objectId(userId)}
 
                 },
                 {
                     $unwind:"$products"
                 },
                 {
                     $project:{
                         item:"$products.item",
                         qty:"$products.qty"
                     }
 
                 },
                 {
                     $lookup:{
                         from:'product',
                         localField:'item',
                         foreignField:'_id',
                         as:'product'
                      }
                 },
                 {
                     $project:{
                         item:1,qty:1,product:{$arrayElemAt:['$product',0]}
                     }
                 },
                 {
                 $group:{_id:null,
                    total:{$sum:{$multiply:['$qty','$product.price']}}

                 } 
                }
          ]).toArray()
          console.log(total)
             resolve(total[0].total)    
         })
},
ProductsList:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let cart= await db.get().collection('cart').findOne({user:new objectId(userId)})
        resolve(cart.products)
    })
},
OrderDetails:(order,products,total)=>{
    return new Promise((resolve,reject)=>{
let status=order['paymentMethod']==='cod'?'placed':'pending'
let orderObj={
    deliverydetails:{
Firstname:order.firstname,
Lastname:order.lastname,  
Email:order.email,
Address:order.address,
pincode:order.pincode
},
user:new objectId(order.user),
paymentmethod:order['paymentMethod'],
products:products,
TotalAmount:total,
status:status,
Date:new Date()
}
 db.get().collection('order').insertOne(orderObj).then((response)=>{
    resolve()
 })
 resolve({status:true})})
},
getOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
   let  orders= await db.get().collection('order').find({user:new objectId(userId)}).toArray()
        resolve(orders)
     
    }) 
},
OrderProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection('order').aggregate([
                 { 
                     $match:{_id: new objectId(orderId)}
 
                 },
                 {
                     $unwind:"$products"
                 },
                 {
                     $project:{
                         item:"$products.item",
                         qty:"$products.qty"
                     }
 
                 },
                 {
                     $lookup:{
                         from:'product',
                         localField:'item',
                         foreignField:'_id',
                         as:'product'
                      }
                 },
                 {
                     $project:{
                         item:1,qty:1,product:{$arrayElemAt:['$product',0]}
                     }
                 }
          ]).toArray() 
             resolve(products)
         })

}

}