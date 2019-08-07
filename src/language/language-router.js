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
        req.app.get('db')
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

    // res.send('implement me!')
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

      // return res.status(200).send(words)
      const ll = LanguageService.populateLinkedList(
        req.language,
        words
      )

      const newLL = LanguageService.spacedRepetitionAlgorithm(ll, guess)
      return res
        .status(200)
        .send(newLL)
        // .send({
        //   "nextWord": "test-next-word-from-correct-guess",
        //   "wordCorrectCount": 111,
        //   "wordIncorrectCount": 222,
        //   "totalScore": 333,
        //   "answer": "test-answer-from-correct-guess",
        //   "isCorrect": true
        // })
    }
    catch(error){
      console.log(error)
    }
    // res.send('implement me!')
  })

module.exports = languageRouter
