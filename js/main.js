$(window).load(function () {

    // Animate scrolling sections
    $(document).on('click', 'a[href^="#"]', function (e) {
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
        $('body, html').animate({ scrollTop: pos });
    });

    // Hide errors when input is focused
    $('div.header-cta input, div.footer-cta input').focus(function () {
        $('div.error').hide();
        $('div.success').hide();
    });

    // Register email from Header
    const headerCTAHandler = CTAonClick.bind(this, "div.header-cta");
    $('div.header-cta button').click(headerCTAHandler);

    // Register email from footer
    const footerCTAHandler = CTAonClick.bind(this, "div.footer-cta");
    $('div.footer-cta button').click(footerCTAHandler);
});

function showLoadingButton(selector) {
    $(selector).text('');
    $(selector).addClass('button--loading');
    $(selector).attr('disabled', true);
}

function showNormalButton(selector) {
    $(selector).text('tell me more');
    $(selector).removeClass('button--loading');
    $(selector).attr('disabled', false);
}


function CTAonClick(ctaSelector, e) {
    e.preventDefault();

    const inputselector = `${ctaSelector} input`;
    const errorElementSelector = `${ctaSelector} div.error`;
    const successElementSelector = `${ctaSelector} div.success`;
    const buttonSelector = `${ctaSelector} button`;

    const email = document.querySelector(inputselector).value.trim();
    const re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    const isEmailValid = re.test(email.trim());

    if (!isEmailValid) {
        $(errorElementSelector).show();
        return;
    }
    showLoadingButton(buttonSelector);

    grecaptcha.ready(function () {
        grecaptcha.execute('6LctwKAeAAAAAKO9szhKeJmCCvPPcXguJ11EumRg', { action: 'submit' }).then(function (token) {
            recaptchaVerify(token, email.trim()).then((result) => {
                if (result.status === Status.SUCCESS) {
                    $(successElementSelector).show();
                }
                if (result.status === Status.FAILURE) {
                    console.log("Email Registration Failed", { message: result.message })
                }
                showNormalButton(buttonSelector);
            });
        })
    })
}


const Status = {
    SUCCESS: "success",
    FAILURE: "failure",
}

function recaptchaVerify(token, email) {
    const requestURL = 'https://splense-contact.herokuapp.com/register_email';
    const request = new Request(requestURL, {
        method: 'POST', body: JSON.stringify({
            email,
            token
        })
    });
    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                return { status: Status.FAILURE, message: "Incorrect Response" }
            }
        })
        .then(response => {
            if (response.status === Status.SUCCESS) {
                return { status: Status.SUCCESS, message: response.message };
            } else {
                throw Error(response.message);
            }
        }).catch(error => {
            return { status: Status.FAILURE, message: `${error.message}` }
        });
}
