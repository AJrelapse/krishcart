export function writeLocalCart(items) {
   window.localStorage.setItem('Cart', JSON.stringify(items))
}

export function getLocalCart() {
   if (typeof window !== 'undefined' && window.localStorage) {
      try {
         const cart = JSON.parse(window.localStorage.getItem('Cart'))
         return cart?.items ? cart : { items: [] }  // ✅ Always return an object with an array
      } catch (error) {
         writeLocalCart({ items: [] })
         return { items: [] }  // ✅ Return an empty cart if JSON parsing fails
      }
   }

   return { items: [] } // ✅ Handle cases where localStorage isn't available
}


export function getCountInCart({ cartItems, productId }) {
   try {
      if (!Array.isArray(cartItems)) {  // ✅ Ensure cartItems is an array
         return 0
      }

      for (let i = 0; i < cartItems.length; i++) {
         if (cartItems[i]?.productId === productId) {
            return cartItems[i]?.count || 0
         }
      }

      return 0
   } catch (error) {
      console.error({ error })
      return 0
   }
}
