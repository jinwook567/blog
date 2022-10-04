---
title: 야근지수
date: 2022-10-04
description: 최대힙
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/12927)

# 해결 전략

초기에는 완전 탐색으로 접근해보았다. 하지만 n을 works에 분배하는 과정에서 무조건 시간 초과가 발생할 수 밖에 없다.

따라서 문제의 특성을 이용한 다른 접근 방법이 필요하다.
우리는 배열 내 요소의 제곱의 합의 최솟값을 구해야한다. 제곱의 그래프는 우측으로 이동할수록 급격히 증가하는 그래프 형태를 띄게 된다.

반대로 말하자면 좌측으로 이동할수록 급격히 감소한다는 의미이다. 우리는 최솟값을 구해야 하므로 감소하는 폭을 최대한 크게 만들어야 한다. 감소하는 폭을 최대한 크게 만들기 위해서는 배열 내에서 가장 큰 요소를 뽑아서 줄여주는 전략을 택하면 된다. 가장 큰 요소를 얼마나 줄여주느냐가 시간 복잡도에 큰 영향을 미친다.

내가 작성한 초기 알고리즘은 최댓값을 구하고, 최댓값보다 바로 작은 숫자만큼 빼주는 방식이였다. 하지만 이렇게 작성할 경우 배열 내 모든 원소가 최댓값과 같은 경우를 고려해줘야 하기 때문에 알고리즘이 복잡해진다.

최댓값을 구하고 최댓값과 n을 1씩 빼는 알고리즘을 사용한다면 간결하게 정답을 구할 수 있다. 하지만 n이 1,000,000이고 works 배열의 길이는 20,000이기 때문에 배열을 순회하면서 최댓값을 찾는 방식을 사용한다면 1,000,000 \* 20,000 으로 시간 복잡도를 초과하게 된다. 최댓값을 구할 때 우리는 최대힙을 사용한다면 log(20,000) 시간으로 최댓값을 구할 수 있고 시간 복잡도를 초과하지 않게 된다.

# 교훈

시간 복잡도를 기반으로 방법을 생각해내는 것도 좋지만, 문제의 특성에 따라 방법을 생각하고 시간 복잡도를 줄이는 방안도 생각해봐야 한다. (이진탐색, 우선순위 큐 등)

# 전체 코드

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

function solution(n, works) {
  const heap = new MaxHeap()
  works.forEach(v => heap.push(v))

  while (n > 0) {
    const max = heap.pop()
    n -= 1
    if (max === 0) return 0
    //만일 최댓값이 0이라면 해야할 일이 없다는 뜻으로 0을 리턴하고 함수를 종료한다.
    heap.push(max - 1)
  }
  return heap.heap.reduce((acc, cur) => acc + cur * cur, 0)
}
```

# 추가

재귀와 sort 메소드를 사용하는 방법을 생각해보았는데, sort 메소드의 경우 시간 복잡도가 NlogN이라서 효율성 테스트를 통과할 수 없었다. 코드는 아래와 같다.

```javascript
function solution(n, works) {
  function recursive(n, works) {
    if (n === 0) return works.reduce((acc, cur) => acc + cur * cur, 0)

    works.sort((a, b) => b - a)
    if (works[0] === 0) return 0

    works[0] -= 1
    return recursive(n - 1, works)
  }
  return recursive(n, works)
}
```
