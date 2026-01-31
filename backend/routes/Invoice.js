const express = require('express')
const eta = require('eta')
const path = require('path')

const { HTTP_BAD_REQUEST, HTTP_OK } = require('../utils/http_status_codes')

const { mailTransporter } = require('../init.nodemailer')

const { Transaction } = require('../models/sql/Transaction')
const { Plan } = require('../models/sql/Plan')
const { User } = require('../models/sql/User')
const { UserPlan } = require('../models/sql/UserPlan')
const { PlanPricing } = require('../models/sql/PlanPricing')

const CustomUserPlan = require('../models/mongo/CustomUserPlan')
const CustomPlan = require('../models/mongo/CustomPlan')

// ✅ Cloud Run compatible
const puppeteer = require('puppeteer-core')
const chromium = require('@sparticuz/chromium')

const router = express.Router()

/* ================= PDF Generator ================= */

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })

  const page = await browser.newPage()

  await page.setContent(html, {
    waitUntil: 'networkidle0',
  })

  const buffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  })

  await browser.close()

  return buffer
}

/* ================= Eta Renderer ================= */

const renderer = new eta.Eta({
  views: path.join(__dirname, '../invoice-templates'),
  cache: true,
})

/* ================= Route ================= */

router.post('/student/mail-invoice', async (req, res) => {
  console.log('📩 /student/mail-invoice called')
  console.log('Request body:', req.body)

  const { user_id, transaction_order_id, plan_type } = req.body

  try {
    /* ---------- Validation ---------- */

    if (!user_id || !transaction_order_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Missing required fields' })
    }

    /* ---------- Transaction ---------- */

    console.log('🔍 Fetching transaction...')

    const transaction = await Transaction.findOne({
      where: { transaction_order_id },
    })

    if (!transaction) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Transaction not found' })
    }

    /* ---------- User ---------- */

    console.log('🔍 Fetching user...')

    const user = await User.findOne({
      where: { user_id },
    })

    if (!user) {
      return res.status(HTTP_BAD_REQUEST).json({ message: 'User not found' })
    }

    console.log('✅ Email:', user.email)

    /* ---------- Plan ---------- */

    let details = null

    if (plan_type === 'CUSTOM_PLAN') {
      console.log('📦 Custom plan flow')

      const userPlan = await CustomUserPlan.findOne({
        transaction_order_id,
        user_id,
      })

      if (!userPlan) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ message: 'User plan not found' })
      }

      const plan = await CustomPlan.findOne({
        _id: userPlan.custom_plan_id,
      })

      details = {
        user: user.toJSON(),
        transaction: transaction.toJSON(),
        user_plan: userPlan.toJSON(),
        plan: { ...plan.toJSON(), plan_type: 'CUSTOM_PLAN' },
        plan_pricing: { denomination: plan.prices[0][1] },
      }
    } else {
      console.log('📦 Normal plan flow')

      const userPlan = await UserPlan.findOne({
        where: { transaction_order_id, user_id },
      })

      if (!userPlan) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ message: 'User plan not found' })
      }

      const plan = await Plan.findOne({
        where: { plan_id: userPlan.plan_id },
      })

      if (!plan) {
        return res.status(HTTP_BAD_REQUEST).json({ message: 'Plan not found' })
      }

      const pricing = await PlanPricing.findOne({
        where: { plan_id: userPlan.plan_id, currency_id: 1 },
      })

      if (!pricing) {
        return res
          .status(HTTP_BAD_REQUEST)
          .json({ message: 'Pricing not found' })
      }

      details = {
        user: user.toJSON(),
        transaction: transaction.toJSON(),
        user_plan: userPlan.toJSON(),
        plan: plan.toJSON(),
        plan_pricing: pricing.toJSON(),
      }
    }

    /* ---------- Render ---------- */

    console.log('📝 Rendering invoice...')

    const html = await renderer.renderAsync('/student/plan-purchase', details)

    console.log('✅ HTML length:', html.length)

    /* ---------- PDF ---------- */

    console.log('📄 Generating PDF...')

    const pdfBuffer = await generatePDF(html)

    console.log('✅ PDF size:', pdfBuffer.length)

    /* ---------- Mail ---------- */

    console.log('📧 Sending mail...')

    await mailTransporter.sendMail({
      from: '6AM Yoga <dev.6amyoga@gmail.com>',
      to: user.email,
      subject: '6AM Yoga | Invoice',
      text: 'Please find your invoice attached.',
      attachments: [
        {
          filename: `invoice-${transaction_order_id}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    console.log('✅ Mail sent')

    return res.status(HTTP_OK).json({
      message: 'Invoice sent successfully',
    })
  } catch (err) {
    console.error('🔥 Invoice error:', err)

    return res.status(500).json({
      message: 'Failed to send invoice',
      error: err.message,
    })
  }
})

router.post('/student/notify-admin', async (req, res) => {
  //console.log('in notify admin!')
  const { user_id, transaction_order_id, plan_type } = req.body
  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  })

  if (!transaction) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Transaction not found' })
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  })
  if (!user) {
    return res.status(HTTP_BAD_REQUEST).json({ message: 'User not found' })
  }

  if (plan_type === 'CUSTOM_PLAN') {
    const userPlan = await CustomUserPlan.findOne({
      transaction_order_id: transaction_order_id,
      user_id: user_id,
    })

    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'User plan not found' })
    }

    const plan = await CustomPlan.findOne({
      _id: userPlan.custom_plan_id,
    })

    // //console.log(plan.prices);
    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: { ...plan.toJSON(), plan_type: 'CUSTOM_PLAN' },
      plan_pricing: { denomination: plan.prices[0][1] },
    }
    mailTransporter.sendMail(
      {
        from: 'dev.6amyoga@gmail.com',
        to: '992351@gmail.com',
        subject: '6AM Yoga | New User Subscription Purchased.',
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
                <p>Amount Paid : Rs. ${details.transaction.amount}</p>
                <br/>
                <br/>
                <p>Regards, </p>
                <p>My Yoga Teacher, 6AM Yoga </p>
              `,
      },
      async (err, info) => {
        if (err) {
          console.error(err)
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error; try again',
          })
        } else {
          res.status(HTTP_OK).json({
            message: 'Admin Notified!',
          })
        }
      }
    )
  } else {
    const userPlan = await UserPlan.findOne({
      where: {
        transaction_order_id: transaction_order_id,
        user_id: user_id,
      },
    })
    if (!userPlan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'User plan not found' })
    }

    const plan = await Plan.findOne({
      where: { plan_id: userPlan.plan_id },
    })
    if (!plan) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Plan details not found' })
    }

    const pricing = await PlanPricing.findOne({
      where: { plan_id: userPlan.plan_id, currency_id: 1 },
    })
    if (!pricing) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: 'Pricing details not found' })
    }

    details = {
      user: user.toJSON(),
      transaction: transaction.toJSON(),
      user_plan: userPlan.toJSON(),
      plan: plan.toJSON(),
      plan_pricing: pricing.toJSON(),
    }

    mailTransporter.sendMail(
      {
        from: 'dev.6amyoga@gmail.com',
        to: '992351@gmail.com',
        subject: '6AM Yoga | New User Subscription Purchased.',
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

                <p>Amount Paid : Rs. ${details.transaction.amount}</p>
                <br/>
                <br/>

                <p>Regards, </p>
                <p>My Yoga Teacher, 6AM Yoga </p>
              `,
      },
      async (err, info) => {
        if (err) {
          console.error(err)
          res.status(HTTP_INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error; try again',
          })
        } else {
          res.status(HTTP_OK).json({
            message: 'Admin Notified!',
          })
        }
      }
    )
  }
})

router.post('/student/plan', async (req, res) => {
  const { user_id, transaction_order_id } = req.body
  if (!user_id || !transaction_order_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Missing required fields' })
  }

  const transaction = await Transaction.findOne({
    where: { transaction_order_id: transaction_order_id },
  })
  if (!transaction) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Transaction not found' })
  }
  const user = await User.findOne({
    where: { user_id: user_id },
  })
  if (!user) {
    return res.status(HTTP_BAD_REQUEST).json({ message: 'User not found' })
  }
  const userPlan = await UserPlan.findOne({
    where: { transaction_order_id: transaction_order_id, user_id: user_id },
  })
  if (!userPlan) {
    return res.status(HTTP_BAD_REQUEST).json({ message: 'User plan not found' })
  }

  const plan = await Plan.findOne({
    where: { plan_id: userPlan.plan_id },
  })
  if (!plan) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Plan details not found' })
  }

  const pricing = await PlanPricing.findOne({
    where: { plan_id: userPlan.plan_id, currency_id: 1 },
  })

  if (!pricing) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: 'Pricing details not found' })
  }

  const details = {
    user: user.toJSON(),
    transaction: transaction.toJSON(),
    user_plan: userPlan.toJSON(),
    plan: plan.toJSON(),
    plan_pricing: pricing.toJSON(),
  }

  const content = await renderer.renderAsync('/student/plan-purchase', details)

  return res.status(200).header('Content-Type', 'application/pdf').send(content)

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
  //     //console.log(err);
  //     return res.status(500).send();
  //   });
})

module.exports = router
