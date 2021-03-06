$(window).load(function() {
    $(document).on('click', 'a[href^="#"]', function(e) {
	    // target element id
	    var id = $(this).attr('href');

	    // target element
	    var $id = $(id);
	    if ($id.length === 0) {
	        return;
	    }

	    // prevent standard hash navigation (avoid blinking in IE)
	    e.preventDefault();

	    // top position relative to the document
	    var pos = $(id).offset().top;

	    // animated top scrolling
	    $('body, html').animate({scrollTop: pos});
	});

    $('div.header-cta input, div.footer-cta input').focus(function(){
    	$('div.error').hide();
    });

    $('div.header-cta button').click(function() {
    	var email = $('div.cta input').val();
    	if(!openRecaptcha(email)){
    		$('div.header-cta div.error').show();
    	}
    });
    $('div.footer-cta button').click(function() {
    	var email = $('div.footer-cta input').val();
    	if(!openRecaptcha(email)){
    		$('div.footer-cta div.error').show();
    	}
    });
});

function openRecaptcha(email){
	if(validateEmail(email)){
        vex.open({
            content: '<div id="recaptcha"></div>',
            afterOpen: function($vexContent) {
                grecaptcha.render('recaptcha', {
                    'sitekey': '6LecVAUTAAAAAGgaNGZ1SiXbU6WvCGkcEQUZrrFk',
                    'callback': recaptchaVerify
                });
            },
            className: 'vex-theme-bottom-right-corner'
        });
        return true;
	}else
		return false;
}

function validateEmail(email) {
    var re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    return re.test(email);
}


function recaptchaVerify(response) {
    var contactFormHost = 'https://splense-contact.herokuapp.com/';
    var footerEmailValue = $('div.footer-cta input').val();
    var headerEmailValue = $('div.cta input').val();
    var email = headerEmailValue;
    if (!headerEmailValue.trim()) {
        email = footerEmailValue;
    }
    $.ajax({
        type: 'POST',
        url: contactFormHost + 'register_email',
        contentType: 'application/json',
        data: JSON.stringify({
            email: email,
            recaptcha_response: response
        }),
        dataType: 'json',
        success: function(response) {
            switch (response.message) {
                case 'success':
                    vex.close();
                    break;

                case 'failure_captcha':
                	alert("recaptcha failed");
                    break;

                case 'failure_email':
                	alert("failed to send email");
                	break;
            }
        },
        error: function(xhr, ajaxOptions, thrownError) {
        	console.log(thrownError);
        }
    });
}
