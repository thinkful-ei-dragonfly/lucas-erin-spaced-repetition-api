class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next
  }
}

class LinkedList {
  constructor() {
    this.head = null
  },
  insertFirst(item) {
    this.head = new _Node(item, this.head)
  },
  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item)
    }
    else {
      let tempNode = this.head
      while (tempNode.next !== null) {
        tempNode = tempNode.next
      }
      tempNode.next = new _Node(item, null)
    }
  },
  find(item) {
    let currNode = this.head

    // if this list is empty
    if (!this.head) {
      return null
    }

    while (currNode.value !== item) {
      // keep looking until we find a match
      if (currNode.next === null) {
        // we've reached the end
        // without a match
        return null
      }
      else {
        // keep going
        currNode = currNode.next
      }
    }
    return currNode
  },
  remove(item) {
    // if it's empty
    if (!this.head) {
      return null
    }
    // if the node to be removed is the head
    if (this.head.value === item) {
      this.head = this.head.next
      return
    }
    // start at the head
    let currNode = this.head
    let prevNode = this.head
    while ((currNode !== null) && (currNode.value !== item)) {
      prevNode = currNode
      currNode = currNode.next
    }
    if (currNode === null) {
      console.log('Item not found');
      return
    }
    prevNode.next = currNode.next
  }
}
