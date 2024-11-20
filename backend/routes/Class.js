const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const Class = require('../models/mongo/Class')
// const ClassHistory = require('../models/mongo/ClassHistory')

const {
  HTTP_BAD_REQUEST,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')

const { CLASS_ONGOING, CLASS_UPCOMING } = require('../enums/class_status')

const { User } = require('../models/sql/User')
const {
  CLASS_TYPE_ONETIME,
  CLASS_TYPE_RECURRING,
} = require('../enums/class_metadata_class_type')
const {
  CLASS_RECURRANCE_TYPE_WEEKLY,
  CLASS_RECURRANCE_TYPE_DAILY,
} = require('../enums/class_metadata_recurrance_type')

const ClassHistory = require('../models/mongo/ClassHistory')

router.post('/create', async (req, res) => {
  const mt = await mongoose.startSession()

  mt.startTransaction()

  try {
    const {
      class_name,
      class_desc,
      class_type,
      recurrance_type,
      recurrance_days = [],
      onetime_class_start_time = null,
      onetime_class_end_time = null,
      recurring_class_start_time = null,
      recurring_class_end_time = null,
      teacher_id,
      allowed_students = [],
    } = req.body
    // const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);

    if (!class_name || !class_desc || !teacher_id || !class_type) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    if (class_type === CLASS_TYPE_ONETIME) {
      if (!onetime_class_start_time || !onetime_class_end_time) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: 'Missing required fields',
        })
      }
    }

    if (class_type === CLASS_TYPE_RECURRING) {
      if (!recurring_class_start_time || !recurring_class_end_time) {
        return res.status(HTTP_BAD_REQUEST).json({
          error: 'Missing required fields',
        })
      }
    }

    if (
      recurrance_type === CLASS_RECURRANCE_TYPE_WEEKLY &&
      (!recurrance_days || recurrance_days.length === 0)
    ) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.create(
      [
        {
          class_name,
          class_desc,
          teacher_id,
          class_type,
          recurrance_type,
          recurrance_days,
          onetime_class_start_time,
          onetime_class_end_time,
          recurring_class_start_time,
          recurring_class_end_time,
          allowed_students,
        },
      ],
      {
        session: mt,
      }
    )

    // console.log('classObj:', classObj)

    if (class_type === CLASS_TYPE_ONETIME) {
      await ClassHistory.create(
        [
          {
            class_id: classObj[0]._id,
            actions_queue: [],
            attendees: [],
            controls_queue: [],
            has_teacher_joined: false,
            status: CLASS_UPCOMING,
            watch_history: [],
            class_name,
            class_desc,
            start_time: onetime_class_start_time,
            end_time: onetime_class_end_time,
            teacher_id,
          },
        ],
        {
          session: mt,
        }
      )
    } else if (class_type === CLASS_TYPE_RECURRING) {
      if (recurrance_type === CLASS_RECURRANCE_TYPE_DAILY) {
        //
      } else if (recurrance_type === CLASS_RECURRANCE_TYPE_WEEKLY) {
        //
      } else {
        //
      }
    }

    await mt.commitTransaction()
    await mt.endSession()
    return res.status(HTTP_OK).json({ message: 'Class Saved' })
  } catch (error) {
    console.error('Error saving new Class:', error)
    await mt.abortTransaction()
    await mt.endSession()
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Class',
    })
  }
})

router.post('/update', async (req, res) => {
  try {
    const {
      class_id,
      class_name,
      class_desc,
      status,
      teacher_id,
      old_start_time,
      old_end_time,
      start_time,
      end_time,
      allowed_students = [],
    } = req.body
    // const maxIdClass = await ClassMode.findOne().sort({ id: -1 }).limit(1);

    if (
      !class_id ||
      !class_name ||
      !class_desc ||
      !status ||
      !start_time ||
      !end_time ||
      !teacher_id
    ) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    // update class
    await Class.findByIdAndUpdate(
      class_id,
      {
        class_name,
        class_desc,
        teacher_id,
        status,
        onetime_class_start_time: start_time,
        onetime_class_end_time: end_time,
        allowed_students,
      },
      { new: true }
    )

    await ClassHistory.findOneAndUpdate(
      { class_id, start_time: old_start_time, end_time: old_end_time },
      {
        class_name,
        class_desc,
        start_time,
        end_time,
        teacher_id,
      }
    )

    return res.status(HTTP_OK).json({ message: 'Class Saved' })
  } catch (error) {
    console.error('Error saving new Class:', error)

    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Class',
    })
  }
})

router.post('/update-history-status', async (req, res) => {
  try {
    const { class_history_id, status } = req.body

    if (!class_history_id || !status) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    await ClassHistory.findOneAndUpdate(
      { _id: class_history_id },
      { status },
      { new: true }
    )

    return res.status(HTTP_OK).json({ message: 'Class history status updated' })
  } catch (error) {
    console.error('Error saving new Class:', error)

    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update class history status',
    })
  }
})

router.post('/student/get-all', async (req, res) => {
  try {
    const { user_id } = req.body
    const classes = await Class.find()
    const finalList = []
    for (let i = 0; i < classes.length; i += 1) {
      const classObj = classes[i].toJSON()
      if (classObj.allowed_students.includes(String(user_id))) {
        finalList.push(classes[i])
      } else {
        console.log(classObj.allowed_students)
      }
    }
    console.log(user_id)
    console.log(finalList)
    return res.status(HTTP_OK).json(finalList)
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch classes',
    })
  }
})

router.post('/student/get-class-for-student', async (req, res) => {
  try {
    const { class_id, user_id } = req.body
    const selectedClass = await Class.findById(class_id)
    if (selectedClass.class_id == class_id) {
      if (selectedClass.allowed_students.includes(String(user_id))) {
        return res.status(HTTP_OK).json({ inClass: true })
      } else {
        return res.status(HTTP_OK).json({ inClass: false })
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch classes',
    })
  }
})

router.get('/teacher/get-all', async (req, res) => {
  try {
    const { teacher_id } = req.body

    const filter = {}

    if (teacher_id) {
      filter.teacher_id = teacher_id
    }

    const classes = await Class.find(filter, {})

    for (let i = 0; i < classes.length; i += 1) {
      const classObj = classes[i].toJSON()
      const teacher = await User.findByPk(classObj.teacher_id, {
        attributes: ['name', 'email'],
      })
      classObj.teacher = teacher

      classes[i] = classObj
    }

    return res.status(HTTP_OK).json(classes)
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch classes',
    })
  }
})

router.post('/get-by-id', async (req, res) => {
  try {
    const { class_id } = req.body

    if (!class_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findById(class_id)

    if (!classObj) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Class not found',
      })
    }

    const teacher = await User.findByPk(classObj.teacher_id, {
      attributes: ['name', 'email'],
    })

    return res
      .status(HTTP_OK)
      .json({ class: { ...classObj.toJSON(), teacher } })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch class',
    })
  }
})

router.post('/start', async (req, res) => {
  try {
    const { class_history_id } = req.body

    if (!class_history_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await ClassHistory.findByIdAndUpdate(
      class_history_id,
      { status: CLASS_ONGOING },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to start class',
    })
  }
})

router.post('/get-history', async (req, res) => {
  const { class_id } = req.body

  console.log(class_id)

  if (!class_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      error: 'Missing required fields',
    })
  }

  try {
    const class_history_records = await ClassHistory.find({
      class_id: class_id.toString(),
    })

    return res.status(HTTP_OK).json({ class_history: class_history_records })
  } catch (error) {
    console.log(error)

    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch class history',
    })
  }
})

router.post('/get-latest-history', async (req, res) => {
  const { class_id } = req.body

  if (!class_id) {
    return res.status(HTTP_BAD_REQUEST).json({
      error: 'Missing required fields',
    })
  }

  try {
    const class_history_record = await ClassHistory.findOne({
      class_id: class_id.toString(),
    })

    return res.status(HTTP_OK).json({ class_history: class_history_record })
  } catch (error) {
    console.log(error)

    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch class history',
    })
  }
})

router.post('/end', async (req, res) => {
  try {
    const { class_history_id, status } = req.body

    if (!class_history_id || !status) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await ClassHistory.findByIdAndUpdate(
      class_history_id,
      { status },
      { new: true }
    )

    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to start class',
    })
  }
})

router.post('/join', async (req, res) => {
  try {
    const { class_id, student_id } = req.body

    if (!class_id || !student_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findByIdAndUpdate(
      class_id,
      { $push: { attendees: student_id } },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to join class',
    })
  }
})

router.post('/leave', async (req, res) => {
  try {
    const { class_id, student_id } = req.body

    if (!class_id || !student_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findByIdAndUpdate(
      class_id,
      { $pull: { attendees: student_id } },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to leave class',
    })
  }
})

router.post('/add-student', async (req, res) => {
  try {
    const { class_id, email } = req.body

    if (!class_id || !email) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findByIdAndUpdate(
      class_id,
      { $push: { allowed_students: email } },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to add student',
    })
  }
})

router.post('/remove-student', async (req, res) => {
  try {
    const { class_id, email } = req.body

    if (!class_id || !email) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findByIdAndUpdate(
      class_id,
      { $pull: { allowed_students: email } },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to remove student',
    })
  }
})

router.post('/end', async (req, res) => {
  try {
    const { class_id } = req.body

    if (!class_id) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: 'Missing required fields',
      })
    }

    const classObj = await Class.findByIdAndUpdate(
      class_id,
      { has_started: false },
      { new: true }
    )
    return res.status(HTTP_OK).json({ classObj })
  } catch (err) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to end class',
    })
  }
})

module.exports = router
