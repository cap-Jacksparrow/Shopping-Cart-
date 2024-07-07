var express = require('express');
producthelper=require('./product-helper');
var router = express.Router();

router.get('/', function(req, res,next) {
  producthelper.getproducts().then((products)=>{
    res.render('admin/view-products',{products});
  })
  
});
router.get('/add-products', function(req, res) {
  
  res.render('admin/add-products');
});
router.post('/add-products',(req,res)=>{
  producthelper.addproduct(req.body,(id)=>{
    let Image=req.files.image
    Image.mv('./public/productImages/'+id+'.jpg',(err)=>{if(err) console.log(err) })
  })
  res.redirect('/admin')
});
router.get("/delete/:id",(req,res)=>{  
let proId=req.params.id;
producthelper.deleteProduct(proId).then(()=>{
res.redirect('/admin/')
})
})
router.get('/edit/:id',async(req,res)=>{
  let proId=req.params.id;
  let products=await producthelper.getProducts(proId)
    console.log(products);
    res.render('admin/edit',{products})

})
router.post('/edit/:id',(req,res)=>{
  let proId=req.params.id;
  producthelper.updateProduct(proId,req.body).then((err)=>{
    res.redirect('/admin')
    if(req.files.image){
      let Image=req.files.image
      Image.mv('./public/productImages/'+proId+'.jpg',(err)=>{if(err) console.log(err) })}
    })
  })
    
module.exports = router;
