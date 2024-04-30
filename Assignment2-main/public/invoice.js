// get the query string into a easy to use object
const params = (new URL(document.location)).searchParams;

let quantities = [];
// check if the query string has quantities, parse it and convert elements to numbers
if (params.has('quantities')) {
  quantities = JSON.parse(params.get('quantities')).map(Number);
} else {
  console.log('No quantities in query string');
}



let products;

let email;
if (params.has('email')) {
  email = (params.get('email'))
} 

// create an alert to let user know they have logged in successfully
alert(`You have successfully logged in as ${email}! Please press okay to be redirected to the purchase confirmation page.`)

window.onload = function () {
  // use fetch to retrieve product data from the server
  // once the products have been successfully loaded and formatted as a JSON object
  // display the invoice
  fetch('products.json').then(function (response) {
    if (response.ok) {
      response.json().then(function (json) {
        products = json;
        display_invoice();
      })
      confirm_form.action = `${confirm_form.action}?quantities=${params.get('quantities')}`;;
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  });
}

function display_invoice() {
  let extended_price;
  let subtotal = 0;

  // Identify the table element
  const table = document.getElementById('invoice_table');

  // loop through quantities array and output invoice table row
  for (let i in quantities) {
    if (quantities[i] == 0) continue; // don't output zero quantity items
    extended_price = quantities[i] * products[i].price;
    subtotal += extended_price; // running subtotal
    // Create a new row element
    let new_row = table.insertRow(4); // Inserts after the fourth row (index 4)
    // Create a second row element
    let new_row_2 = table.insertRow(5) // Inserts after the fifth row (index 5)
    // generate what to output in first table row
    // IR5 - hover image. popup appears on mouseover the image and doesn't display when user moves mouse off of the image. The text for the popup is set to be the product description from the products.json.
    new_row.innerHTML = `
    <td colspan="1" style="text-align: left; vertical-align: middle;">
    <div class="image-container">
      <img src='images/${products[i].image}' 
        onmouseover="document.getElementById('popup_${i}').style.display = 'block';" 
        onmouseout="document.getElementById('popup_${i}').style.display = 'none';">
      <div class="popup" id="popup_${i}">${products[i].description}</div></div>
    </td>
    <td colspan="2" style="text-align: left; vertical-align: middle;">${products[i].name}</td>`
    // generate second table row with quantity purchased, price, and extended price
    new_row_2.innerHTML = `
      <tr> <td colspan="3" style="text-align: center;">(${quantities[i]} @ $${products[i].price})</td>
      <td colspan="2" style="text-align: right;">\$${extended_price.toFixed(2)}</td>
      </tr>
      `;
  }

  // Compute subtotal and write into table
  document.getElementById('subtotal_span').innerText = subtotal.toFixed(2);

  // Compute tax and write into table
  let tax_rate = 0.04712;
  document.getElementById('tax_rate_span').innerText = (100 * tax_rate).toFixed(2);
  let tax = tax_rate * subtotal;
  document.getElementById('tax_span').innerText = tax.toFixed(2);

  // Compute shipping and write into table
  // shipping is $5 for orders less than $75, $2 for orders less than $125, and free for orders more than that
  let shipping;
  if (subtotal <= 75) {
    shipping = 5;
  } else if (subtotal <= 100) {
    shipping = 2;
  } else {
    shipping = 0; 
  }
  document.getElementById('shipping_span').innerText = shipping.toFixed(2);

  // Compute grand total and write into table
  let total = subtotal + tax + shipping;
  document.getElementById('total_span').innerText = total.toFixed(2);
}