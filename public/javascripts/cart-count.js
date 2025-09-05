function cartCount(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status) 
                {  
                   let count=$('.cart-count').html()
                    count=parseInt(count)+1;
                    $('.cart-count').text(count).show()
                    
                }
        }
     
    })
}
function reduceCount(qty){
    let count=$('.cart-count').text();
    count=parseInt(count)-parseInt(qty);

}

