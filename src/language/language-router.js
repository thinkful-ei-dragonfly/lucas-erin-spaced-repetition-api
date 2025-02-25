const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()
const bodyParser = express.json()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.user.id
      )
      res.json({
        nextWord: head.original,
        wordCorrectCount: head.correct_count,
        wordIncorrectCount: head.incorrect_count,
        totalScore: head.total_score
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {
    try{
      const { guess } = req.body;
      if(!guess){
        return res.status(400).json({
          error: `Missing 'guess' in request body`
        })
      }

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )

      const ll = LanguageService.populateLinkedList(
        req.language,
        words
      )


      const node = ll.head
      const answer = ll.head.value.translation


      let isCorrect

      if (guess.toLowerCase() === answer.toLowerCase()) {
        isCorrect = true
        if(parseInt(node.value.memory_value, 10) === ll.listNodes().length -1){
          ll.head.value.memory_value = parseInt(node.value.memory_value, 10)
        } else if (parseInt(node.value.memory_value, 10) * 2 > ll.listNodes().length -1) {
          ll.head.value.memory_value = ll.listNodes().length -1
        } else {
          ll.head.value.memory_value = parseInt(node.value.memory_value, 10) * 2
        }
        ll.head.value.correct_count = parseInt(ll.head.value.correct_count, 10) + 1
        ll.total_score++
      } else {
        isCorrect = false
        ll.head.value.memory_value = 1
        ll.head.value.incorrect_count++
      }

      ll.moveHeadBy(ll.head.value.memory_value)

      await LanguageService.persistLinkedList(
        req.app.get('db'),
        ll
      )

      return res
        .status(200)
        .json({
          nextWord: ll.head.value.original,
          wordCorrectCount: ll.head.value.correct_count,
          wordIncorrectCount: ll.head.value.incorrect_count,
          totalScore: ll.total_score,
          answer,
          isCorrect
        })
    }
    catch(error){
      console.log(error)
    }
  })

module.exports = languageRouter
