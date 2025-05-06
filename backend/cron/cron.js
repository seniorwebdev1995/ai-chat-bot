const Template = require("../models/template.model");
const { sendNewsletter } = require("../services/newsletter.service");

const newsletterCron = async () => {
  console.log("newsletterCron is working 0 AM every day -------");
  const currentDate = new Date();
  const curTemplate = await Template.findOne({ selected: true });
  if (curTemplate == null) {
    console.log("no template selected -------");
    return;
  }
  const lastDateOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  if (curTemplate.date == "1") {
    if (currentDate.getDate() === 1) {
      console.log("It's first date of month ----");
      sendNewsletter();
    }
  } else if (curTemplate.date == "2") {
    if (currentDate.getDay() == 1) {
      console.log("It's Monday --------");
      sendNewsletter();
    }
  } else if (curTemplate.date == "3") {
    if (currentDate.getDate() === lastDateOfMonth) {
      console.log(
        "Case 3: It's the last date of the month. Run specific logic."
      );
      sendNewsletter();

      // Add your logic for the third case here
    }
  } else if (curTemplate.date.startsWith("4")) {
    const userSpecificDate = curTemplate.date.split(",")[1];
    if (
      (currentDate.getDate() === lastDateOfMonth &&
        userSpecificDate > currentDate.getDate()) ||
      userSpecificDate == currentDate.getDate()
    ) {
      console.log(
        "Additional logic for the last date of the month and larger than user-specified date."
      );
      sendNewsletter();

      // Add your additional logic here
    }
  }
};

module.exports = newsletterCron;
