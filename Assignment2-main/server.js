// loads the products array into server memory from the products.json file
const products = require(__dirname + '/products.json');

const express = require('express');
const app = express();

const fs = require('fs');
// import the crypto library for encrypting passwords
const crypto = require('crypto');

// loads the user data
const user_data_file = __dirname +'/user_data.json'

// check that user data fileexists and read in if it does
// This loop was given to us to use by professor during lab
let user_reg_data = {};
if (fs.existsSync(user_data_file)) {
  const data = fs.readFileSync(user_data_file, 'utf-8');
  user_reg_data = JSON.parse(data);
  let stats =fs.statSync(user_data_file)
  console.log(`${user_data_file} has ${stats.size}`)
} 

let products_data = [];
if (fs.existsSync(products)) {
  const data = fs.readFileSync(products, 'utf-8');
  products_data = JSON.parse(data);
  let product_stats =fs.statSync(products)
  console.log(`${products} has ${product_stats.size} characters`)
}


console.log(user_reg_data);
console.log(products_data)


const bodyParser = require("body-parser");
const e = require('express')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});

// A micro-service to return the products data currently in memory on the server as
// javascript to define the products array
app.get('/products.json', function (req, res, next) {
  res.json(products);
});

// route to get login data and respond with data (added from assignment2)
app.post('/process_login_form', function (request, response, next) {
  console.log(request.body, request.query);
  // Process login form POST and redirect to invoice in page if okay, back to login page if not
  let errors = {}
  // check if user exists in user_reg_data
  let email_entered = request.body["email"].toLowerCase();
  // IR1: encrypting passwords. Using SHA256 algorithm recommended by looking up crypto and ChatGPT. creating different hash variables for the different password variables to use
const hash_login_password = crypto.createHash('sha256');
  // taking the password sent in the request.body and encrypting it according to the hash created earlier and a hexadecimal format
  let password_login_encrypted = hash_login_password.update(request.body.password).digest('hex');
  let emailValue = request.body.email;

    const params = new URLSearchParams();
    // Get quantities from the query string
    if ('quantities' in request.query) {
      params.append('quantities',request.query.quantities);
    }

  if (email_entered in user_reg_data) {
    // check if password matches
    if (password_login_encrypted === user_reg_data[email_entered].password) {
    params.append('email', (emailValue));
    response.redirect(`./invoice.html?${params.toString()}`)
      return;
    } else {
      errors.password = `Password Incorrect. Please try again`;
      // errors_query = JSON.stringify(errors);
      params.append('errors', (JSON.stringify(errors)));
      params.append('email', request.body.email);

      // Used ChatGPT for server-side code to find a way to include the email and full name into the query string so that the fields stay sticky when there are errors. add the hasErrors=true to connect to the registration.html. add errorParams to access errors from registration client-side processing
      response.redirect(`./login.html?${params.toString()}`);
      // response.redirect(`./login.html?email=${encodeURIComponent(emailValue)}&hasErrors=true&errors=${encodeURIComponent(errors_query)}`);
    }
  }
  else {
    errors.email = `Email ${request.body.email} does not exist. Please register.`;
    // if errors, send back to login page to fix
    // errors_query = JSON.stringify(errors);
    params.append('errors', (JSON.stringify(errors)));
    params.append('email', (emailValue));
    params.append('hasErrors', 'true')
    // Used ChatGPT for server-side code to find a way to include the email and full name into the query string so that the fields stay sticky when there are errors. add the hasErrors=true to connect to the registration.html. add errorParams to access errors from registration client-side processing
    // response.redirect(`./login.html?email=${encodeURIComponent(emailValue)}&hasErrors=true&errors=${encodeURIComponent(errors_query)}`);
    response.redirect(`./login.html?${params.toString()}`)
    
  }
}
);



// route to get registration data and respond with data (added from assignment2)
app.post('/process_registration_form', function (request, response, next) {
  console.log(request.body);
  let errors = {};
  let email_registered = request.body["email"].toLowerCase();
  let password_registered = request.body["password"];
  let full_name_registered = request.body["full_name"].toLowerCase()
   // IR 1 encrypting passwords. Using SHA256 algorithm recommended by looking up crypto and ChatGPT. creating different hash variables for the different password variables to use
const hash_reg_repeat = crypto.createHash('sha256');
const hash_reg_pass = crypto.createHash('sha256');
// taking the password sent in the request.body and encrypting it according to the hash created earlier and a hexadecimal format
let password_repeat_encrypted = hash_reg_repeat.update(request.body["password_repeat"]).digest('hex');
  const params = new URLSearchParams();
    // Get quantities from the query string
    if ('quantities' in request.query) {
      params.append('quantities', request.query.quantities);
    }
  // validate registration data
  // is email already registered?
  function isEmailValid(email_registered) {
    // check if email has the proper format of address@host.organization if not, send an error that it is not correct.
    if (email_registered.includes('@') && email_registered.includes('.')) {
      // splits the email by the @ to separate the address from host and organization
      [email_address, rest_of_email] = email_registered.split('@');

      // separates the email host into 2 parts based on the last "." in the email string (Chat GPT)
      email_host_organization = rest_of_email.lastIndexOf('.');
      email_host = rest_of_email.slice(0, email_host_organization);
      email_org = rest_of_email.slice(email_host_organization + 1);
      console.log(`${email_host}, ${email_org}`)
    }
    else {
      // create appropriate error to display
      errors.registration = `${email_registered} does not contain an address, host, and organization separated by an "@" and "."`;
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // checks if email address contains only letters, numbers, "_", or "." using a regEx given by Chat GPT. If not, error message.
    if ((!(/^[a-zA-Z0-9_.]+$/.test(email_address)))) {
      errors.address = `Address ${email_address}must only contain letters, numbers, "_", or "."`;
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // Check if email host contains only letters, numbers, or "." using a regEx given by Chat GPT. If not, error message.
    if (!(/^[a-zA-Z0-9.]+$/.test(email_host))) {
      errors.host = `Host ${email_host} must only contain letters, numbers, or "."`;
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // Check if email organization contains only letters using a regEx given by Chat GPT and is either 2 or 3 characters long. If not, error message.
    if (!(/^[a-zA-Z]+$/.test(email_org)) || !(email_org.length === 2 || email_org.length === 3)) {
      errors.org = `Organization ${email_org} must contain only letters and be 2 or 3 letters long`;
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // makes function true to say the email is valid because none of the above if statements were true
    return true;
  }

  function isPasswordValid(password_registered) {
    // check if password is less than 10 (invalid)
    if ((password_registered.length < 10)) {
      // return appropriate error
      errors.password_length = `Password must be more than 10 characters`
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // check if password contains spaces (invalid)
    if (password_registered.includes(' ')) {
      // return appropriate errors
      errors.password_space = `Passwords must not include spaces.`
      // // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // makes function true to say the password is valid because none of the above if statements were true. Also want to encrypt password AFTER all the checks are done because once it is encrypted, it wont work.
   password_registered_encrypted = hash_reg_pass.update(password_registered).digest('hex');
    return true;
  }

  function isRepeatMatching(initial_password_registered, repeat_password_confirmation) {
    // check if both the initial password entry and the repeat password entry are exactly the same
    if (repeat_password_confirmation !== initial_password_registered) {
      // return appropriate errors
      errors.repeat = `Passwords entered do not match.`
      // makes function false so it doesn't continue checking if and else statements
      return false;
    }
    // makes function true to say the email is valid because none of the above if statements were true
    return true;
  }

  function isNameValid(name_entered) {
    // check if name contains only upper case or lower case letters
    if (!(/^[a-zA-Z ]+$/.test(name_entered))) {
      // return appropriate errors
      errors.name_characters = `${name_entered} must only contain letters.`;
      // change function to false so it does not check any more if statements
      return false;
    }
    // check if name is the appropriate lenght between 2 and 30 characters
    if (name_entered.length > 30 || name_entered.length < 2) {
      // return appropriate errors
      errors.name_length = `${name_entered} must be at least 2 characters, and not more than 30.`;
      // change function to false so registration does not occur from invalid data
      return false;
    }
    return true;
  }

  function isFieldBlank(email, name, password, password_again) {
    if (typeof email === undefined) {
      errors.email_empty = `Please enter an email.`
    }
    if (typeof name === undefined) {
      errors.name_empty = `Please enter a name.`
    }
    if (typeof password === undefined) {
      errors.password_empty = `Please enter a password.`
    }
    if (typeof password_again === undefined) {
      errors.password_again_empty = `Please enter password again.`
    }

  }

  // condition checks if email_registered is NOT in user_reg_data then checks if the registered information is correct. doesn't make sense to go through rest of checks if user is already registered/in user_reg_data
  if (!(email_registered in user_reg_data)) {
    // use isEmailValid function to make sure email is valid structure
    if (!isEmailValid(email_registered)) {
      // print out errors from isEmailValid function
    }
    // password correct format
    else if (!isPasswordValid(password_registered)) {
      // print out the errors from the isPasswordValid function
    }
    // password and password repeat match
    else if (!isRepeatMatching(password_repeat_encrypted, password_registered_encrypted)) {
      // print out the errors from isRepeatMatching function
    }
    // validate full name
    else if (!(isNameValid(full_name_registered))) {
      // print out the errors from isNameValid function
    }
    else {
      // if all functions are still true, meaning that there are no errors, set errors to zero and add user to the user_reg_data
      errors = 0;
    }
  }
  else {
    errors.registered = `This email is already in use. Please go to the login page.`;
  }

  // if errors, send back to registration
  if (Object.keys(errors).length !== 0) {
    // change errors object into proper format to be added to query
    params.append('errors', (JSON.stringify(errors)));
    params.append('email', request.body.email);
    params.append('name', request.body.full_name)
    // Used ChatGPT for server-side code to find a way to include the email and full name into the query string so that the fields stay sticky when there are errors. add the hasErrors=true to connect to the registration.html. add errorParams to access errors from registration client-side processing
    response.redirect(`./registration.html?${params.toString()}`);
  }
  else {
    // data valid, so add new user to the user_reg_data
    let new_email = email_registered;
    user_reg_data[new_email] = {};
    user_reg_data[new_email].name = full_name_registered;
    user_reg_data[new_email].password = password_registered_encrypted;
    console.log(user_reg_data)
    // save data to user_data_file
    fs.writeFileSync(user_data_file, JSON.stringify(user_reg_data));
    params.append('email', (request.body.email));
    response.redirect(`./invoice.html?${params.toString()}`)
  }

});

// A micro-service to process the product quantities from the form data
// redirect to invoice if quantities are valid, otherwise redirect back to products_display
app.post('/process_purchase_form', function (req, res, next) {
  // only process if purchase form submitted
  const errors = {}; // assume no errors to start
  let quantities = [];
  if (typeof req.body['quantity_textbox'] != 'undefined') {
    quantities = req.body['quantity_textbox'];
    // validate that all quantities are good
    for (let i in quantities) {
      if (!isNonNegInt(quantities[i])) {
        errors['quantity' + i] = isNonNegInt(quantities[i], true);
      }
      // validate the quantity requested is less than or equal to the quantity available. Add to errors object if not.
      // Don't want a customer to purchase more than we have available to sell.
      if (quantities[i] > products[i].quantity_available && errors['quantity' + i] != undefined) {
        errors['quantity' + i].push(' Exceeds quantity available!');
      }
      // if array has not been created (it is undefined) create the array and assign it the error message for exceeding quantity
      if (quantities[i] > products[i].quantity_available && errors['quantity' + i] === undefined) {
        errors['quantity' + i] = ['Exceeds quantity available!'];
      }

    }
    // Check the quantities array has at least one value greater than 0 (i.e. something was purchased). Add to errors object if not.
    // assume all values are zero to begin with
    let containsNonZeroQuantity = false;
    // loop through value of quantity textbox to see if there is a non-zero value (something purchased)
    for (i = 0; i < req.body.quantity_textbox.length; i++) {
      // request the body content of the quantitiy_textbox[i] and change into a number to see if it is greater than or less than 0, or if it is not a number
      if (parseInt(req.body.quantity_textbox[i]) > 0 || parseInt(req.body.quantity_textbox[i]) < 0 || isNaN(parseInt(req.body.quantity_textbox[i]))) {
        // if it is greater than or less than 0, it changes containsNonZeroQuantity to true . Also want it to change to true if it is not a number because it should deploy the "Not a number!" error instead
        containsNonZeroQuantity = true;
        // exit once find a non zero quantity (at least one thing)
        break;
      }
    }
    // check if containsNonZeroQuantity is false because if it still equals false then all of the quantity_textbox values are equal to zero (meaning nothing was purchased)
    if (!containsNonZeroQuantity) {
      // add error message to each box when there are no Non-zero values. can assign it straight to the errors[quantity+i] array because if all values 0 then no other errors should be displaying
      for (let i = 0; i < req.body.quantity_textbox.length; i++) {
        errors['quantity' + i] = ['Please purchase an item.'];
      }
    }
  }
  console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
  // create a query string with data from the form
  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));
  console.log(req.query);

  // If there are errors, send user back to fix otherwise send to invoice
  if (Object.keys(errors).length > 0) {
    // Have errors, redirect back to store where errors came from to fix and try again
    params.append('errors', JSON.stringify(errors));
    res.redirect('store.html?' + params.toString());
  } else {
    /* TBD!!! move this to just before going to invoice
    // Reduce the quantities of each product purchased from the quantities available
    for (let i in quantities) {
      // subtract quantities purchased from quantities available and assign remaining amount to the value of quantity available. This can be used to ensure that the store always has the correct quantity available showing even after a customer buys something. 
      products[i].quantity_available -= quantities[i];
    }
    */
    res.redirect('./login.html?' + params.toString());
  };
});

app.post('/process_confirmation_form', function (req, res, next) {
    // Get quantities from the query string
    if ('quantities' in req.query) {
      let quantity_purchased_json = JSON.parse(req.query.quantities);
      // reduce inventory
  for (let i = 0; i < products.length; i++) {
    // subtract quantities purchased from quantities available and assign remaining amount to the value of quantity available. This can be used to ensure that the store always has the correct quantity available showing even after a customer buys something. 
    products[i].quantity_available -= Number(quantity_purchased_json[i]);
  }
    }
    // redirect to store.html with no query strings so user's email and quantities are not saved
    console.log(req.query)
    res.redirect(`./store.html`)
})

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));


function isNonNegInt(q, returnErrors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
  else {
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
  }
  return returnErrors ? errors : (errors.length == 0);
}