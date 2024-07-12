const express = require("express");
const pdfkit = require("pdfkit");
const fs = require("fs");
const eta = require("eta");
const path = require("path");
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require("../utils/http_status_codes");
const { mailTransporter } = require("../init.nodemailer");

const { Transaction } = require("../models/sql/Transaction");
const { Plan } = require("../models/sql/Plan");
const { User } = require("../models/sql/User");
const { UserPlan } = require("../models/sql/UserPlan");
const { PlanPricing } = require("../models/sql/PlanPricing");
const HTMLToPDF = require("html-pdf-node");
const CustomUserPlan = require("../models/mongo/CustomUserPlan");
const CustomPlan = require("../models/mongo/CustomPlan");

const router = express.Router();

const renderer = new eta.Eta({
  views: path.join(__dirname, "../invoice-templates"),
  cache: true,
});

router.get("/temp", async (req, res) => {
  const deets = {
    transaction: {
      transaction_id: 30,
      payment_for: "user_plan",
      payment_method: "wallet",
      amount: 590,
      payment_status: "succeeded",
      payment_date: "2024-01-25T16:18:34.503Z",
      transaction_order_id: "order_NSuODFKbpUz2AE",
      transaction_payment_id: "pay_NSuOIWXD13Unmm",
      transaction_signature:
        "e5371b8b02614d96f4e2ca33c8b1e7cf44439494216b82642265c91cd0b88be8",
      created: "2024-01-25T16:18:34.504Z",
      updated: "2024-01-25T16:18:34.504Z",
      deleted_at: null,
      user_id: 14,
    },
    user: {
      user_id: 14,
      username: "smitha",
      name: "Smitha Chandran",
      email: "smritisivakumar2002abc@gmail.com",
      phone: "+919449767074",
      password: "$2b$10$/A3cGIWAaTQqUW1dG.R8q.sV4pBbNAzybTX2l26JhMi10i/PNP576",
      is_google_login: false,
      last_login: null,
      created: "2024-01-19T08:59:01.400Z",
      updated: "2024-01-19T08:59:01.400Z",
      deleted_at: null,
      role_id: null,
    },
    user_plan: {
      user_plan_id: 17,
      purchase_date: "2024-01-25T00:00:00.000Z",
      validity_from: "2024-02-25T00:00:00.000Z",
      validity_to: "2024-04-25T00:00:00.000Z",
      is_active: true,
      cancellation_date: null,
      auto_renewal_enabled: false,
      discount_coupon_id: 0,
      referral_code_id: 0,
      created: "2024-01-25T16:19:05.202Z",
      updated: "2024-01-25T16:19:05.202Z",
      deleted_at: null,
      user_id: 14,
      plan_id: 37,
      current_status: "STAGED",
      transaction_order_id: "order_NSuOlOcXmxLvmg",
    },
    plan: {
      plan_id: 37,
      name: "Fixed Plan Student",
      description: null,
      has_basic_playlist: true,
      has_playlist_creation: false,
      playlist_creation_limit: 0,
      has_self_audio_upload: false,
      number_of_teachers: 0,
      plan_validity: 0,
      plan_user_type: "student",
      created: "2024-01-17T16:06:21.772Z",
      updated: "2024-01-17T16:06:21.772Z",
      deleted_at: null,
    },
    plan_pricing: {
      plan_pricing_id: 37,
      denomination: 5,
      created: "2024-01-17T16:06:21.807Z",
      updated: "2024-01-17T16:06:21.807Z",
      deleted_at: null,
      plan_id: 37,
      currency_id: 1,
    },
  };

  const content = await renderer.renderAsync("/student/plan-purchase", deets);

  HTMLToPDF.generatePdf(
    { content: content },
    { format: "A4", printBackground: true, preferCSSPageSize: true }
  )
    .then((buffer) => {
      return res
        .status(200)
        .header("Content-Type", "application/pdf")
        .send(buffer);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send();
    });
});

router.post("/student/plan", async (req, res) => {
  const { user_id, transaction_order_id } = req.body;
  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  });
  if (!transaction) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Transaction not found" });
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  });
  if (!user) {
    return res.status(HTTP_BAD_REQUEST).json({ message: "User not found" });
  }
  const userPlan = await UserPlan.findOne({
    where: { transaction_order_id: transaction_order_id, user_id: user_id },
  });
  if (!userPlan) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "User plan not found" });
  }

  const plan = await Plan.findOne({
    where: { plan_id: userPlan.plan_id },
  });
  if (!plan) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Plan details not found" });
  }

  const pricing = await PlanPricing.findOne({
    where: { plan_id: userPlan.plan_id, currency_id: 1 },
  });
  if (!pricing) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Pricing details not found" });
  }

  const details = {
    user: user.toJSON(),
    transaction: transaction.toJSON(),
    user_plan: userPlan.toJSON(),
    plan: plan.toJSON(),
    plan_pricing: pricing.toJSON(),
  };
  const content = await renderer.renderAsync("/student/plan-purchase", details);

  return res
    .status(200)
    .header("Content-Type", "application/pdf")
    .send(content);

  // HTMLToPDF.generatePdf(
  //   { content: content },
  //   { format: "A4", printBackground: true, preferCSSPageSize: true }
  // )
  //   .then((buffer) => {
  //     return res
  //       .status(200)
  //       .header("Content-Type", "application/pdf")
  //       .send(buffer);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     return res.status(500).send();
  //   });
});

router.post("/student/mail-invoice", async (req, res) => {
  const { user_id, transaction_order_id, plan_type } = req.body;

  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  });

  if (!transaction) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Transaction not found" });
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  });
  if (!user) {
    return res.status(HTTP_BAD_REQUEST).json({ message: "User not found" });
  }

  let details = null;

  if (plan_type === "CUSTOM_PLAN") {
    const userPlan = await CustomUserPlan.findOne({
      transaction_order_id: transaction_order_id,
      user_id: user_id,
    });

    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User plan not found" });
    }

    // console.log(userPlan.custom_plan_id);

    const plan = await CustomPlan.findOne({
      _id: userPlan.custom_plan_id,
    });

    // console.log(plan.prices);

    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: { ...plan.toJSON(), plan_type: "CUSTOM_PLAN" },
      plan_pricing: { denomination: plan.prices[0][1] },
    };
  } else {
    const userPlan = await UserPlan.findOne({
      where: {
        transaction_order_id: transaction_order_id,
        user_id: user_id,
      },
    });
    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User plan not found" });
    }

    const plan = await Plan.findOne({
      where: { plan_id: userPlan.plan_id },
    });
    if (!plan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Plan details not found" });
    }

    const pricing = await PlanPricing.findOne({
      where: { plan_id: userPlan.plan_id, currency_id: 1 },
    });
    if (!pricing) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Pricing details not found" });
    }

    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: plan.toJSON(),
      plan_pricing: pricing.toJSON(),
    };
  }

  const content = await renderer.renderAsync("/student/plan-purchase", details);

  /*
	HTMLToPDF.generatePdf(
		{ content: content },
		{ format: "A4", printBackground: true, preferCSSPageSize: true }
	)
		.then((buffer) => {
			// change email
			mailTransporter.sendMail(
				{
					from: "dev.6amyoga@gmail.com",
					to: user.email,
					subject: "6AM Yoga | Invoice for your recent payment",
					text: "Welcome to 6AM Yoga! Please find attached, the invoice for your recent transaction!",
					attachments: [
						{
							filename: "invoice.pdf",
							content: Buffer.from(buffer, "base64"),
							encoding: "base64",
						},
					],
				},
				async (err, info) => {
					if (err) {
						await t.rollback();
						console.error(err);
						res.status(HTTP_INTERNAL_SERVER_ERROR).json({
							message: "Internal server error; try again",
						});
					} else {
						res.status(HTTP_OK).json({
							message: "Email sent",
						});
					}
				}
			);
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).send();
		});
	*/

  return res.status(200).send(content);
});

router.post("/student/notify-admin", async (req, res) => {
  console.log("in notify admin!");
  const { user_id, transaction_order_id, plan_type } = req.body;
  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  });

  if (!transaction) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Transaction not found" });
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  });
  if (!user) {
    return res.status(HTTP_BAD_REQUEST).json({ message: "User not found" });
  }

  if (plan_type === "CUSTOM_PLAN") {
    const userPlan = await CustomUserPlan.findOne({
      transaction_order_id: transaction_order_id,
      user_id: user_id,
    });

    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User plan not found" });
    }

    const plan = await CustomPlan.findOne({
      _id: userPlan.custom_plan_id,
    });

    // console.log(plan.prices);
    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: { ...plan.toJSON(), plan_type: "CUSTOM_PLAN" },
      plan_pricing: { denomination: plan.prices[0][1] },
    };
    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: "992351@gmail.com",
        subject: "6AM Yoga | New User Subscription Purchased.",
        html: `
                <p>Greetings,</p>
                <p>You received a new payment on ai.6amyoga.com ! Congratulations :) The users and their plan details are as follows : </p>
                
                <p>Name : ${details.user.name}</p>
                <p>Email ID : ${details.user.email}.</p>
                <p>Phone Number : ${details.user.phone}.</p>
                <p>Username : ${details.user.username}</p>
                <br/>
                <br/>
                <p>Plan Details</p>
                <p>Plan Name : ${details.plan.plan_name}</p>
                <p>Plan Start Date : ${details.user_plan.validity_from}</p>
                <p>Plan End Date : ${details.user_plan.validity_to}</p>
                <p>Plan Validity Period : ${details.plan.planValidity} days</p>
                <p>Watch Hours : ${details.plan.watchHours} hours</p>

                <p>Amount Paid : Rs. ${details.transaction.amount / 100}</p>
                <br/>
                <br/>

                <p>Regards, </p>
                <p>My Yoga Teacher, 6AM Yoga </p>
              `,
      },
      async (err, info) => {
        if (err) {
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          res.status(HTTP_OK).json({
            message: "Admin Notified!",
          });
        }
      }
    );
  } else {
    const userPlan = await UserPlan.findOne({
      where: {
        transaction_order_id: transaction_order_id,
        user_id: user_id,
      },
    });
    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User plan not found" });
    }

    const plan = await Plan.findOne({
      where: { plan_id: userPlan.plan_id },
    });
    if (!plan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Plan details not found" });
    }

    const pricing = await PlanPricing.findOne({
      where: { plan_id: userPlan.plan_id, currency_id: 1 },
    });
    if (!pricing) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Pricing details not found" });
    }

    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: plan.toJSON(),
      plan_pricing: pricing.toJSON(),
    };

    mailTransporter.sendMail(
      {
        from: "dev.6amyoga@gmail.com",
        to: "992351@gmail.com",
        subject: "6AM Yoga | New User Subscription Purchased.",
        html: `
                <p>Greetings,</p>
                <p>You received a new payment on ai.6amyoga.com ! Congratulations :) The users and their plan details are as follows : </p>
                
                <p>Name : ${details.user.name}</p>
                <p>Email ID : ${details.user.email}.</p>
                <p>Phone Number : ${details.user.phone}.</p>
                <p>Username : ${details.user.username}</p>
                <br/>
                <br/>
                <p>Plan Details</p>
                <p>Plan Name : ${details.plan.name}</p>
                <p>Plan Start Date : ${details.user_plan.validity_from}</p>
                <p>Plan End Date : ${details.user_plan.validity_to}</p>
                <p>Plan Validity Period : ${
                  details.plan.plan_validity_days
                } days</p>
                <p>Watch Hours : ${
                  details.plan.watch_time_limit / 3600
                } hours</p>

                <p>Amount Paid : Rs. ${details.transaction.amount / 100}</p>
                <br/>
                <br/>

                <p>Regards, </p>
                <p>My Yoga Teacher, 6AM Yoga </p>
              `,
      },
      async (err, info) => {
        if (err) {
          console.error(err);
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: "Internal server error; try again",
          });
        } else {
          res.status(HTTP_OK).json({
            message: "Admin Notified!",
          });
        }
      }
    );
  }
});
module.exports = router;
