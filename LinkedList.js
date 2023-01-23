class NodeLinkedList {
  constructor(value, next = null, prev = null) {
    this.prev = prev
    this.value = value
    this.next = next
  }
}

export class LinkedList {
  #firstElement = null
  #lastElement = null
  #length = 0
  #stringify = null

  get firstElement() {
    return this.#firstElement?.value || null
  }

  get lastElement() {
    return this.#lastElement?.value || null
  }

  get length() {
    return this.#length
  }

  set stringify(stringifyFn) {
    if (typeof stringifyFn === 'function')
      if (typeof stringifyFn(Math.random()) === 'string') 
        this.#stringify = stringifyFn
  }

  constructor(stringifyFn = null) {
    if (stringifyFn) this.stringify = stringifyFn
    
    Object.defineProperties(this, {
      firstElement: {
        get() { return this.#firstElement?.value || null },
        enumerable: true
      },
      lastElement: {
        get() { return this.#lastElement?.value || null },
        enumerable: true
      },
      length: {
        get() { return this.#length; },
        enumerable: true
      }
    })
  }

  #getNode(position) {
    if (!Number.isInteger(position)) {
      console.warn('Argument "position" must be integer')
      return
    }
    if (position >= 0 && position < this.length) {
      let i = this.#length - 1 
      if (position >= Math.ceil(i/2)) {
        let node = this.#lastElement
        while(i !== position) {
          node = node.prev
          i--
        }
        return node
      } else {
        let i = 0
        let node = this.#firstElement
        while(i !== position) {
          node = node.next
          i++
        }
        return node
      }
    }
    return undefined
  }

  show(position) {
    const node = this.#getNode(position)
    if (node) return node.value
    else return undefined
  }

  add(value) {
    if (value == null) 
      return this

    if (typeof value === 'string' && value.trim() === '') {
      console.warn("Value cannot be empty")
      return this
    }

    if (this.#firstElement === null) {
      const node = new NodeLinkedList(value)
      this.#firstElement = node
      this.#lastElement = this.#firstElement
    } else {
      const node = new NodeLinkedList(value, null, this.#lastElement)
      this.#lastElement.next = node
      this.#lastElement = node
    }
    this.#length++

    return this
  }

  insertBefore(position, value) {
    const node = this.#getNode(position)
    if (node) {
      const newNode = new NodeLinkedList(value)
      newNode.prev = node.prev
      newNode.next = node
      newNode.next.prev = newNode
      if (newNode.prev) newNode.prev.next = newNode
      else this.#firstElement = newNode
      this.#length++
      return this
    } else {
      console.warn(`There is no node at index ${position}`)
    }
  }

  #deleteNode(node) {
    const prev = node.prev
    const next = node.next
    if (next) next.prev = prev || null
    if (prev) prev.next = next || null
    if (!next) this.#lastElement = prev
    if (!prev) this.#firstElement = next
    this.#length--
    return [prev, next]
  }

  #privateRemove(position, nodeRef = null) {
    const node = nodeRef || this.#getNode(position)
    if (node) {
      this.#deleteNode(node)
    } else {
      console.warn(`There is no node at index ${position}`)
    }
    return node
  }

  remove(position) {
    const node = this.#privateRemove(position)
    if (node) return node.value
  }

  addMany(array) {
    if (!Array.isArray(array) || !array.length) {
      const msg = 'The argument passed in the LinkedList.addMany() method must be an Array and cannot be empty'
      console.warn(msg)
    } else {
      array.forEach(e => this.add(e))
      return this
    }
  }

  #privateInsertManyBefore(position, array, nodeRef = null) {
    if (!Array.isArray(array) || !array.length) {
      const msg = 'The argument passed in the LinkedList.insertManyBefore() method must be an Array and cannot be empty'
      console.warn(msg)
    } else {
      let node = nodeRef || this.#getNode(position)
      if (node) {
        let i = array.length
        while(i--) {
          const newNode = new NodeLinkedList(array[i])
          newNode.prev = node.prev
          newNode.next = node
          newNode.next.prev = newNode
          if (newNode.prev) newNode.prev.next = newNode
          else this.#firstElement = newNode
          this.#length++
          node = newNode
        }
        return node // last node added
      } else {
        console.warn(`There is no node at index ${position}`)
      }
    }
  }

  insertManyBefore(position, array) {
    const hadItemAdded = this.#privateInsertManyBefore(position, array)
    if (hadItemAdded) return this
  }

  list(start, end) {
    const lastIndex = this.#length - 1
    if (
      end > start &&
      end <= lastIndex && 
      start >= 0
    ) {
      let i = (end - start) + 1
      const arr = new Array(i)
      if ((lastIndex - end) <= start) {
        let node = this.#getNode(end)
        while(i--) {
          arr[i] = node.value
          node = node.prev
        }
      } else {
        let node = this.#getNode(start)
        let j = 0
        while(j < i) {
          arr[j] = node.value
          node = node.next
          j++
        }
      }
      return arr
    } else {
      const msg = 'The "start" argument in LinkedList.list() must be greater than or equal to zero and less than the "end" argument, and the "end" argument must be less than or equal to the last index'
      console.warn(msg)
    }
  }

  #privateRemoveMany(start, end, nodeRef = null) {
    const lastIndex = this.#length - 1
    if (
      end > start &&
      end <= lastIndex && 
      start >= 0
    ) {
      let i = (end - start) + 1
      const removed = new Array(i)
      let lastNodeRemoved = null
      if ((lastIndex - end) <= start) {
        let node = nodeRef || this.#getNode(end)
        while(i--) {
          const prev = this.#deleteNode(node)[0]
          removed[i] = node
          node = prev
        }
        lastNodeRemoved = removed[(end - start)]
      } else {
        let node = nodeRef || this.#getNode(start)
        let j = 0
        while(j < i) {
          const next = this.#deleteNode(node)[1]
          removed[j] = node
          node = next
          j++
        }
        lastNodeRemoved = removed[(end - start)]
      }
      return [removed.map(node => node.value), lastNodeRemoved]
    } else {
      const msg = 'The "start" argument in LinkedList.removeMany() must be greater than or equal to zero and less than the "end" argument, and the "end" argument must be less than or equal to the last index'
      console.warn(msg)
    }
  }

  removeMany(start, end) {
    const removed = this.#privateRemoveMany(start, end)
    if (removed) return removed[0]
  }

  splice(idx, deleteCount, itemOrArrayItemsToAdd = null, startAfter = false, circulate = false) {
    if (typeof startAfter !== 'boolean' || typeof circulate !== 'boolean') {
      if (startAfter !== 0 && startAfter !== 1) {
        console.warn('Argument "startAfter" must be a boolean or 0 or 1')
        return
      }
      if (circulate !== 0 && circulate !== 1) {
        console.warn('Argument "circulate" must be a boolean or 0 or 1')
        return
      } 
    }

    let itemsToAdd = []

    if (Array.isArray(itemOrArrayItemsToAdd)) {
      if (!itemOrArrayItemsToAdd.length) {
        console.warn(`There must be at least one item in the array to be added`)
        return
      } 
      else itemsToAdd = itemOrArrayItemsToAdd
    } 
    else if (itemOrArrayItemsToAdd) 
      itemsToAdd.push(itemOrArrayItemsToAdd)

    let id = idx < 0 ? this.length + idx : idx

    if (deleteCount < 0) {
      id = startAfter ? id-1 : id
      let position = id + deleteCount + 1
      if (position < 0) {
        const endToBack = this.#length + position
        position = 0
        if (circulate) {
          if (endToBack <= id) {
            this.reset()
          } else {
            const lastIdx = this.#length - 1
            if (id === position) this.remove(id)
            else this.removeMany(position, id)
            if (endToBack === lastIdx) this.remove(endToBack-id-1)
            else this.removeMany(endToBack-id-1, lastIdx-id-1)
          }
          if (itemsToAdd.length) this.addMany(itemsToAdd) 
          return this
        }
      }
      if (id < 0) {
        console.warn(`There is no node at index ${id}`)
        return
      }
      let lastNodeRemoved = null
      if (position === id) lastNodeRemoved = this.#privateRemove(id)
      else lastNodeRemoved = this.#privateRemoveMany(position, id)[1]

      if (itemsToAdd.length) {
        if (lastNodeRemoved?.next)
          this.#privateInsertManyBefore(position, itemsToAdd, lastNodeRemoved.next)
        else this.addMany(itemsToAdd)
      }
      return this
    }

    id = startAfter ? id+1 : id
    if (id > this.#length) {
      console.warn(`There is no node at index ${id-1}`)
      return
    }

    if (deleteCount === 0) {
      if (itemsToAdd.length) {
        if (id === this.#length) this.addMany(itemsToAdd)
        else this.insertManyBefore(id, itemsToAdd) 
        return this
      } 
    }

    if (deleteCount > 0) {
      const lastIdx = this.#length - 1
      let lastIdxToDelete = id + deleteCount - 1
      if (lastIdxToDelete >= this.#length)  {
        if (circulate) {
          lastIdxToDelete -= this.#length
          if (lastIdxToDelete >= id) {
            this.reset()
            if (itemsToAdd.length) this.addMany(itemsToAdd)
          } else {
            if (id === lastIdx) this.remove(id)
            else this.removeMany(id, lastIdx)
            let lastNodeRemoved = null
            if (lastIdxToDelete === 0) lastNodeRemoved = this.#privateRemove(0)
            else lastNodeRemoved = this.#privateRemoveMany(0, lastIdxToDelete)[1]
            if (itemsToAdd.length) this.#privateInsertManyBefore(1, itemsToAdd, lastNodeRemoved.next)
          }
          return this
        } else lastIdxToDelete = lastIdx
      }

      if (id > lastIdx) {
        console.warn(`There is no node at index ${id}`)
        return
      }
      let lastNodeRemoved = null
      if (id === lastIdxToDelete) lastNodeRemoved = this.#privateRemove(id)
      else lastNodeRemoved = this.#privateRemoveMany(id, lastIdxToDelete)[1]

      if (itemsToAdd.length) {
        if (lastNodeRemoved?.next) 
          this.#privateInsertManyBefore(idx, itemsToAdd, lastNodeRemoved.next) 
        else this.addMany(itemsToAdd)
      } 
      return this
    }
  }

  listAll() {
    if (!this.length) return []
    const arr = new Array(this.length)
    let node = this.#lastElement
    let i = this.#length
    while(i--) {
      arr[i] = node.value
      node = node.prev
    }
    return arr
  }

  reset() {
    this.#firstElement = null
    this.#lastElement = null
    this.#length = 0

    return this
  }

  toString(separator = '<->') {
    if (typeof separator !== 'string') {
      console.warn('Type of "separator" argument must be string')
      return
    }

    if (!this.#length) 
      return '[empty LinkedList object]'

    const stringify = this.#stringify || JSON.stringify
    let node = this.#lastElement
    let i = this.#length
    let res = ''
    while(i--) {
      res += separator + stringify(node.value)
      node = node.prev
    }

    return res.slice(separator.length)
  }

  valueOf() {
    if (!this.length) 
      return 'LinkedList ' + JSON.stringify(this)

    if (this.#stringify) 
      return 'LinkedList ' + this.#stringify({...this.listAll()})
    
    return 'LinkedList ' + JSON.stringify({...this.listAll()})
  }
}
