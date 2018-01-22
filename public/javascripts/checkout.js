//this runs on the frontend for stripe
Stripe.setPublishableKey('pk_test_18r9q66hWA4M38C7Sw2AXOoG'); //set the stripe key

var $form = $('#checkout-form'); //get the form at checkout.js

$form.submit(function(event){ //whenever the form at checkout.js is submitted
    $('#payment-errors').addClass('hidden'); //this makes the span go away if we try the second time
  $form.find('button').prop('disabled', true); //find button and set to disabled so that user cannot resubmit form during payment processing
  //create the stripe token
  Stripe.card.createToken({
    number: $('#card-number').val(), //since we using ids use # to get fields
    cvc: $('#card-cvc').val(),
    exp_month: $('#card-expiry-month').val(),
    exp_year: $('#card-expiry-year').val(),
    name: $('#card-name').val()
  }, stripeResponseHandler); //stripeResponseHandler function is called after token is created
  return false; //dont submit to server yet
});

function stripeResponseHandler(status,response){
  //if error
  if(response.error){
    $('#payment-errors').text(response.error.message); //display the error on view we dont do form.find since its outside of the form
    $('#payment-errors').removeClass('hidden'); //initially its hidden so we make it visible
    $form.find('button').prop('disabled', false); //re-enable the button for user to make changes
  }else{
    //get the token id
    var token = response.token;

    //insert token into the form so that it gets submitted to server;
    $form.append($(`<input type="hidden" name="stripeToken"/>`).val(token));
    //make a hidden input field and insert the value in there

    //submit the form
    $form.get(0).submit();
  }
}
