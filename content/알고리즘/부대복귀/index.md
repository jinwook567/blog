---
title: 부대복귀
description: 다익스트라 알고리즘
date: 2022-11-22
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/132266)

# 해결 전략

위 문제는 한 노드에서 다른 노드의 최단거리 찾기 문제이다. 즉 다익스트라 알고리즘을 사용하면 문제를 해결할 수 있다.

다익스트라 알고리즘은 그리디 알고리즘의 일종인데 방문한 노드에서 최단거리를 가지는 노드를 찾는 알고리즘에서 시간 복잡도 차이가 발생한다.
노드의 방문 여부를 통해 최단거리를 찾는 알고리즘의 경우 모든 노드를 순회해야하므로 O(n^2)의 시간 복잡도를 가진다.
하지만 문제의 경우 n이 100,000으로 O(n^2)으로 해결할 수 없다.

이 때 힙을 사용하면 O(NlogN)의 시간 복잡도로 최단거리를 가지는 노드를 찾을 수 있다. 따라서 우선순위 큐를 활용해서 다익스트라 알고리즘을 사용하면 문제의 정답을 구할 수 있다.

이 문제의 경우 특이한 점이 하나 있다. 보통 노드간의 거리가 다른데 이 문제는 모든 노드 사이의 거리가 1이다. 따라서 사실 우선순위큐를 사용하지 않고 일반 큐를 사용해도 좋다. 그 이유는 모든 노드 사이의 거리가 1이므로 큐를 통해서 순차적으로 배출되는 노드가 최단거리를 가지는 노드임이 보장되기 때문이다. (+1씩 거리가 더해져서 큐에 들어가기 때문.)

# 정답 코드

## 우선순위 큐를 사용한 방식

```js
class PriorityQueue {
  constructor() {
    this.queue = []
  }

  swap(aIndex, bIndex) {
    const temp = this.queue[aIndex]
    this.queue[aIndex] = this.queue[bIndex]
    this.queue[bIndex] = temp
  }

  enqueue(priority, value) {
    const node = { priority, value }
    this.queue.push(node)

    let currentIndex = this.queue.length - 1
    let parentIndex = Math.floor((currentIndex - 1) / 2)

    while (
      parentIndex >= 0 &&
      this.queue[parentIndex].priority < this.queue[currentIndex].priority
    ) {
      this.swap(parentIndex, currentIndex)
      currentIndex = parentIndex
      parentIndex = Math.floor((currentIndex - 1) / 2)
    }
  }

  dequeue() {
    if (this.queue.length === 0) return undefined
    if (this.queue.length === 1) return this.queue.pop()

    const root = this.queue[0]
    const end = this.queue.pop()
    this.queue[0] = end

    let currentIndex = 0
    let leftIndex = 1
    let rightIndex = 2

    while (
      (this.queue[leftIndex] &&
        this.queue[currentIndex].priority < this.queue[leftIndex].priority) ||
      (this.queue[rightIndex] &&
        this.queue[currentIndex].priority < this.queue[rightIndex].priority)
    ) {
      if (
        !this.queue[rightIndex] ||
        this.queue[leftIndex].priority > this.queue[rightIndex].priority
      ) {
        this.swap(currentIndex, leftIndex)
        currentIndex = leftIndex
      } else {
        this.swap(currentIndex, rightIndex)
        currentIndex = rightIndex
      }
      leftIndex = currentIndex * 2 + 1
      rightIndex = currentIndex * 2 + 2
    }
    return root
  }

  size() {
    return this.queue.length
  }
}

function solution(n, roads, sources, destination) {
  const distance = Array(n + 1).fill(1000001)
  const visited = Array(n + 1).fill(false)

  const graph = Array(n + 1)
    .fill()
    .map(_ => [])

  roads.forEach(([start, end]) => {
    graph[start].push(end)
    graph[end].push(start)
  })

  const priorityQueue = new PriorityQueue()

  distance[destination] = 0
  priorityQueue.enqueue(0, destination)

  while (priorityQueue.size() > 0) {
    const { priority: dist, value: node } = priorityQueue.dequeue()
    if (d[node] > -dist) continue

    graph[node].forEach(end => {
      distance[end] = Math.min(distance[end], distance[node] + 1)
      if (distance[end] === distance[node] + 1) {
        priorityQueue.enqueue(-distance[end], end)
      }
    })
  }
  return sources.map(v => {
    return distance[v] === 1000001 ? -1 : distance[v]
  })
}
```

## 일반 큐를 사용한 방식

```js
class Queue {
  constructor() {
    this.front = 0
    this.rear = 0
    this.queue = []
  }

  enqueue(data) {
    this.queue[this.rear++] = data
  }

  dequeue() {
    const value = this.queue[this.front]
    delete this.queue[this.front]
    this.front++
    return value
  }

  size() {
    return this.rear - this.front
  }
}

function solution(n, roads, sources, destination) {
  const graph = Array(n + 1)
    .fill()
    .map(_ => [])

  roads.forEach(([start, end]) => {
    graph[start].push(end)
    graph[end].push(start)
  })

  const distance = Array(n + 1).fill(Infinity)
  const queue = new Queue()
  queue.enqueue(destination)

  distance[destination] = 0

  while (queue.size() > 0) {
    const node = queue.dequeue()
    graph[node].forEach(end => {
      distance[end] = Math.min(distance[end], distance[node] + 1)
      if (distance[end] === distance[node] + 1) {
        queue.enqueue(end)
      }
    })
  }

  return sources.map(v => {
    return distance[v] === Infinity ? -1 : distance[v]
  })
}
```
