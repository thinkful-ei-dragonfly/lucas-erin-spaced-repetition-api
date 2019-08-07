const LinkedList = require('./LinkedList')

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },
  getLanguageHead(db) {
    return db
      .from('language')
      .innerJoin('word', 'language.head', 'word.id')
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  populateLinkedList(language, words) {
    const ll = new LinkedList()
    ll.id = language.id
    ll.name = language.name
    ll.total_score = language.total_score

    console.log('LangHead:',language.head);  // <-- just testing during development

    let word = words.find(w => w.id === language.id)

    ll.insertFirst({
      id: word.id,
      original: word.original,
      translation: word.translation,
      memory_value: word.memory_value,
      correct_count: word.correct_count,
      incorrect_count: word.incorrect_count
    })

    while (word.next) {
      word = words.find(w => w.id === word.next)

      ll.insertLast({
        id: word.id,
        original: word.original,
        translation: word.translation,
        memory_value: word.memory_value,
        correct_count: word.correct_count,
        incorrect_count: word.incorrect_count
      })
    }

    console.log(JSON.stringify(ll, null, 2));
    return ll

  }
}

module.exports = LanguageService
