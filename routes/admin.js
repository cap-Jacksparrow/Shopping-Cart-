var express = require('express');
var db=require('../config/connection')
producthelper=require('./product-helper');
var router = express.Router();
var bcrypt=require('bcrypt')
function dologin(userdata){
  return new Promise(async(resolve,reject)=>{
  let response={}
  let admin=await db.get().collection('admin').findOne({Email:userdata.Email})
  if(admin){
    console.log(admin)
   bcrypt.compare(userdata.Password,admin.Password).then((status)=>{
      if(status){console.log('success');
                 response.admin=admin;
                 response.status=true         
                resolve(response)}
      else{console.log('failed');
             resolve({status:false})}})}

  else
  {console.log('failed')
  resolve({status:false})} 
   })
  }
router.get('/', async function(req, res,next) {
  if(req.session.loggedIn){
    admin=req.session.admin
    console.log(admin)
    producthelper.getproducts().then((products)=>{
      res.render('admin/view-products',{products,admin,adminheader:true});
  })
 } else {
   res.render('admin/admin-login',{adminheader:true});
}
});
router.get('/adminlogin',(req,res)=>{
  if(req.session.loggedIn)
  {
    res.redirect({adminheader:true},'/admin',)
  }
  else{
   res.render('admin/admin-login',{"loginErr":req.session.loginErr,adminheader:true})
   }
   req.session.loginErr=false
});
router.post('/adminlogin',(req,res)=>{
  dologin(req.body).then((response)=>{
   if(response.status)
   { req.session.loggedIn=true 
     req.session.admin=response.admin
    res.redirect(302,'/admin')
   }
   else{
    req.session.loginErr="Invalid username or password"
    res.render('admin/admin-login',{adminheader:true})}
  });
});

router.get('/add-products', function(req, res) {
  if(req.session.loggedIn)
    admin=req.session.admin
  res.render('admin/add-products',{adminheader:true,admin});
});
router.post('/add-products',(req,res)=>{
  producthelper.addproduct(req.body)
  res.redirect(302,'/admin')
});
router.get("/delete/:id",(req,res)=>{  
let proId=req.params.id;
producthelper.deleteProduct(proId).then(()=>{
res.redirect(302,'/admin/')
})
})
router.get('/edit/:id',async(req,res)=>{
  let proId=req.params.id;
  if(req.session.loggedIn)
    admin=req.session.admin
  let products=await producthelper.getProducts(proId)
    res.render('admin/edit',{products,admin,adminheader:true})

})
router.post('/edit/:id',(req,res)=>{
  let proId=req.params.id;
  console.log(proId);
  producthelper.updateProduct(proId,req.body).then((err)=>{
    res.redirect(302,'/admin')
    })
  })
    
  router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect(302,'/admin');  
  })

  router.get('/getOrderDetails',(req,res)=>{
   if(!req.session.loggedIn)
        res.redirect(302,'/admin/adminlogin')
       
      admin=req.session.admin
       console.log(admin)
      producthelper.getOrderDetails().then((orders)=>{
     console.log(orders)
      res.render('admin/AllOrder',{adminheader:true,orders,admin})
    })
  })
module.exports = router;
 