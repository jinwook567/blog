---
title: 섬 연결하기
date: 2022-10-09
description: 크루스칼 알고리즘
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/42861)

# 해결 전략

최소의 비용으로 모든 섬이 통행 가능하도록 만들 때, 필요한 최소 비용을 구하라는 문제이다.
모든 섬이 통행 가능하도록 이란 의미는 신장 트리를 만족해야 하고, 최소 비용을 구해야 하기 때문에 최소 신장 트리 구조를 만족해야 한다. 크루스칼 알고리즘은 최소 신장트리를 만족하면서 최소 거리를 구할 수 있는 알고리즘이다.

# 정답 코드

```js
function solution(n, costs) {
  costs.sort((a, b) => a[2] - b[2])

  const parent = Array(n + 1)
    .fill()
    .map((_, i) => i)

  const findParent = (parent, x) => {
    if (parent[x] !== x) {
      parent[x] = findParent(parent, parent[x])
    }
    return parent[x]
  }

  const union = (parent, a, b) => {
    a = findParent(parent, a)
    b = findParent(parent, b)
    if (a === b) return true
    //사이클이 발생한다면 수행하지 않음.
    if (a > b) {
      parent[a] = b
    } else {
      parent[b] = a
    }
    return false
  }

  let sum = 0
  costs.forEach(([st, end, cost]) => {
    const cycle = union(parent, st, end)
    if (!cycle) sum += cost
  })
  return sum
}
```
