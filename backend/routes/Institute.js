const express = require('express')

const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SERVICE_UNAVAILABLE,
} = require('../utils/http_status_codes')
const { Institute } = require('../models/sql/Institute')
const { validate_email } = require('../utils/validate_email')
const { sequelize } = require('../init.sequelize')
const { Op } = require('sequelize')
const { User } = require('../models/sql/User')
const { Role } = require('../models/sql/Role')
const { UserInstitutePlanRole } = require('../models/sql/UserInstitutePlanRole')
const { authenticateToken } = require('../utils/jwt')
const { ROLE_INSTITUTE_OWNER } = require('../enums/role')

const router = express.Router()

router.post('/register', authenticateToken, async (req, res) => {
  const {
    name,
    address1,
    address2,
    email,
    phone,
    billing_address,
    country,
    state,
    city,
    pincode,
    gstin,
  } = req.body

  console.log({ body: req.body })

  if (!name || !email || !phone || !pincode)
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })

  if (!validate_email(email))
    return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid email address' })

  const t = await sequelize.transaction()
  try {
    const [institute, created] = await Institute.findOrCreate({
      where: { [Op.or]: [{ name }, { email }] },
      defaults: {
        name,
        address1: address1 || null,
        address2: address2 || null,
        email,
        phone: phone || null,
        billing_address: billing_address || null,
        country: country || null,
        city: city || null,
        state: state || null,
        pincode: pincode,
        gstin: gstin || null,
      },
      transaction: t,
    })

    if (!created) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute already exists' })
    }

    if (req.user) {
      const role = await Role.findOne({
        where: { name: ROLE_INSTITUTE_OWNER },
        transaction: t,
      })

      if (!role) {
        await t.rollback()
        return res
          .status(HTTP_INTERNAL_SERVER_ERROR)
          .json({ error: 'Internal server error' })
      }

      const user_institute = await UserInstitutePlanRole.create(
        {
          user_id: req.user.user_id,
          institute_id: institute.institute_id,
          role_id: role.role_id,
        },
        { transaction: t }
      )
    }

    await t.commit()
    return res.status(HTTP_OK).json(institute)
  } catch (error) {
    console.error(error)
    await t.rollback()
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.get('/get-all-institutes', async (req, res) => {
  try {
    const institutes = await Institute.findAll()
    return res.status(HTTP_OK).json(institutes)
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/get-by-instituteid', async (req, res) => {
  const { institute_id } = req.body
  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }
  try {
    const institute = await Institute.findOne({
      where: { institute_id },
    })

    if (!institute) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    return res.status(HTTP_OK).json(institute)
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/get-by-name', async (req, res) => {
  const { name } = req.body
  if (!name) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  try {
    const institute = await Institute.findOne({
      where: { name },
    })

    if (!institute) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    return res.status(HTTP_OK).json(institute)
  } catch (error) {
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update-address', async (req, res) => {
  const { institute_id, address1, address2 } = req.body

  if (!institute_id || !address1 || !address2) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { address1, address2 },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated address successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update-billing-address', async (req, res) => {
  const { institute_id, billing_address } = req.body

  if (!institute_id || !billing_address) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { billing_address },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated billing address successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update-email', async (req, res) => {
  const { institute_id, email } = req.body

  if (!institute_id || !email) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { email },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated email successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update-phone', async (req, res) => {
  const { institute_id, phone } = req.body

  if (!institute_id || !phone) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { phone },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated phone successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update-name', async (req, res) => {
  const { institute_id, name } = req.body

  if (!institute_id || !name) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { name },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated name successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/update', async (req, res) => {
  const {
    institute_id,
    name,
    address1,
    address2,
    email,
    phone,
    billing_address,
  } = req.body

  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const [nRows, affectedRows] = await Institute.update(
      { name, address1, address2, email, phone, billing_address },
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Updated institute successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.delete('/delete-by-id', async (req, res) => {
  const { institute_id } = req.body

  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const nRows = await Institute.destroy(
      { where: { institute_id } },
      { transaction: t, returning: true }
    )

    if (nRows === 0) {
      await t.rollback()
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Institute does not exist' })
    }

    await t.commit()
    return res.status(HTTP_OK).json({
      message: 'Deleted institute successfully',
    })
  } catch (error) {
    await t.rollback()

    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

// For owners of institutes
router.post('/get-all-by-userid', async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const ui = await UserInstitutePlanRole.findAll(
      {
        where: { user_id },
        attributes: ['user_id', 'institute_id'],
        include: [
          {
            model: Institute,
          },
        ],
      },
      { transaction: t }
    )
    // console.log(ui[0]);

    await t.commit()
    return res.status(HTTP_OK).json({ institutes: ui.map((i) => i.institute) })
  } catch (error) {
    await t.rollback()
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

// For users
router.post('/get-by-userid', async (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const ui = await UserInstitutePlanRole.findOne(
      {
        where: { user_id },
        attributes: ['user_id', 'institute_id'],
        include: [
          {
            model: Institute,
            attributes: ['institute_id', 'name', 'email', 'phone'],
          },
        ],
      },
      { transaction: t }
    )

    await t.commit()
    return res
      .status(HTTP_OK)
      .json({ institute: ui.institute ? ui.institute : null })
  } catch (error) {
    await t.rollback()
    console.error(error)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

router.post('/teacher/get-all-by-instituteid', async (req, res) => {
  const { institute_id } = req.body
  if (!institute_id) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Missing required fields' })
  }

  const t = await sequelize.transaction()
  try {
    const teachers = await UserInstitutePlanRole.findAll(
      {
        where: { institute_id },
        attributes: ['user_id', 'institute_id', 'role_id'],
        include: [
          {
            model: User,
            attributes: ['user_id', 'username', 'name', 'email', 'phone'],
            required: true,
          },
          {
            model: Role,
            attributes: ['name'],
            where: { name: 'TEACHER' },
            required: true,
          },
        ],
      },
      { transaction: t }
    )
    await t.commit()
    console.log('in func woohoo')
    console.log('Sending  : ', teachers)
    return res.status(HTTP_OK).json({ teachers })
  } catch (err) {
    await t.rollback()
    console.error(err)
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' })
  }
})

module.exports = router
