---
title: 택배 배달과 수거하기
date: 2023-02-09
description: 그리디
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/150369)

# 해결 전략

우리가 구해야 하는 것은 트럭의 최소 이동 거리이다.
트럭이 최소의 거리로 모든 상자를 배달하고 수거하기 위해서는, 출발지로부터 가장 거리가 먼 집부터 처리해야한다.

출발지로부터 가장 거리가 먼 집부터 처리하는 이유는, 짧은 거리는 긴 거리에 포함이 되기 때문에 짧은 거리에 있는 집을 먼저 처리해도 긴 거리에 있는 집을 가기 위해서는 동일한 루트를 반복해서 가야한다.
하지만 긴 거리에 있는 집부터 처리하면 반복해서 가야하는 루트를 줄일 수 있다.

그리고 배달과 수거는 병렬적으로 생각해도 좋다. 배달이든 수거든 가장 먼 도착지까지 갈 때, 배달을 완료하고 출발지로 돌아올 때 수거를 완료하면 된다.

배달과 수거를 가장 거리가 먼 집부터 완료하는 알고리즘을 설계하면 된다.

1. 배달이든 수거든 관계없이 해야할 가장 먼 집을 찾고, 해당 집까지의 거리\*2를 누적 거리에 더해준다.
2. 배열의 마지막 요소부터 cap의 한도 내에서 물건의 개수를 줄여준다. 배달과 수거 각각 수행한다.
3. 배열의 모든 요소가 0(더이상 배달과 수거를 할 필요가 없을 때)일 때까지 반복한다.

시간 복잡도를 생각해봐야 한다.

배열의 모든 요소를 순회하며 요소가 0인지 확인해보는 알고리즘은 최대 `100,000 * 100 * 100,000` 번 연산을 수행해야한다. (cap=1, n=100,000, delivers 모든 원소 50, pickups 모든 원소 50)

문제의 특성을 살펴보면, 가장 거리가 먼 집을 우선으로 방문함으로써 반복해서 가야하는 루트를 줄일 수 있다고 하였다.
그렇다면 가장 마지막 집의 위치 정보를 기억하고 있다면, 배열의 마지막 요소부터 물건의 개수를 줄이는 알고리즘의 시간 복잡도를 줄일 수 있다. (배열의 마지막 요소가 아닌, 기억하고 있는 위치부터 수행하면 되므로) 또한 마지막 집의 위치 정보가 배달과 수거 전부 0이라면 모든 배다과 수거를 완료한 것으로 생각할 수 있다. 이 방식은 시간 복잡도를 초과하지 않는다. `100,000 * 100`

# 정답 코드

```js
function process(arr, index, cap) {
  while (true) {
    if (index === 0) break;
    if (arr[index - 1] > 0 && cap === 0) break;

    if (cap >= arr[index - 1]) {
      cap -= arr[index - 1];
      arr[index - 1] = 0;
      index--;
    } else {
      arr[index - 1] -= cap;
      cap = 0;
    }
  }
  return index;
}

const getInitialLast = arr =>
  arr.reduce((acc, cur, index) => (cur > 0 ? index + 1 : acc), 0);

function solution(cap, n, deliveries, pickups) {
  let deliver_last = getInitialLast(delivers);
  let pickup_last = getInitialLast(pickups);
  let distance = 0;

  while (deliver_last > 0 || pickup_last > 0) {
    distance += Math.max(deliver_last, pickup_last) * 2;

    deliver_last = process(deliveries, deliver_last, cap);
    pickup_last = process(pickups, pickup_last, cap);
  }

  return distance;
}
```
