---
title: 이중우선순위큐
date: 2022-10-06
description: 힙, 정렬
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/42628)

# 해결 전략

이 문제의 operation은 최대 1,000,000이다. 따라서 최댓값, 최솟값을 제거해주기 위해서 굳이 힙을 사용하지 않고도 정렬을 사용해도 좋다. sort 메소드를 사용한다면 O(NlogN)으로 문제를 해결할 수 있다.
shift 메소드의 경우 O(N)의 시간이 소모되므로, 매번 정렬을 수행하는 것보다 shift 메소드를 사용하는 것이 더 빠르다. 따라서 작성한 알고리즘은 아래와 같다.

# 전체 코드

```javascript
function solution(operations) {
  const arr = []
  operations.forEach(v => {
    const [command, strNum] = v.split(" ")
    const num = Number(strNum)
    if (command === "I") {
      arr.push(num)
      arr.sort((a, b) => a - b)
    }

    if (command === "D") {
      if (num === -1) {
        arr.shift()
      } else {
        arr.pop()
      }
    }
  })

  return arr.length === 0 ? [0, 0] : [arr[arr.length - 1], arr[0]]
}
```

# 추가

문제의 이름이 이중우선순위큐인 만큼 한번 힙을 이용해서 문제를 해결해보도록 하겠다.

새롭게 최대힙과 최소힙 기능을 하는 이중우선순위큐를 정의하는 것은 복잡하기에 최대힙, 최소힙 2개의 자료구조를 이용해서 문제를 해결하도록 한다.

최대힙을 정의하고, 최소힙은 최대힙을 이용해서 구현한다. 최소힙의 경우 요소를 넣을 때 음의 형태로 변환해서 넣어준다.

우리는 2개의 힙을 사용하지만, 하나의 배열로 생각할 수 있다. 그 이유는 최대힙은 최댓값을 배출하고, 최소힙은 최솟값을 배출하기 때문이다. 오름차순으로 배열이 정렬되어있다고 가정하면, 최대힙은 오른쪽에서부터 하나씩 제거되고 최소힙은 왼쪽에서부터 하나씩 제거해나간다고 할 수 있다. 따라서 우리가 고려해주어야 하는 시점은, 최대힙에서 배출하는 요소가, 최소힙에서 배출하는 요소와 동일할 때이다. 즉 하나의 배열이라고 생각했을 때 배열의 원소가 1개만 있을 때이다. 이 때의 경우 2개의 힙을 빈 배열로 초기화 시켜주면 된다. 초기화 시켜주지 않는다면 힙에 원소가 남게되고 이는 다른 결과를 초래할 수 있다. 배열의 원소가 1개 남았는지 파악하기 위해서 `heapCnt`라는 변수를 사용한다.

구현한 코드는 아래와 같다.

```javascript
class MaxHeap {
  constructor() {
    this.heap = []
  }

  swap(aIndex, bIndex) {
    ;[this.heap[aIndex], this.heap[bIndex]] = [
      this.heap[bIndex],
      this.heap[aIndex],
    ]
  }

  push(value) {
    this.heap.push(value)
    let currentIndex = this.heap.length - 1
    let parentIndex = Math.floor((currentIndex - 1) / 2)

    while (parentIndex >= 0 && this.heap[parentIndex] < value) {
      this.swap(parentIndex, currentIndex)
      currentIndex = parentIndex
      parentIndex = Math.floor((currentIndex - 1) / 2)
    }
  }

  pop() {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()

    const root = this.heap[0]
    const end = this.heap.pop()
    this.heap[0] = end

    let currentIndex = 0
    let leftIndex = 1
    let rightIndex = 2

    while (
      this.heap[currentIndex] < this.heap[leftIndex] ||
      this.heap[currentIndex] < this.heap[rightIndex]
    ) {
      if (this.heap[leftIndex] < this.heap[rightIndex]) {
        this.swap(currentIndex, rightIndex)
        currentIndex = rightIndex
      } else {
        this.swap(currentIndex, leftIndex)
        currentIndex = leftIndex
      }
      leftIndex = currentIndex * 2 + 1
      rightIndex = currentIndex * 2 + 2
    }
    return root
  }
}

function solution(operations) {
  let heapCnt = 0
  const maxHeap = new MaxHeap()
  const minHeap = new MaxHeap()

  operations.forEach(v => {
    const [command, number] = v.split(" ")
    if (command === "I") {
      maxHeap.push(Number(number))
      minHeap.push(-Number(number))
      heapCnt++
    }

    if (command === "D") {
      if (heapCnt === 0) return
      heapCnt--
      if (Number(number) === -1) {
        minHeap.pop()
      } else {
        maxHeap.pop()
      }
      if (heapCnt === 0) {
        minHeap.heap = []
        maxHeap.heap = []
      }
    }
  })

  if (heapCnt === 0) return [0, 0]
  return [maxHeap.pop(), -minHeap.pop()]
}
```
