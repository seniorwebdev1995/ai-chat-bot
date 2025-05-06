const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const userService = require("./user.service");
const User = require("../models/user.model");
const { updateNewsletterSubscribe } = require("./newsletter.service");
const Template = require("../models/template.model");
const postModel = require("../models/post.model");
const commentModel = require("../models/comment.model");
const { formatMongoDBDate, truncateString } = require("../utils/helperFunc");

const verificationCode = (length) => {
  let result = "";
  const characters = "0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 *
 * @param {flag} 0: send verification code, ,3: Send News letter, other : send invitation email
 * @returns
 */
// const deliverEmail = async ({
//   email,
//   flag,
//   message = "",
//   user_name = null,
// }) => {
//   console.log("userEmail----", email);
//   const mailgun = new Mailgun(formData);
//   const mg = mailgun.client({
//     username: "api",
//     key: process.env.MAILGUN_API_KEY || "",
//   });
//   const v_code = verificationCode(6);
//   let messageData;
//   try {
//     if (flag === 0) {
//       messageData = {
//         from: "RCPC AI TEAM <noreply@rcpilots.ai> ",
//         to: email,
//         subject: "Welcome to RCPC AI",
//         text: `Your verification code is ${v_code}.`,
//       };
//       const user = await userService.getUserByEmail(email);
//       console.log("vcode sent -----------");
//       await userService.updateUserById(user.id, { v_code });
//     } else if (flag === 1) {
//       messageData = {
//         from: "RCPC AI TEAM <RCPC@rcpilots.ai>",
//         to: email,
//         subject: `${user_name} has invited you to join the RCPC.ai community!`,
//         text: `You are invited : ${message}.`,
//         html: `<html>Message from ${user_name}:<br/><br/> ${message} <br/><br/> Message from  <a href='https://www.rcpilots.ai'> RCPC.ai</a> team: <br/><br/> You've been invited to join  <a href='https://www.rcpilots.ai'> RCPC.ai</a>, a dynamic and growing community dedicated to fixed-wing RC plane enthusiasts! ${user_name}, a fellow pilot and member of  <a href='https://www.rcpilots.ai'> RCPC.ai</a>, thought you’d be a perfect fit for our sky-high adventures.<br/><br/>
//       What’s in store for you at  <a href='https://www.rcpilots.ai'> RCPC.ai</a>?
//       <ul style=" margin: 2px 0px 2px -20px; !important">
//         <li>Connect with a network of passionate RC pilots across Canada.</li>
//         <li>Access a wealth of resources, from AI-driven tutorials to expert tips.</li>
//         <li>Engage in discussions, share stories, and exchange ideas in our vibrant forums.</li>
//         <li>Shape the future of this platform with your insights and experiences.</li>
//       </ul>
//       Ready to embark on this exciting journey? Simply click the link below to accept the invitation and start exploring the world of  <a href='https://www.rcpilots.ai'> RCPC.ai</a>.
//       It's time to let your RC passions soar!
//       <br/><br/>
//       Accept Invitation
//       <br/><br/>
//       We can’t wait to welcome you aboard and see how you’ll contribute to the diverse tapestry of our community.</br>
//       Happy landings, The  <a href='https://www.rcpilots.ai'> RCPC.ai</a> Team <br/><br/>  P.S. The sky’s the limit when we fly together. Join us, and let's make  <a href='https://www.rcpilots.ai'> RCPC.ai</a> the ultimate haven for RC pilots! 🌟</html>`,
//       };
//     } else if (flag === 3) {
//       const templates = await Template.find({ selected: true }).populate({
//         path: "messages",
//         populate: {
//           path: "userId",
//           model: "User",
//         },
//       });
//       const users = await User.find();
//       const posts = await postModel.find();
//       const comments = await commentModel.find();

//       console.log(
//         "totalMembers : ",
//         templates[0].messages[0].userId[0].full_name
//       );

//       let postTableRows = ``;
//       for (let i = 0; i < templates[0].messages.length; i++) {
//         if (i % 2 == 0) postTableRows += `<tr>`;
//         postTableRows += `
//                 <td valign="top" width="50%" style="
//                 mso-table-lspace: 0;
//                 mso-table-rspace: 0;
//                 padding-top: 20px;
//                 ">
//                     <table role="presentation" cellspacing="0" cellpadding="10" border="0" width="100%" style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                     ">
//                         <tbody>
//                         <tr>
//                             <td style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     ">
//                             <img src="https://www.rcpilots.ai/backend/images/blog-${
//                               (i % 4) + 1
//                             }.jpg" alt="" style="
//                                     -ms-interpolation-mode: bicubic;
//                                     display: block;
//                                     height: auto;
//                                     margin: auto;
//                                     max-width: 600px;
//                                     width: 100%;
//                                     " height=" auto" width=" 100%">
//                             </td>l
//                         </tr>
//                         <tr>
//                             <td class="text-services" style="
//                                     padding: 10px 10px 0;
//                                     text-align: left;
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     " align=" left">
//                             <p class="meta" style="
//                                     font-size: 14px;
//                                     text-transform: uppercase;
//                                     ">
//                                 <span>${formatMongoDBDate(
//                                   templates[0].messages[i].createdAt
//                                 )}</span>
//                             </p>
//                             <h3 style="
//                                     color: #000;
//                                     font-family: 'Nunito Sans',
//                                     sans-serif;
//                                     margin-top: 0;
//                                     font-size: 16px;
//                                     font-weight: 600;
//                                     "> ${templates[0].messages[i].content} </h3>
//                            <p>Posted by ${
//                              templates[0].messages[0].userId[0].full_name
//                            }</p>
//                             <p>
//                                 <a href="https://www.rcpilots.ai/news" class="btn btn-primary" style="
//                                     text-decoration: none;
//                                     display: inline-block;
//                                     padding: 5px 15px;
//                                     background: #f5564e;
//                                     border-radius: 5px;
//                                     color: #fff;
//                                     ">Read more</a>
//                             </p>
//                             </td>
//                         </tr>
//                         </tbody>
//                     </table>
//                     </td>

//             `;
//         if (i % 2 == 1) postTableRows += `</tr>`;
//         else if (i == templates[0].messages.length - 1)
//           postTableRows += `</tr>`;
//       }

//       let newsTableRows = ``;
//       for (let j = 0; j < templates[0].news.length; j++) {
//         if (j % 2 == 0) newsTableRows += `<tr>`;
//         newsTableRows += `
//                 <td valign="top" width="50%" style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                         padding-top: 20px;
//                                                     ">
//                     <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="
//                                                                                 mso-table-lspace: 0;
//                                                                                 mso-table-rspace: 0;
//                                                                                 border-collapse: collapse;
//                                                                                 border-spacing: 0;
//                                                                                 margin: 0 auto;
//                                                                                 table-layout: fixed;
//                                                                             ">
//                         <tbody>
//                         <tr>
//                             <td class="text-testimony" style="
//                                                                                         mso-table-lspace: 0;
//                                                                                         mso-table-rspace: 0;
//                                                                                     ">
//                             <h3 class="name" style="
//                                                                                             color: #000;
//                                                                                             font-family: 'Nunito Sans',
//                                                                                                 sans-serif;
//                                                                                             margin-top: 0;
//                                                                                             margin: 0;
//                                                                                         ">${
//                                                                                           templates[0]
//                                                                                             .news[
//                                                                                             j
//                                                                                           ]
//                                                                                             .title
//                                                                                         }</h3>
//                             <span class="position" style="
//                                                                                             color: rgba(
//                                                                                                 0,
//                                                                                                 0,
//                                                                                                 0,
//                                                                                                 0.3
//                                                                                             );
//                                                                                         ">${
//                                                                                           templates[0]
//                                                                                             .news[
//                                                                                             j
//                                                                                           ]
//                                                                                             .date
//                                                                                         }</span>
//                             <p>${truncateString(
//                               templates[0].news[j].description,
//                               150
//                             )}</p>
//                             <a href="${
//                               templates[0].news[j].url
//                             }">${truncateString(
//           templates[0].news[j].url,
//           60
//         )}</a>
//                             </td>
//                         </tr>
//                         </tbody>
//                     </table>
//                     </td>
//             `;
//         if (j % 2 == 1) newsTableRows += `</tr>`;
//         else if (j == templates[0].news.length - 1) newsTableRows += `</tr>`;
//       }

//       messageData = {
//         from: "RCPC AI TEAM <RCPC@rcpilots.ai>",
//         to: email,
//         subject: `RCPC.ai Monthly News Letter`,
//         text: `RCPC.ai Monthly News Letter`,
//         html: `

// <!DOCTYPE html>
// <html
//     lang="en"
//     xmlns="http://www.w3.org/1999/xhtml"
//     xmlns:v="urn:schemas-microsoft-com:vml"
//     xmlns:o="urn:schemas-microsoft-com:office:office"
//     style="
//         background: #f1f1f1;
//         height: 100%;
//         margin: 0 auto;
//         padding: 0;
//         width: 100%;
//     "
//     height="100%"
//     width="100%"
// >
//     <head>
//         <meta charset="utf-8" />
//         <!-- utf-8 works for most cases -->
//         <meta name="viewport" content="width=device-width" />
//         <!-- Forcing initial-scale shouldn't be necessary -->
//         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//         <!-- Use the latest (edge) version of IE rendering engine -->
//         <meta name="x-apple-disable-message-reformatting" />
//         <!-- Disable auto-scale in iOS 10 Mail entirely -->
//         <title></title>
//         <!-- The title tag shows in email notifications, like Android 4.4. -->

//         <!-- CSS Reset : BEGIN -->
//         <style>
//             div[style*="margin: 16px 0"] {
//                 margin: 0;
//             }
//             @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
//                 u ~ div .email-container {
//                     min-width: 320px;
//                 }
//             }
//             @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
//                 u ~ div .email-container {
//                     min-width: 375px;
//                 }
//             }
//             @media only screen and (min-device-width: 414px) {
//                 u ~ div .email-container {
//                     min-width: 414px;
//                 }
//             }
//         </style>

//         <!-- CSS Reset : END -->

//         <!-- Progressive Enhancements : BEGIN -->
//         <style>
//             .heading-section .subheading::after {
//                 position: absolute;
//                 left: 0;
//                 right: 0;
//                 bottom: -10px;
//                 content: "";
//                 width: 100%;
//                 height: 2px;
//                 background: #f5564e;
//                 margin: 0 auto;
//             }
//             @media screen and (max-width: 500px) {
//                 .icon {
//                     text-align: left;
//                 }
//                 .text-services {
//                     padding-left: 0;
//                     padding-right: 20px;
//                     text-align: left;
//                 }
//             }
//         </style>
//     </head>

//     <body
//         width="100%"
//         style="
//             background: #f1f1f1;
//             color: rgba(0, 0, 0, 0.4);
//             font-family: 'Nunito Sans', sans-serif;
//             font-size: 15px;
//             font-weight: 400;
//             line-height: 1.8;
//             height: 100%;
//             margin: 0;
//             padding: 0 !important;
//             width: 100%;
//             background-color: #222;
//             mso-line-height-rule: exactly;
//         "
//         height="100%"
//         bgcolor="#222222"
//     >
//         <center style="width: 100%; background-color: #f1f1f1">
//             <div
//                 style="
//                     display: none;
//                     font-size: 1px;
//                     max-height: 0px;
//                     max-width: 0px;
//                     opacity: 0;
//                     overflow: hidden;
//                     mso-hide: all;
//                     font-family: sans-serif;
//                 "
//             ></div>
//             <div
//                 style="max-width: 600px; margin: 0 auto"
//                 class="email-container"
//             >
//                 <!-- BEGIN BODY -->
//                 <table
//                     align="center"
//                     role="presentation"
//                     cellspacing="0"
//                     cellpadding="0"
//                     border="0"
//                     width="100%"
//                     style="
//                         mso-table-lspace: 0;
//                         mso-table-rspace: 0;
//                         border-collapse: collapse;
//                         border-spacing: 0;
//                         margin: auto;
//                         table-layout: fixed;
//                     "
//                 >
//                     <tr>
//                         <td
//                             valign="top"
//                             style="
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
//                                 background: #fff;
//                                 padding: 1em 2.5em;
//                             "
//                         >
//                             <table
//                                 role="presentation"
//                                 border="0"
//                                 cellpadding="0"
//                                 cellspacing="0"
//                                 width="100%"
//                                 style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                 "
//                             >
//                                 <tr>
//                                     <td
//                                         width="40%"
//                                         class="logo"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             text-align: left;
//                                         "
//                                         align="left"
//                                     >
//                                         <h1
//                                             style="
//                                                 color: #000;
//                                                 font-family: 'Nunito Sans',
//                                                     sans-serif;
//                                                 margin-top: 0;
//                                                 margin: 0;
//                                             "
//                                         >
//                                             <a
//                                                 style="
//                                                     text-decoration: none;
//                                                     color: #ff4b55;
//                                                     font-family: 'Nunito Sans',
//                                                         sans-serif;
//                                                     font-size: 20px;
//                                                     font-weight: 700;
//                                                     text-transform: uppercase;
//                                                 "
//                                                 href="https://www.rcpilots.ai/"
//                                                 >RCPC.ai</a
//                                             >
//                                         </h1>
//                                     </td>
//                                     <td
//                                         width="60%"
//                                         class="logo"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             text-align: right;
//                                         "
//                                         align="right"
//                                     >
//                                         <ulstyle>
//                                             <!-- <li><a href="#">Home</a></li>
// 			            	<li><a href="#">About</a></li>
// 			            	<li><a href="#">Works</a></li>
// 			            	<li><a href="#">Blog</a></li> -->
//                                             <li
//                                                 style="
//                                                     list-style: none;
//                                                     display: inline-block;
//                                                     margin-left: 5px;
//                                                     font-size: 12px;
//                                                     font-weight: 700;
//                                                     text-transform: uppercase;
//                                                 "
//                                             >
//                                                 <a
//                                                     href="https://www.rcpilots.ai/contactus"
//                                                     style="
//                                                         text-decoration: none;
//                                                         color: rgba(
//                                                             0,
//                                                             0,
//                                                             0,
//                                                             0.6
//                                                         );
//                                                     "
//                                                     >Contact us</a
//                                                 >
//                                             </li>
//                                         </ulstyle>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                     <!-- end tr -->
//                     <tr>
//                         <td
//                             valign="middle"
//                             style="
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
//                                 background-image: url(https://www.rcpilots.ai/backend/images/bg_1.jpg);
//                                 background-size: cover;
//                                 height: 400px;
//                                 position: relative;
//                                 z-index: 0;
//                             "
//                             height="400"
//                         >
//                             <div style="position: absolute"></div>
//                             <table
//                                 style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                 "
//                             >
//                                 <tr>
//                                     <td
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                         "
//                                     >
//                                         <div
//                                             class="text"
//                                             style="text-align: center"
//                                         >
//                                             <h2
//                                                 class="text-red"
//                                                 style="
//                                                     color: #fff;
//                                                     font-family: 'Nunito Sans',
//                                                         sans-serif;
//                                                     margin-top: 0;
//                                                     font-size: 40px;
//                                                     font-weight: 900;
//                                                     line-height: 1.2;
//                                                     margin-bottom: 0;
//                                                 "
//                                             >
//                                                 Jan, 2024
//                                             </h2>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                     <!-- end tr -->
//                     <tr>
//                         <td
//                             class=" "
//                             style="
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
//                                 background: #ff4b55;
//                                 padding: 2.5em;
//                                 text-align: center;
//                             "
//                             align="center"
//                         >
//                             <div
//                                 class="heading-section heading-section-white"
//                                 style="color: rgba(255, 255, 255, 0.8)"
//                             >
//                                 <h2
//                                     style="
//                                         color: #fff;
//                                         font-family: 'Nunito Sans', sans-serif;
//                                         margin-top: 0;
//                                         font-size: 24px;
//                                         font-weight: 700;
//                                         line-height: 1.4;
//                                         padding-bottom: 0;
//                                     "
//                                 >
//                                     RCPC News Letter
//                                 </h2>
//                                 <p>
//                                     <a
//                                         href="https://www.rcpilots.ai"
//                                         style="text-decoration: none"
//                                     >
//                                         RCPC.ai</a
//                                     >
//                                     , a dynamic and growing community dedicated
//                                     to fixed-wing RC plane enthusiasts!
//                                 </p>
//                             </div>
//                         </td>
//                     </tr>
//                     <!-- end: tr -->

//                     <tr>
//                         <td
//                             class="bg_white"
//                             style="
//                                 background: #fff;
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
//                             "
//                         >
//                             <table
//                                 role="presentation"
//                                 cellspacing="0"
//                                 cellpadding="0"
//                                 border="0"
//                                 width="100%"
//                                 style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                 "
//                             >
//                                 <tr>
//                                     <td
//                                         valign="middle"
//                                         class="counter"
//                                         style="
//                                             position: relative;
//                                             width: 100%;
//                                             z-index: 0;
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             /* background-image: url(https://www.rcpilots.ai/backend/images/bg_1.jpg); */
//                                             background-size: cover;
//                                             padding: 4em 0;
//                                         "
//                                         width="100%"
//                                     >
//                                         <div
//                                             class="heading-section"
//                                             style="
//                                                 text-align: center;
//                                                 padding: 0 30px;
//                                             "
//                                         >
//                                             <h2
//                                                 style="
//                                                     color: #000;
//                                                     font-family: 'Nunito Sans',
//                                                         sans-serif;
//                                                     margin-top: 0;
//                                                     font-size: 24px;
//                                                     font-weight: 700;
//                                                     line-height: 1.4;
//                                                 "
//                                             >
//                                                 Community Statistics
//                                             </h2>
//                                             <p style="color : gray;">
//                                                 Discover the pulse of our
//                                                 vibrant community through
//                                                 insightful statistics that
//                                                 showcase our collective
//                                                 achievements, engagement, and
//                                                 growth.
//                                             </p>
//                                         </div>
//                                         <!-- <div
//                                             class="overlay"
//                                             style="
//                                                 background: #000;
//                                                 bottom: 0;
//                                                 content: '';
//                                                 left: 0;
//                                                 opacity: 0.3;
//                                                 position: absolute;
//                                                 right: 0;
//                                                 top: 0;
//                                                 width: 100%;
//                                                 z-index: -1;
//                                             "
//                                             width="100%"
//                                         ></div> -->
//                                         <table
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <tr>
//                                                 <td
//                                                     valign="middle"
//                                                     width="33.333%"
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                     "
//                                                 >
//                                                     <table
//                                                         role="presentation"
//                                                         cellspacing="0"
//                                                         cellpadding="0"
//                                                         border="0"
//                                                         width="100%"
//                                                         style="
//                                                             mso-table-lspace: 0;
//                                                             mso-table-rspace: 0;
//                                                             border-collapse: collapse;
//                                                             border-spacing: 0;
//                                                             margin: 0 auto;
//                                                             table-layout: fixed;
//                                                         "
//                                                     >
//                                                         <tr>
//                                                             <td
//                                                                 class="counter-text"
//                                                                 style="
//                                                                     text-align: center;
//                                                                     mso-table-lspace: 0;
//                                                                     mso-table-rspace: 0;
//                                                                 "
//                                                                 align="center"
//                                                             >
//                                                                 <span
//                                                                     class="num"
//                                                                     style="
//                                                                         /* color: #fff; */
//                                                                         display: block;
//                                                                         font-size: 34px;
//                                                                         font-weight: 700;
//                                                                         color: #000;
//                                                                     "
//                                                                     >${users.length}</span
//                                                                 >
//                                                                 <span
//                                                                     class="name"
//                                                                     style="
//                                                                         color: #000;
//                                                                         display: block;
//                                                                         font-size: 13px;
//                                                                     "
//                                                                     >Total
//                                                                     Members</span
//                                                                 >
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                                 <td
//                                                     valign="middle"
//                                                     width="33.333%"
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                     "
//                                                 >
//                                                     <table
//                                                         role="presentation"
//                                                         cellspacing="0"
//                                                         cellpadding="0"
//                                                         border="0"
//                                                         width="100%"
//                                                         style="
//                                                             mso-table-lspace: 0;
//                                                             mso-table-rspace: 0;
//                                                             border-collapse: collapse;
//                                                             border-spacing: 0;
//                                                             margin: 0 auto;
//                                                             table-layout: fixed;
//                                                         "
//                                                     >
//                                                         <tr>
//                                                             <td
//                                                                 class="counter-text"
//                                                                 style="
//                                                                     text-align: center;
//                                                                     mso-table-lspace: 0;
//                                                                     mso-table-rspace: 0;
//                                                                 "
//                                                                 align="center"
//                                                             >
//                                                                 <span
//                                                                     class="num"
//                                                                     style="
//                                                                         color: #000;
//                                                                         display: block;
//                                                                         font-size: 34px;
//                                                                         font-weight: 700;
//                                                                     "
//                                                                     >${posts.length}</span
//                                                                 >
//                                                                 <span
//                                                                     class="name"
//                                                                     style="
//                                                                         color: #000;
//                                                                         display: block;
//                                                                         font-size: 13px;
//                                                                     "
//                                                                     >Posts</span
//                                                                 >
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                                 <td
//                                                     valign="middle"
//                                                     width="33.333%"
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                     "
//                                                 >
//                                                     <table
//                                                         role="presentation"
//                                                         cellspacing="0"
//                                                         cellpadding="0"
//                                                         border="0"
//                                                         width="100%"
//                                                         style="
//                                                             mso-table-lspace: 0;
//                                                             mso-table-rspace: 0;
//                                                             border-collapse: collapse;
//                                                             border-spacing: 0;
//                                                             margin: 0 auto;
//                                                             table-layout: fixed;
//                                                         "
//                                                     >
//                                                         <tr>
//                                                             <td
//                                                                 class="counter-text"
//                                                                 style="
//                                                                     text-align: center;
//                                                                     mso-table-lspace: 0;
//                                                                     mso-table-rspace: 0;
//                                                                 "
//                                                                 align="center"
//                                                             >
//                                                                 <span
//                                                                     class="num"
//                                                                     style="
//                                                                         color: #000;
//                                                                         display: block;
//                                                                         font-size: 34px;
//                                                                         font-weight: 700;
//                                                                     "
//                                                                     >${comments.length}</span
//                                                                 >
//                                                                 <span
//                                                                     class="name"
//                                                                     style="
//                                                                         color: #000;
//                                                                         display: block;
//                                                                         font-size: 13px;
//                                                                     "
//                                                                     >Comments
//                                                                     and
//                                                                     Discussions</span
//                                                                 >
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td
//                                         class="bg_white"
//                                         style="
//                                             background: #fff;
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             padding: 2.5em;
//                                         "
//                                     >
//                                         <div
//                                             class="heading-section"
//                                             style="
//                                                 text-align: center;
//                                                 padding: 0 30px;
//                                             "
//                                         >
//                                             <h2
//                                                 style="
//                                                     color: #000;
//                                                     font-family: 'Nunito Sans',
//                                                         sans-serif;
//                                                     margin-top: 0;
//                                                     font-size: 24px;
//                                                     font-weight: 700;
//                                                     line-height: 1.4;
//                                                 "
//                                             >
//                                                 Best Posts along community
//                                             </h2>
//                                             <p style="color : gray;">
//                                                 Check best Posts along community
//                                                 members in this month.
//                                             </p>
//                                         </div>
//                                         <table
//                                             role="presentation"
//                                             border="0"
//                                             cellpadding="0"
//                                             cellspacing="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             ${postTableRows}
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <!-- end: tr -->
//                                 <tr>
//                                     <td
//                                         class="bg_light"
//                                         style="
//                                             background: #fafafa;
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             padding: 2.5em;
//                                         "
//                                     >
//                                         <div
//                                             class="heading-section"
//                                             style="
//                                                 text-align: center;
//                                                 padding: 0 30px;
//                                             "
//                                         >
//                                             <h2
//                                                 style="
//                                                     color: #000;
//                                                     font-family: 'Nunito Sans',
//                                                         sans-serif;
//                                                     margin-top: 0;
//                                                     font-size: 24px;
//                                                     font-weight: 700;
//                                                     line-height: 1.4;
//                                                 "
//                                             >
//                                                 Meet the news from RC World
//                                             </h2>
//                                             <p>
//                                                 Stay informed about the newest
//                                                 technologies, exciting events,
//                                                 and noteworthy developments that
//                                                 shape the RC world.
//                                             </p>
//                                         </div>
//                                         <table
//                                             role="presentation"
//                                             border="0"
//                                             cellpadding="10"
//                                             cellspacing="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                         <tbody>
//                                             ${newsTableRows}
//                                         </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <!-- end: tr -->
//                                 <!-- <tr>
//                                     <td
//                                         class="bg_white"
//                                         style="
//                                             background: #fff;
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             padding: 2.5em;
//                                             width: 100%;
//                                         "
//                                         width="100%"
//                                     >
//                                         <table
//                                             role="presentation"
//                                             border="0"
//                                             cellpadding="0"
//                                             cellspacing="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <!-- <tr> -->
//                                                 <!-- <td
//                                                     valign="middle"
//                                                     width="50%"
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                     "
//                                                 >
//                                                     <table
//                                                         role="presentation"
//                                                         cellspacing="0"
//                                                         cellpadding="0"
//                                                         border="0"
//                                                         width="100%"
//                                                         style="
//                                                             mso-table-lspace: 0;
//                                                             mso-table-rspace: 0;
//                                                             border-collapse: collapse;
//                                                             border-spacing: 0;
//                                                             margin: 0 auto;
//                                                             table-layout: fixed;
//                                                         "
//                                                     >
//                                                         <tr>
//                                                             <td
//                                                                 style="
//                                                                     mso-table-lspace: 0;
//                                                                     mso-table-rspace: 0;
//                                                                 "
//                                                             >
//                                                                 <img
//                                                                     src="https://www.rcpilots.ai/backend/images/bg_2.jpg"
//                                                                     alt=""
//                                                                     style="
//                                                                         -ms-interpolation-mode: bicubic;
//                                                                         display: block;
//                                                                         height: auto;
//                                                                         margin: auto;
//                                                                         max-width: 600px;
//                                                                         width: 100%;
//                                                                     "
//                                                                     height="auto"
//                                                                     width="100%"
//                                                                 />
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td> -->
//                                                 <!-- <td
//                                                     valign="middle"
//                                                     width="50%"
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                     "
//                                                 >
//                                                     <table
//                                                         role="presentation"
//                                                         cellspacing="0"
//                                                         cellpadding="0"
//                                                         border="0"
//                                                         width="100%"
//                                                         style="
//                                                             mso-table-lspace: 0;
//                                                             mso-table-rspace: 0;
//                                                             border-collapse: collapse;
//                                                             border-spacing: 0;
//                                                             margin: 0 auto;
//                                                             table-layout: fixed;
//                                                         "
//                                                     >
//                                                         <tr>
//                                                             <td
//                                                                 class="text-services"
//                                                                 style="
//                                                                     padding: 10px
//                                                                         10px 0;
//                                                                     text-align: left;
//                                                                     mso-table-lspace: 0;
//                                                                     mso-table-rspace: 0;
//                                                                     padding-left: 25px;
//                                                                 "
//                                                                 align="left"
//                                                             >
//                                                                 <div
//                                                                     class="heading-section"
//                                                                 >
//                                                                     <h2
//                                                                         style="
//                                                                             color: #000;
//                                                                             font-family: 'Nunito Sans',
//                                                                                 sans-serif;
//                                                                             margin-top: 0;
//                                                                             font-size: 24px;
//                                                                             font-weight: 700;
//                                                                             line-height: 1.4;
//                                                                         "
//                                                                     >
//                                                                         Upcoming
//                                                                         events
//                                                                     </h2>
//                                                                 </div>
//                                                                 <div
//                                                                     class="services-list"
//                                                                     style="
//                                                                         float: left;
//                                                                         margin: 0
//                                                                             0
//                                                                             10px
//                                                                             0;
//                                                                         padding: 0;
//                                                                         width: 100%;
//                                                                     "
//                                                                     width="100%"
//                                                                 >
//                                                                     <div
//                                                                         class="text"
//                                                                         style="
//                                                                             float: right;
//                                                                             width: 100%;
//                                                                         "
//                                                                         width="100%"
//                                                                     >
//                                                                         <h3
//                                                                             style="
//                                                                                 color: #000;
//                                                                                 font-family: 'Nunito Sans',
//                                                                                     sans-serif;
//                                                                                 margin-top: 0;
//                                                                                 font-size: 18px;
//                                                                                 font-weight: 600;
//                                                                                 margin-bottom: 0;
//                                                                             "
//                                                                         >
//                                                                             Feb
//                                                                             4th
//                                                                         </h3>
//                                                                         <p
//                                                                             style="
//                                                                                 margin: 0;
//                                                                             "
//                                                                         >
//                                                                             A
//                                                                             small
//                                                                             river
//                                                                             named
//                                                                             Duden
//                                                                             flows
//                                                                             by
//                                                                             their
//                                                                             place
//                                                                             and
//                                                                             supplies
//                                                                         </p>
//                                                                     </div>
//                                                                 </div>
//                                                                 <div
//                                                                     class="services-list"
//                                                                     style="
//                                                                         float: left;
//                                                                         margin: 0
//                                                                             0
//                                                                             10px
//                                                                             0;
//                                                                         padding: 0;
//                                                                         width: 100%;
//                                                                     "
//                                                                     width="100%"
//                                                                 >
//                                                                     <div
//                                                                         class="text"
//                                                                         style="
//                                                                             float: right;
//                                                                             width: 100%;
//                                                                         "
//                                                                         width="100%"
//                                                                     >
//                                                                         <h3
//                                                                             style="
//                                                                                 color: #000;
//                                                                                 font-family: 'Nunito Sans',
//                                                                                     sans-serif;
//                                                                                 margin-top: 0;
//                                                                                 font-size: 18px;
//                                                                                 font-weight: 600;
//                                                                                 margin-bottom: 0;
//                                                                             "
//                                                                         >
//                                                                             Feb
//                                                                             10th
//                                                                         </h3>
//                                                                         <p
//                                                                             style="
//                                                                                 margin: 0;
//                                                                             "
//                                                                         >
//                                                                             A
//                                                                             small
//                                                                             river
//                                                                             named
//                                                                             Duden
//                                                                             flows
//                                                                             by
//                                                                             their
//                                                                             place
//                                                                             and
//                                                                             supplies
//                                                                         </p>
//                                                                     </div>
//                                                                 </div>
//                                                                 <div
//                                                                     class="services-list"
//                                                                     style="
//                                                                         float: left;
//                                                                         margin: 0
//                                                                             0
//                                                                             10px
//                                                                             0;
//                                                                         padding: 0;
//                                                                         width: 100%;
//                                                                     "
//                                                                     width="100%"
//                                                                 >
//                                                                     <div
//                                                                         class="text"
//                                                                         style="
//                                                                             float: right;
//                                                                             width: 100%;
//                                                                         "
//                                                                         width="100%"
//                                                                     >
//                                                                         <h3
//                                                                             style="
//                                                                                 color: #000;
//                                                                                 font-family: 'Nunito Sans',
//                                                                                     sans-serif;
//                                                                                 margin-top: 0;
//                                                                                 font-size: 18px;
//                                                                                 font-weight: 600;
//                                                                                 margin-bottom: 0;
//                                                                             "
//                                                                         >
//                                                                             Feb
//                                                                             22th
//                                                                         </h3>
//                                                                         <p
//                                                                             style="
//                                                                                 margin: 0;
//                                                                             "
//                                                                         >
//                                                                             A
//                                                                             small
//                                                                             river
//                                                                             named
//                                                                             Duden
//                                                                             flows
//                                                                             by
//                                                                             their
//                                                                             place
//                                                                             and
//                                                                             supplies
//                                                                         </p>
//                                                                     </div>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     </table>
//                                                 </td> -->
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <!-- end: tr -->
//                             </table>
//                         </td>
//                     </tr>
//                     <!-- end:tr -->
//                     <!-- 1 Column Text + Button : END -->
//                 </table>
//                 <table
//                     align="center"
//                     role="presentation"
//                     cellspacing="0"
//                     cellpadding="0"
//                     border="0"
//                     width="100%"
//                     style="
//                         mso-table-lspace: 0;
//                         mso-table-rspace: 0;
//                         border-collapse: collapse;
//                         border-spacing: 0;
//                         margin: auto;
//                         table-layout: fixed;
//                     "
//                 >
//                     <tr>
//                         <td
//                             valign="middle"
//                             class="bg_black footer"
//                             style="
//                                 background: #000;
//                                 color: rgba(255, 255, 255, 0.5);
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
//                                 padding-top: 1em;
// 								padding-right: 2.5empx;
// 								padding-left: 2.5em;
//                             "
//                         >
//                             <table
//                                 style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                 "
//                             >
//                                 <tr>
//                                     <td
//                                         valign="top"
//                                         width="60%"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             padding-top: 20px;
//                                         "
//                                     >
//                                         <table
//                                             role="presentation"
//                                             cellspacing="0"
//                                             cellpadding="0"
//                                             border="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <tr>
//                                                 <td
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                         padding-right: 10px;
//                                                         text-align: left;
//                                                     "
//                                                     align="left"
//                                                 >
//                                                     <h3
//                                                         class="heading"
//                                                         style="
//                                                             color: #fff;
//                                                             font-family: 'Nunito Sans',
//                                                                 sans-serif;
//                                                             margin-top: 0;
//                                                             font-size: 20px;
//                                                         "
//                                                     >
//                                                         Enjoy RCPC with your friends
//                                                     </h3>
//                                                     <p>
//                                                                     <a
//                                                                         href="https://www.rcpilots.ai/profile/invite"
//                                                                         class="btn btn-primary"
//                                                                         style="
//                                                                             text-decoration: none;
//                                                                             display: inline-block;
//                                                                             padding: 5px
//                                                                                 15px;
//                                                                             background: #656161;
//                                                                             border-radius: 5px;
//                                                                             color: #000;

//                                                                         "
//                                                                         >Invite a Friend</a
//                                                                     >
//                                                                 </p>
//                                                     <ul
//                                                         class="social"
//                                                         style="
//                                                             padding: 0;
//                                                             margin: 0;
//                                                         "
//                                                     >
//                                                         <li
//                                                             style="
//                                                                 display: inline-block;
//                                                                 list-style: none;
//                                                                 margin-bottom: 10px;
//                                                             "
//                                                         >
//                                                             <img
//                                                                 src="images/002-play-button.png"
//                                                                 alt=""
//                                                                 style="
//                                                                     -ms-interpolation-mode: bicubic;
//                                                                     display: block;
//                                                                     height: auto;
//                                                                     max-width: 600px;
//                                                                     width: 30px;
//                                                                 "
//                                                                 height="auto"
//                                                                 width="30"
//                                                             />
//                                                         </li>
//                                                         <li
//                                                             style="
//                                                                 display: inline-block;
//                                                                 list-style: none;
//                                                                 margin-bottom: 10px;
//                                                             "
//                                                         >
//                                                             <img
//                                                                 src="images/002-play-button.png"
//                                                                 alt=""
//                                                                 style="
//                                                                     -ms-interpolation-mode: bicubic;
//                                                                     display: block;
//                                                                     height: auto;
//                                                                     max-width: 600px;
//                                                                     width: 30px;
//                                                                 "
//                                                                 height="auto"
//                                                                 width="30"
//                                                             />
//                                                         </li>
//                                                         <li
//                                                             style="
//                                                                 display: inline-block;
//                                                                 list-style: none;
//                                                                 margin-bottom: 10px;
//                                                             "
//                                                         >
//                                                             <img
//                                                                 src="images/002-play-button.png"
//                                                                 alt=""
//                                                                 style="
//                                                                     -ms-interpolation-mode: bicubic;
//                                                                     display: block;
//                                                                     height: auto;
//                                                                     max-width: 600px;
//                                                                     width: 30px;
//                                                                 "
//                                                                 height="auto"
//                                                                 width="30"
//                                                             />
//                                                         </li>
//                                                     </ul>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                     <td
//                                         valign="top"
//                                         width="40%"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                             padding-top: 20px;
//                                         "
//                                     >
//                                         <table
//                                             role="presentation"
//                                             cellspacing="0"
//                                             cellpadding="0"
//                                             border="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <tr>
//                                                 <td
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                         padding-left: 5px;
//                                                         padding-right: 5px;
//                                                         text-align: left;
//                                                     "
//                                                     align="left"
//                                                 >
//                                                     <h3
//                                                         class="heading"
//                                                         style="
//                                                             color: #fff;
//                                                             font-family: 'Nunito Sans',
//                                                                 sans-serif;
//                                                             margin-top: 0;
//                                                             font-size: 20px;
//                                                         "
//                                                     >
//                                                         Join RCPC now
//                                                     </h3>
//                                                      <p>
//                                                                     <a
//                                                                         href="https://www.rcpilots.ai/signup"
//                                                                         class="btn btn-primary"
//                                                                         style="
//                                                                             text-decoration: none;
//                                                                             display: inline-block;
//                                                                             padding: 5px
//                                                                                 15px;
//                                                                             background: #656161;
//                                                                             border-radius: 5px;
//                                                                             color: #000;

//                                                                         "
//                                                                         >Register</a
//                                                                     >
//                                                                 </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                     <!-- end: tr -->
//                     <tr>
//                         <td
//                             valign="middle"
//                             class="bg_black footer"
//                             style="
//                                 background: #000;
//                                 color: rgba(255, 255, 255, 0.5);
//                                 mso-table-lspace: 0;
//                                 mso-table-rspace: 0;
// 								padding-right: 2.5em;
// 								padding-left: 2.5em;
//                             "
//                         >
//                             <table
//                                 style="
//                                     mso-table-lspace: 0;
//                                     mso-table-rspace: 0;
//                                     border-collapse: collapse;
//                                     border-spacing: 0;
//                                     margin: 0 auto;
//                                     table-layout: fixed;
//                                 "
//                             >
//                                 <tr>
//                                     <td
//                                         valign="top"
//                                         width="33.333%"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                         "
//                                     >
//                                         <table
//                                             role="presentation"
//                                             cellspacing="0"
//                                             cellpadding="0"
//                                             border="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <tr>
//                                                 <td
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                         padding-right: 10px;
//                                                         text-align: left;
//                                                     "
//                                                     align="left"
//                                                 >
//                                                     <p>
//                                                         © 2024 RCPC.ai All
//                                                         Rights Reserved
//                                                     </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                     <td
//                                         valign="top"
//                                         width="33.333%"
//                                         style="
//                                             mso-table-lspace: 0;
//                                             mso-table-rspace: 0;
//                                         "
//                                     >
//                                         <table
//                                             role="presentation"
//                                             cellspacing="0"
//                                             cellpadding="0"
//                                             border="0"
//                                             width="100%"
//                                             style="
//                                                 mso-table-lspace: 0;
//                                                 mso-table-rspace: 0;
//                                                 border-collapse: collapse;
//                                                 border-spacing: 0;
//                                                 margin: 0 auto;
//                                                 table-layout: fixed;
//                                             "
//                                         >
//                                             <tr>
//                                                 <td
//                                                     style="
//                                                         mso-table-lspace: 0;
//                                                         mso-table-rspace: 0;
//                                                         padding-left: 5px;
//                                                         padding-right: 5px;
//                                                         text-align: right;
//                                                     "
//                                                     align="right"
//                                                 >
//                                                     <p>
//                                                         <a
//                                                             href="https://www.rcpilots.ai/profile/newsletter"
//                                                             style="
//                                                                 text-decoration: none;
//                                                                 color: rgba(
//                                                                     255,
//                                                                     255,
//                                                                     255,
//                                                                     0.4
//                                                                 );
//                                                             "
//                                                             >Unsubcribe</a
//                                                         >
//                                                     </p>
//                                                 </td>
//                                             </tr>
//                                         </table>
//                                     </td>
//                                 </tr>
//                             </table>
//                         </td>
//                     </tr>
//                 </table>
//             </div>
//         </center>
//     </body>
// </html>

//           `,
//       };
//     } else {
//       if (await User.isVerifiedEmail(email)) {
//         return;
//       } else {
//         messageData = {
//           from: "RCPC AI TEAM <RCPC@rcpilots.ai>",
//           to: email,
//           subject: `🛫 You're Invited to Join an Exclusive RCPC.ai Flight Crew!`,
//           text: `You are invited at the flight crew of ${user_name}. the name of flight crew is "${message}"`,
//           html: `
//         <html>
//           Hello Future RC Pilot, <br/> <br/>
//           Exciting news is on your radar! You’ve been personally invited to join an exclusive “Flight Crew” on RCPC.ai by ${user_name}, a fellow RC plane enthusiast. But wait – it seems like you haven’t yet joined the RCPC.ai  community. No worries, you're just a few clicks away from embarking on a fantastic journey in the world of remote control flying. <br/> <br/>
//           What is RCPC.ai ? RCPC.ai is your new digital hangar, a vibrant platform tailored for RC pilots and enthusiasts across Canada. It’s where the thrill of RC flying meets a supportive and resourceful community, powered by innovative AI features. From beginners to seasoned pros, RCPC.ai offers a space for everyone passionate about RC planes. <br/> <br/>
//           <b> Flight Crew – Your Personal RC Squadron </b> One of the coolest features of  RCPC.ai  is the “Flight Crew” – a dedicated chat channel where you can team up with other enthusiasts, like ${user_name}, to share tips, experiences, and the joy of flying. It's a place for real-time chats, sharing updates, and fostering camaraderie among pilots. <br/> <br/>
//           <b> How to Join ? </b> Simply click the link below to sign up for RCPC.ai Once you're set up, you can easily join the Flight Crew and start connecting with other RC enthusiasts. <br/>
//           Join RCPC.ai and Flight Crew <br/> <br/>
//           Don’t miss this opportunity to elevate your RC flying experience. RCPC.ai is more than just a platform; it’s a community where your passion for RC planes can truly soar. ${user_name} is waiting to welcome you aboard their Flight Crew – let’s not keep them waiting!
//           Happy flying and hope to see you soon on RCPC.ai <br/>
//           The  RCPC.ai Team <br/> <br/>
//           P.S. Remember, every great adventure starts with a single flight. <a href="https://www.rcpilots.ai/"> Start your adventure here! </a> 🌟
//         </html>
//         `,
//         };
//       }
//     }

//     return await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
//   } catch (error) {
//     console.log("sending email with mailgun is errir", error);
//     throw new ApiError(httpStatus.FORBIDDEN, error);
//   }
// };

const contactUs = async ({ email, message, full_name }) => {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY || "",
  });
  let messageData;
  try {
    messageData = {
      from: "RCPC AI TEAM <noreply@rcpilots.ai> ",
      to: process.env.CONTACT_EMAIL,
      subject: `${full_name} contacts you from rcpilots.ai`,
      html: `<html>name : ${full_name}<br/> email : ${email} </br> message: ${message}</html>`,
    };

    return await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);
  } catch (error) {
    console.log("contac us sending email", error);
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

const verifyEmail = async ({ code, email }) => {
  try {
    const user = await userService.getUserByEmail(email);
    if (await user.isVcodeMatch(code)) {
      console.log("1 ------");
      await updateNewsletterSubscribe(
        { emails: [email], subscribeStatus: true },
        user.id
      );
      console.log("2 ------");
      await userService.updateUserById(user.id, { is_EV: true });
      console.log("3 ------");

      return user;
    } else {
      return false;
    }
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const generateCodeForPwd = (email) => {
  //   deliverEmail({ email, flag: 0 });
};

module.exports = {
  //   deliverEmail,
  verifyEmail,
  contactUs,
  generateCodeForPwd,
};
