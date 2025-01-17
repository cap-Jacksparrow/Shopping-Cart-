var express= require('express');
producthelper=require('./product-helper');
var router = express.Router();
 const userhelper=require('./user-helper')
 const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn)
  {next()}
  else{
    res.redirect("/login")
  }
 }
/* GET home page. */
router.get('/', async function(req, res){
  let user=req.session.user
  let cartCount=null
  if(user){
  cartCount= await userhelper.getCartCount(req.session.user._id)}
  producthelper.getproducts().then((products)=>{
    res.render('user/viewproducts',{products,user,cartCount});
  })
  
})
router.get('/signup',(req,res)=>{
  
  res.render('user/user-signup')
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn)
  {
    res.redirect('/')
  }
  else{
   res.render('user/user-login',{"loginErr":req.session.loginErr})
   }
   req.session.loginErr=false
});
router.post('/signup',(req,res)=>{
  userhelper.dosignup(req.body).then((user)=>{
    if(user)
    req.session.loggedIn=true
     req.session.user=user
     console.log(user)
    res.redirect('/') 
  });
});

router.post('/login',(req,res)=>{
  userhelper.dologin(req.body).then((response)=>{
   if(response.status)
   { req.session.loggedIn=true 
     req.session.user=response.user
    res.redirect('/')
   }
   else{
    req.session.loginErr="Invalid username or password"
    res.redirect('/login')}
  });
});
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/'); 
}) 
router.get("/cart",verifyLogin,async(req,res)=>{ 
  products=await userhelper.getCartItems(req.session.user._id)
  let user=req.session.user 
  let total=await userhelper.priceTotal(req.session.user._id)
  res.render("user/cart",{user,products,total}) 
})
router.get('/add-to-cart/:id',(req,res)=>{
  userhelper.addtoCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  userhelper.changeProductQty(req.body).then(async(response)=>{
   response.total=await userhelper.priceTotal(req.body.user)
res.json(response)
 }) 
}) 
router.post('/remove-product',(req,res,next)=>{
userhelper.removeProduct(req.body).then((response)=>{
  res.json(response)
 })
})
router.get('/checkout',async(req,res)=>{
  let total=await userhelper.priceTotal(req.session.user._id)
  res.render('user/placeOrder',{total,user:req.session.user})
})
router.post('/checkout',async(req,res)=>{
  console.log(req.body)
  let total=await userhelper.priceTotal(req.session.user._id)
  products=await userhelper.ProductsList(req.session.user._id)
 userhelper.OrderDetails(req.body,products,total).then((response)=>{
  res.json(response)
  console.log(response)
 })
 
}) 
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
let orders= await userhelper.getOrders(req.session.user._id)
console.log(orders)
res.render('user/orders',{orders,user:req.session.user})
})   
router.get('/vieworderproducts/:id',async(req,res)=>{
  products=await userhelper.OrderProducts(req.params.id) 
  console.log(products)
  res.render('user/orderproducts',{products,user:req.session.user})
})   
module.exports = router;     