const express = require('express')
const router = express.Router()
const Asana = require('../models/mongo/Asana')
const Language = require('../models/mongo/Language')
const TransitionVideo = require('../models/mongo/TransitionVideo')
const AsanaCategory = require('../models/mongo/AsanaCategory')
const {
  HTTP_OK,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http_status_codes')
const { execSync } = require('child_process')
const ffprobePath = require('ffprobe-static').path
function getVideoDuration(filePath) {
  try {
    const result = execSync(
      `${ffprobePath} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { encoding: 'utf-8' }
    )
    const duration = parseFloat(result)
    return isNaN(duration) ? 0 : duration
  } catch (error) {
    console.error('Error getting video duration:', error.message)
    return 0
  }
}

router.post('/video/addAsana', async (req, res) => {
  try {
    const requestData = req.body
    const maxIdAsana = await Asana.findOne().sort({ id: -1 }).limit(1)
    let newId
    if (maxIdAsana) {
      newId = maxIdAsana.id + 1
    } else {
      newId = 1
    }
    requestData.id = newId
    const newAsana = new Asana(requestData)
    const savedAsana = await newAsana.save()
    res.status(200).json(newAsana)
  } catch (error) {
    console.error('Error saving new Asana:', error)
    res.status(500).json({
      error: 'Failed to save new Asana',
    })
  }
})

router.put('/video/updateTransition/:transitionId', async (req, res) => {
  const transitionId = req.params.transitionId
  const updatedData = req.body
  if (updatedData.asana_hls_url !== '') {
    const hlsDuration = getVideoDuration(updatedData.transition_hls_url)
    updatedData.duration = hlsDuration
  }
  try {
    const existingAsana = await TransitionVideo.findOne({
      transition_id: transitionId,
    })
    if (!existingAsana) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Transition not found' })
    }
    const mergedData = { ...existingAsana.toObject(), ...updatedData }
    const updatedAsana = await TransitionVideo.findOneAndUpdate(
      { transition_id: transitionId },
      mergedData,
      {
        new: true,
      }
    )
    res.status(200).json(updatedAsana)
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Asana',
    })
  }
})

router.post('/video/addTransition', async (req, res) => {
  try {
    const requestData = req.body
    const allIds = await TransitionVideo.find({}, { transition_id: 1, _id: 0 })
    const numericParts = allIds.map(
      (item) => parseInt(item.transition_id.split('_')[1]) || 0
    )
    const maxNumericPart = Math.max(...numericParts)
    const newId = 'T_' + (maxNumericPart + 1)
    requestData.transition_id = newId
    const newAsana = new TransitionVideo(requestData)
    const hlsDuration = getVideoDuration(newAsana.transition_hls_url)
    console.log(hlsDuration)
    newAsana.duration = hlsDuration
    const savedAsana = await newAsana.save()
    res.status(200).json(savedAsana)
  } catch (error) {
    console.error('Error saving new video:', error)
    res.status(500).json({
      error: 'Failed to save new video',
    })
  }
})

router.post('/updateRecords', async (req, res) => {
  try {
    const result = await TransitionVideo.updateMany(
      {},
      { $set: { coming_from_relax: false } }
    )
    res.status(200).json({
      success: true,
      message: `Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s)`,
    })
  } catch (error) {
    console.error('Error updating documents:', error)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
})

router.get('/video/getAllTransitions', async (req, res) => {
  try {
    const asanas = await TransitionVideo.find()
    res.json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

// router.get("/video/getAllTransitions", async (req, res) => {
//   try {
//     const asanas = await TransitionVideo.find();
//     for (let i = 0; i < asanas.length; i++) {
//       let asana = asanas[i];
//       if (
//         asana.transition_dash_url.includes(
//           "https://videos.6amyoga.com"
//           // "https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev"
//         )
//       ) {
//         asana.transition_dash_url = asana.transition_dash_url.replace(
//           "https://videos.6amyoga.com",
//           "https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev"
//           // "https://videos.6amyoga.com"
//         );
//         await asana.save();
//       }
//     }
//     res.json(asanas);
//   } catch (error) {
//     console.error(error);
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: "Failed to fetch videos",
//     });
//   }
// });

router.get('/video/updateTransitionsTeacher', async (req, res) => {
  try {
    const output = []
    const transitions = await Asana.find()

    for (const transition of transitions) {
      if (!transition.hasOwnProperty('teacher_mode')) {
        output.push(transition)
        await Asana.findByIdAndUpdate(transition._id, {
          $set: { teacher_mode: false },
        })
        transition.teacher_mode = false
      }
    }

    res.status(200).json(output)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

router.post('/get-transition-by-id', async (req, res) => {
  const { asana_id, transition_id } = req.body

  const final_asana_id = asana_id || transition_id

  if (final_asana_id === null || final_asana_id === undefined) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Transition ID not provided',
    })
  }

  try {
    const asanas = await TransitionVideo.findOne({
      transition_id: final_asana_id,
    })
    res.json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch video details',
    })
  }
})

router.delete('/video/deleteTransition/:id', async (req, res) => {
  const transitionID = req.params.id
  try {
    const del1 = await TransitionVideo.findOneAndDelete({
      transition_id: transitionID,
    })
    if (del1) {
      res.status(HTTP_OK).json({
        message: 'Transition deleted successfully',
      })
    } else {
      res.status(HTTP_NOT_FOUND).json({
        message: 'Transition not found',
      })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Transition',
    })
  }
})

router.put('/video/updateAsana/:asanaId', async (req, res) => {
  const { asanaId } = req.params
  const updatedData = req.body
  if (updatedData.asana_hls_url !== '') {
    const hlsDuration = getVideoDuration(updatedData.asana_hls_url)
    updatedData.duration = hlsDuration
  }
  try {
    const existingAsana = await Asana.findOne({ id: asanaId })
    if (!existingAsana) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'Asana not found' })
    }
    const mergedData = { ...existingAsana.toObject(), ...updatedData }
    const updatedAsana = await Asana.findOneAndUpdate(
      { id: asanaId },
      mergedData,
      {
        new: true,
      }
    )
    return res.json(updatedAsana)
  } catch (error) {
    console.error(error)
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update Asana',
    })
  }
})

router.delete('/video/deleteAsana/:asanaId', async (req, res) => {
  const { asanaId } = req.params
  try {
    const deletedAsana = await Asana.findOneAndDelete({ id: asanaId })
    if (deletedAsana) {
      res.status(HTTP_OK).json({ message: 'Asana deleted successfully' })
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: 'Asana not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete asana',
    })
  }
})

router.get('/video/getAllAsanas', async (req, res) => {
  try {
    const asanas = await Asana.find()
    res.status(200).json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

// router.get("/video/getAllAsanas", async (req, res) => {
//   try {
//     const asanas = await Asana.find();
//     for (let i = 0; i < asanas.length; i++) {
//       let asana = asanas[i];
//       if (
//         asana.asana_dash_url.includes(
//           // "https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev"
//           "https://videos.6amyoga.com"
//         )
//       ) {
//         asana.asana_dash_url = asana.asana_dash_url.replace(
//           "https://videos.6amyoga.com",
//           "https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev"
//           // "https://videos.6amyoga.com"
//         );
//         await asana.save();
//       }
//     }
//     res.status(200).json(asanas);
//   } catch (error) {
//     console.error(error);
//     res.status(HTTP_INTERNAL_SERVER_ERROR).json({
//       error: "Failed to fetch videos",
//     });
//   }
// });

router.get('/video/getNonTeacherAsanas', async (req, res) => {
  try {
    const asanas = await Asana.find({ teacher_mode: false })
    res.status(200).json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

router.get('/video/getTeacherAsanas', async (req, res) => {
  try {
    const asanas = await Asana.find({ teacher_mode: true })
    res.status(200).json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

router.post('/get-asana-by-id', async (req, res) => {
  const { asana_id } = req.body

  if (asana_id === null || asana_id === undefined) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Asana ID not provided',
    })
  }

  try {
    const asanas = await Asana.findOne({ id: asana_id })
    res.json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch video details',
    })
  }
})

router.get('/language/getAllLanguages', async (req, res) => {
  try {
    const languages = await Language.find()
    res.json(languages)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch languages',
    })
  }
})

router.post('/language/addLanguage', async (req, res) => {
  try {
    const requestData = req.body
    const maxLangID = await Language.findOne(
      {},
      {},
      { sort: { language_id: -1 } }
    )
    const newLangID = maxLangID ? maxLangID.language_id + 1 : 1
    requestData.language_id = newLangID
    const newLanguage = new Language(requestData)
    const savedLanguage = await newLanguage.save()
    res.status(200).json(savedLanguage)
  } catch (err) {
    console.error('Error saving new Language:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Language',
    })
  }
})

router.delete('/video/deleteLanguage/:languageId', async (req, res) => {
  const languageId = req.params.languageId
  try {
    const deletedLanguage = await Language.findOneAndDelete({
      language_id: languageId,
    })
    if (deletedLanguage) {
      res.status(HTTP).json({ message: 'Language deleted successfully' })
    } else {
      res.status(HTTP_NOT_FOUND).json({ message: 'Language not found' })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Language',
    })
  }
})

router.get('/asana/getAllAsanaCategories', async (req, res) => {
  try {
    const cats = await AsanaCategory.find()
    res.status(200).json(cats)
  } catch (error) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch categories',
    })
  }
})

router.post('/asana/addAsanaCategory', async (req, res) => {
  try {
    const requestData = req.body
    const maxId = await AsanaCategory.findOne(
      {},
      {},
      { sort: { asana_category_id: -1 } }
    )
    const newId = maxId ? maxId.asana_category_id + 1 : 1
    requestData.asana_category_id = newId
    const new1 = new AsanaCategory(requestData)
    const saved = await new1.save()
    res.status(200).json(saved)
  } catch (err) {
    console.error('Error saving new Asana Category:', error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to save new Asana Category',
    })
  }
})

router.delete('/asana/deleteAsanaCategory/:catId', async (req, res) => {
  const catId = req.params.catId
  try {
    const deleted = await AsanaCategory.findOneAndDelete({
      asana_category_id: catId,
    })
    if (deleted) {
      res.status(200).json({
        message: 'Asana Category deleted successfully',
      })
    } else {
      res.status(HTTP_NOT_FOUND).json({
        message: 'Asana Category not found',
      })
    }
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete Asana Category',
    })
  }
})

router.get('/video/deleteField', async (req, res) => {
  try {
    const asanas = await Asana.find()
    for (let i = 0; i < asanas.length; i++) {
      let asana = asanas[i]
      if (asana.asana_hls_url) {
        delete asana.asana_hls_url
        console.log(asana)
        await asana.save()
      } else {
        console.log('ahoy')
      }
    }
    res.json(asanas)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete field',
    })
  }
})

router.get('/video/updateAsanaDrm', async (req, res) => {
  try {
    let output = []
    const transitions = await Asana.find()
    for (const transition of transitions) {
      if (transition.hasOwnProperty('asana_hls_url')) {
        output.push(transition)
        await Asana.findByIdAndUpdate(transition._id, {
          $set: { asana_hls_url: '' },
        })
        transition.asana_hls_url = ''
      }
    }
    res.status(200).json(output)
  } catch (error) {
    console.error(error)
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch videos',
    })
  }
})

module.exports = router
