const express = require('express')
const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const { Queries } = require('../models/sql/Queries')
const { sequelize } = require('../init.sequelize')
const { mailTransporter } = require('../init.nodemailer')

const router = express.Router()

const ensureQueryFollowUpColumns = async () => {
  await sequelize.query(`
    ALTER TABLE queries
      ADD COLUMN IF NOT EXISTS query_source VARCHAR(255) DEFAULT 'website',
      ADD COLUMN IF NOT EXISTS entered_by_user_id INTEGER NULL,
      ADD COLUMN IF NOT EXISTS entered_by_name VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS follow_up_status BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS follow_up_notes TEXT NULL,
      ADD COLUMN IF NOT EXISTS followed_up_at TIMESTAMPTZ NULL;
  `)
}

router.get('/get-all', async (req, res) => {
  try {
    await ensureQueryFollowUpColumns()
    const queries = await Queries.findAll({
      order: [['created', 'DESC']],
    })
    res.status(HTTP_OK).json({ queries })
  } catch (error) {
    console.error('Error fetching queries:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Error fetching queries',
    })
  }
})

router.post('/register', async (req, res) => {
  const {
    query_name,
    query_email,
    query_phone,
    query_source = 'website',
    entered_by_user_id = null,
    entered_by_name = null,
  } = req.body
  //console.log(query_email);
  if (!query_name || !query_email || !query_phone) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  const query_text = req.body.query_text || 'No query text provided'

  const t = await sequelize.transaction()

  try {
    await ensureQueryFollowUpColumns()
    const [newQuery, created] = await Queries.findOrCreate({
      where: { query_name, query_email, query_phone, query_text },
      defaults: {
        query_source,
        entered_by_user_id,
        entered_by_name,
      },
      transaction: t,
    })
    const emailText = `
      New Query from ${query_name}

      Email: ${query_email}
      Phone: ${query_phone}
      Source: ${query_source}
      Entered by: ${entered_by_name || 'Website'}

      Query:
      ${query_text}
    `

    mailTransporter.sendMail(
      {
        from: 'dev.6amyoga@gmail.com',
        to: ['kjrosa1982@gmail.com', 'sivakumarp2910@gmail.com'],
        subject: '6AM Yoga | You have a query!',
        text: emailText,
      },
      async (err, info) => {
        if (err) {
          await t.rollback()
          console.error('Error sending email:', err)
          return res
            .status(HTTP_BAD_REQUEST)
            .json({ message: 'Failed to send email notification' })
        }
        await t.commit()
        res.status(HTTP_OK).json({ message: 'Query sent' })
      }
    )
  } catch (error) {
    console.error('Error handling query:', error)
    await t.rollback()
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.patch('/:query_id/follow-up', async (req, res) => {
  const { query_id } = req.params
  const { follow_up_status, follow_up_notes = null } = req.body

  if (typeof follow_up_status !== 'boolean') {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'follow_up_status must be true or false' })
  }

  try {
    await ensureQueryFollowUpColumns()
    const query = await Queries.findByPk(query_id)

    if (!query) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Query not found' })
    }

    await query.update({
      follow_up_status,
      follow_up_notes,
      followed_up_at: follow_up_status ? new Date() : null,
    })

    return res.status(HTTP_OK).json({ query })
  } catch (error) {
    console.error('Error updating query follow-up:', error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

module.exports = router
