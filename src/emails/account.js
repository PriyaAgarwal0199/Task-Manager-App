const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async (to,name,subject,context)=>{
    try{
    let text;
    if(context === "welcome")
    text = `Welcome to the app, ${name}. Let me know how you get along with the app.`
    else if(context==="remove account")
    text = `It's sad to see you go ${name}, can you please tell us what made you come to this decision and how can we further improve? I hope to see you back sometime soon.`
    await sgMail.send({
        to: to,
        from:'peehuagarwal0199@gmail.com',
        subject: subject,
        text: text
    })
    }
    catch(e){
        console.log(`email didn't sent to ${name}`)
    }
    }
    
   

module.exports = sendEmail