// Scoped catalogue, not a merchant endorsement. Exact registrable-domain matching.
export const brands = [
 ['Amazon',['amazon.com','amazon.in','amazon.co.uk','amazon.de','amazon.co.jp']],
 ['Flipkart',['flipkart.com']],['Myntra',['myntra.com']],['Meesho',['meesho.com']],
 ['Ajio',['ajio.com']],['Nykaa',['nykaa.com','nykaafashion.com']],['Tata CLiQ',['tatacliq.com','tatacliqluxury.com']],
 ['Croma',['croma.com']],['Reliance Digital',['reliancedigital.in']],['Snapdeal',['snapdeal.com']],
 ['Apple',['apple.com']],['Samsung',['samsung.com']],['Nike',['nike.com']],['Adidas',['adidas.com','adidas.co.in']],
 ['Puma',['puma.com']],['Reebok',['reebok.com','reebok.in']],['IKEA',['ikea.com']],['Decathlon',['decathlon.com','decathlon.in']],
 ['Zara',['zara.com']],['Uniqlo',['uniqlo.com']],['H&M',['hm.com']],['Walmart',['walmart.com']],
 ['eBay',['ebay.com','ebay.co.uk']],['Etsy',['etsy.com']],['Target',['target.com']],['Best Buy',['bestbuy.com']],
 ['Costco',['costco.com']],['ASOS',['asos.com']],['Sephora',['sephora.com','sephora.in']],['Temu',['temu.com']],
 ['AliExpress',['aliexpress.com']],['Lenovo',['lenovo.com']],['Dell',['dell.com']],['Sony',['sony.com','sony.co.in']],
 ['HP',['hp.com']],['Bose',['bose.com']],['Dyson',['dyson.com','dyson.in']],['LEGO',['lego.com']],
 ['New Balance',['newbalance.com']],['Under Armour',['underarmour.com','underarmour.in']]
].map(([name,domains])=>({name,domains}));
export const paymentDomains = ['stripe.com','paypal.com','paypalobjects.com','razorpay.com','payu.in','payu.com','cashfree.com','phonepe.com','paytm.com','adyen.com','adyenpayments.com','worldpay.com','squareup.com','checkout.com','shopify.com'];
export const categories = [
 ['domain','Actual domain'],['brand','Store identity'],['age','Registration age'],['url','Address structure'],
 ['connection','Connection & forms'],['payment','Payment context'],['merchant','Merchant information']
];
export const defaults = {remoteLookup:true,notifications:true};
