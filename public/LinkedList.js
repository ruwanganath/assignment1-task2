// class to define the node 
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// class to define the linked list
class LinkedList {
  constructor() {
    this.head = null;
    this.count = 0;
  }

  addToList(data) {

    let node = new ListNode(data);

    if (this.head === null) {
      this.head = node;
    } else {
      let currentNode = this.head;

      while (currentNode.next !== null) {
        currentNode = currentNode.next;
      }
      currentNode.next = node;
    }
    this.count++;
  }

  removeFromList(data){

    let currentNode = list.head;
    let previousNode
    if(currentNode.data === data){
      head = currentNode.next;
    } else {
      while(currentNode.data !== data) {
        previousNode = currentNode;
        currentNode = currentNode.next;
      }
      previousNode.next = currentNode.next;
    }
    this.count--;
  }

}

module.exports = LinkedList;