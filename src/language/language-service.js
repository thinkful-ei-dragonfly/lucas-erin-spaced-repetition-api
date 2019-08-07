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
  
  getLanguageHead(db, user_id) {
    return db
      .from('language')
      .where('language.user_id', user_id)
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

    // console.log('LangHead:',language.head);  // <-- just testing during development

    let word = words.find(w => w.id === language.head)

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

    // console.log(JSON.stringify(ll, null, 2));
    return ll

  },
  updateTotalScore(ll){
    let currentNode = ll.head;
    let totalScore = ll.head.value.correct_count

    while(currentNode.next !== null){
      currentNode = currentNode.next;
      totalScore+= currentNode.value.correct_count
    }

    return totalScore;
  },

  display(ll){
    let result = [];
    let currentNode = ll.head;
    while(currentNode !== null){
      result.push(currentNode);
      currentNode = currentNode.next;
    }
    return result;
  },
  persistLinkedList(db, linkedList) {
    //   let nodeArray = this.display(linkedList)
    console.log('LIST-LENGTH',linkedList.listNodes().length);
    return db.transaction(trx =>
      Promise.all([
        db('language')
          .transacting(trx)
          .where('id', linkedList.id)
          .update({
            total_score: linkedList.total_score,
            head: linkedList.head.value.id,
          }),
      //         nodeArray.forEach(node =>
        ...linkedList.forEach(node =>
          db('word')
            .transacting(trx)
            .where('id', node.value.id)
            .update({
              memory_value: node.value.memory_value,
              correct_count: node.value.correct_count,
              incorrect_count: node.value.incorrect_count,
              next: node.next ? node.next.value.id : null,
            })
        )
      ])
    )

  }
}

module.exports = LanguageService
