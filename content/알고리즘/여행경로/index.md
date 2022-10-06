---
title: 여행 경로
date: 2022-10-06
description: DFS/BFS
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/43164)

# 해결 전략

우리는 주어진 항공권을 모두 이용해야한다. 즉 항공권을 모두 사용하는 케이스를 탐색해야한다.
만일 가능한 경로가 2개 이상 있을 때, 알파벳 순서가 앞서는 경로를 리턴해야 하므로 BFS로 탐색하고 만족하는 값을 찾으면 탐색을 중지하도록 하겠다.

탐색하는 방법은 간단하다. 티켓 중에서 시작점이 마지막에 방문한 도시와 일치하는 티켓들을 찾고 알파벳 순서로 정렬 후 방문한다. 이 과정을 모든 티켓을 사용(방문)할 떄 까지 반복한다.

# 전체 코드

```javascript
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

//시작점이 마지막에 방문한 도시인 티켓들을 찾고, 알파벳 순서로 정렬하는 코드
const findMatchTickets = (start, tickets, visited) => {
  const result = []
  for (let i = 0; i < tickets.length; i++) {
    if (!visited[i] && tickets[i][0] === start) {
      result.push({ i, end: tickets[i][1] })
    }
  }
  result.sort((a, b) => (a.end > b.end) - (a.end < b.end))
  return result
}

function solution(tickets) {
  const visited = Array(tickets.length).fill(false)

  const queue = new Queue()
  queue.enqueue({ visited, path: ["ICN"] })

  while (queue.size() > 0) {
    const { visited, path } = queue.dequeue()
    if (visited.every(v => v)) return path

    const lastVisited = path[path.length - 1]
    const matchedTickets = findMatchTickets(lastVisited, tickets, visited)

    matchedTickets.forEach(({ i, end }) => {
      const newVistied = [...visited]
      newVistied[i] = true
      queue.enqueue({ visited: newVistied, path: [...path, end] })
    })
  }
}
```

# 추가

BFS가 아닌, DFS를 이용해도 문제를 해결할 수 있다. 다만 우리는 알파벳 순서가 앞서는 경로를 리턴해야 하므로 BFS와 동일하게 알파벳 순서가 앞서는 경로를 먼저 넣어주고, 만일 모든 티켓을 방문했다면 즉 정답을 찾았다면 DFS 탐색을 중지한다.

```javascript
const findMatchTickets = (start, tickets) => {
  const result = []
  for (let i = 0; i < tickets.length; i++) {
    if (tickets[i][0] === start) {
      result.push({ i, end: tickets[i][1] })
    }
  }
  result.sort((a, b) => (a.end > b.end) - (a.end < b.end))
  return result
}

function solution(tickets) {
  let answer = null

  function dfs(leftTickets, lastVisited, path) {
    if (answer) return
    if (leftTickets.length === 0) {
      answer = path
    }

    findMatchTickets(lastVisited, leftTickets).forEach(({ i, end }) => {
      dfs(
        leftTickets.filter((_, index) => index !== i),
        end,
        [...path, end]
      )
    })
  }
  dfs(tickets, "ICN", ["ICN"])
  return answer
}
```
