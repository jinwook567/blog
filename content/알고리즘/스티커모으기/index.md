---
title: 스티커 모으기
date: 2022-09-30
description: 다이나믹 프로그래밍
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/12971)

# 다이나믹 프로그래밍인 이유

문제의 해결 전략이 다이나믹 프로그래밍으로 도출되어야 하는 이유는 2가지이다.

1. 시간 복잡도를 줄여야 한다.
2. 작은 문제의 해답이 그것을 포함하는 큰 문제에서도 동일하다.

### 1. 시간 복잡도

스티커의 최대 길이는 100,000개이다. 만일 완전 탐색으로 어떤 스티커를 뜯었는지, 안뜯었는지 고려하여 구한다면 시간 복잡도는 최대 O(2^50000)으로 불가능하다.

### 2. 작은 문제의 해답이..

스티커 전체 배열이 `[1,3,5,6,4]`라고 가정해보자. 부분 배열 `[1,3,5]`가 있다고 하였을 때, 뽑을 수 있는 가장 최댓값인 5이다. 부분 배열 `[1,3,5,6]`에서 `[1,3,5]`의 최댓값은 5로 만족한다. 하지만 5를 뽑는 경우 6을 뽑을 수 없다. 따라서 이 부분 배열의 경우 3과 6을 뽑아야 최댓값이다. 3의 경우는 부분 배열 `[1,3]`의 최댓값이라고 할 수 있다. 현재에 해당되는 스티커를 뗀다면, 2번 째 전 부분 배열의 최댓값과 현재의 스티커 점수를 더한 것이고 떼지 않는다면 1번 째 전 부분 배열의 최댓값과 동일하다.

# 해결 전략

다이나믹 프로그래밍이라는 사실도 알아냈고 규칙도 찾았으니 점화식을 세워보도록 한다.

```
d[i] = max(d[i-2]+i번째 스티커점수, d[i-1])
(단, d[i]는 부분 배열 i까지의 최댓값을 의미한다.)
```

하지만 위 점화식은 맨 처음 스티커를 떼는 경우를 만족시키지 못한다. 맨 처음 스티커를 떼는 경우 맨 마지막 스티커도 제거 되어야 하기 때문이다. 따라서 맨 처음 스티커를 떼는 경우, 맨 처음 스티커를 떼지 않는 경우 2가지로 나눠서 문제를 풀어보도록 한다.

```
if (sticker.length <= 2) return Math.max(...sticker);
```

만일 스티커의 개수가 2개 이하라면, 배열 내의 최댓값을 리턴하면 된다. 맨 처음 스티커를 떼지 않는 경우를 고려할 때 스티커 배열의 3번째 요소에 접근하기 때문에 위와 같이 처리해준다.

```
const len = sticker.length;
const d = Array(len - 1).fill(0);

d[0] = sticker[0];
d[1] = d[0];
for (let i = 2; i < d.length; i++) {
    d[i] = Math.max(d[i - 2] + sticker[i], d[i - 1]);
}

const max_first = Math.max(...d);
```

첫 번째 스티커를 뜯어냈을 경우 코드는 위와 같다. `d[1] = d[0]`인 이유는 `d[1]`의 경우 스티커를 뜯어낼 수 없기 떄문에 `d[0]`의 값과 동일하게 넣어주어야 한다.

```
  const d2 = Array(len - 1).fill(0);
  d2[0] = sticker[1];
  d2[1] = Math.max(d2[0], sticker[2]);

  for (let i = 2; i < d.length; i++) {
    d2[i] = Math.max(d2[i - 2] + sticker[i + 1], d2[i - 1]);
  }
  const max_second = Math.max(...d2);

  return Math.max(max_first, max_second);

```

첫 번째 스티커를 뜯어내지 않았을 경우 코드는 위와 같다. 첫 번째 스티커를 뜯지 않았기 때문에(제외시켰기 떄문에) 테이블은 스티커의 첫 번째 요소에서부터 시작하도록 한다. 그리고 `d2[1]`의 경우 만일 `sticker[2]`의 크기가 `d2[0]`의 크기보다 크다면, `sticker[2]`를 뜯는게 더 값이 크기 때문에 둘 중 큰 값을 가지도록 한다.

# 전체 코드

```
function solution(sticker) {
  if (sticker.length <= 2) return Math.max(...sticker);

  const len = sticker.length;
  const d = Array(len - 1).fill(0);

  d[0] = sticker[0];
  d[1] = d[0];
  for (let i = 2; i < d.length; i++) {
    d[i] = Math.max(d[i - 2] + sticker[i], d[i - 1]);
  }
  const max_first = Math.max(...d);

  const d2 = Array(len - 1).fill(0);
  d2[0] = sticker[1];
  d2[1] = Math.max(d2[0], sticker[2]);

  for (let i = 2; i < d.length; i++) {
    d2[i] = Math.max(d2[i - 2] + sticker[i + 1], d2[i - 1]);
  }
  const max_second = Math.max(...d2);

  return Math.max(max_first, max_second);
}
```
