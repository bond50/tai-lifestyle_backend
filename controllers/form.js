import sgMail from "@sendgrid/mail"; // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export function contactForm(req, res) {
    const {email, name, subject, message} = req.body;
    console.log(subject)

    const emailData = {
        to: process.env.EMAIL_TO,
        from: process.env.EMAIL_TO,
        subject: `${subject}`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />

            <p><strong>This email may contain sensetive information</strong></p>
            <p>https://tailifestyle.com</p>
        `,
    };

    sgMail.send(emailData).then((sent) => {
        return res.json({
            success: true,
        });
    });
}

export function contactBlogAuthorForm(req, res) {
    const {authorEmail, email, name, subject, message} = req.body;
    // console.log(req.body);
    let mailList = [authorEmail, process.env.EMAIL_TO];

    const emailData = {

        to: mailList,
        from: process.env.EMAIL_TO,
        subject: `${subject} (${process.env.APP_NAME})`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Message received from:</h4>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://tailifestyle.com</p>
        `,
    };

    sgMail.send(emailData).then((sent) => {
        return res.json({
            success: true,
        });
    });
}
