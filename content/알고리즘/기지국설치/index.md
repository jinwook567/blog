---
title: 기지국 설치
date: 2022-10-12
description: 투포인터
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/12979)

# 해결 전략

이 문제는 아이디어로 푸는 문제이다.

**우리가 구하고자 하는 값은 추가적으로 설치된 기지국의 개수이다.** 즉, 기지국이 어디에 설치되는지는 알 필요가 없다는 의미이다.

작은 예시를 통해서 설치해야 할 기지국 개수를 알아본다. 만일 기지국이 전혀 없는 4개의 아파트가 있다고 가정하고, 전파 도달 거리가 1이라면 몇 개의 기지국 설치가 필요할까?

1개의 기지국이 차지하는 영역은 본인의 자리 + 앞 뒤로 w 만큼이다. 즉 `2*w+1`의 길이만큼 차지하게 된다. 위의 예시의 경우 총 2개의 기지국 설치가 필요하다. 기지국의 영역이 4를 넘어가기는 하지만, 전체 영역을 채워야 하기에 2개가 필요하다. `3 * 2 > 4`

문제에서는 기지국이 설치된 `stations` 배열이 주어진다. **추가적으로 기지국을 설치해야 할 부분은 설치된 기지국들이 포함하지 못하는 기지국이 전혀 없는 영역이다.**

우리는 방금 예시를 통해서 기지국이 전혀 없는 영역에서 몇개의 기지국을 설치해야 하는지 알게되었다. 그렇다면 이제 필요한 것은 기지국이 전혀 없는 영역을 구하는 것이다.

기지국이 전혀 없는 영역을 구하기 위해서는 투포인터 알고리즘을 사용하면 된다.

```
before = 이전 기지국의 전파가 도달하지 않는 우측 위치.
current = 현재 기지국의 전파가 마지막으로 도달하는 좌측 위치.
```

또한 가장 중요한 부분은 포인터에 넣을 위치를 기지국이 마지막으로 포함하는 거리인지, 아니면 바로 못미치는 영역인지 정의해주어야 한다.

나는 기지국이 처음 시작할 때의 환경을 고려하여 `before` 변수에는 기지국이 존재하지 않는 상태의 위치, `current` 변수에는 기지국이 마지막으로 포함하는 거리로 넣어주었다.

```js
let current = 1
let before = 1

let answer = 0
const area = w => w * 2 + 1

for (let i = 0; i < stations.length; i++) {
  current = stations[i] - w

  const diff = current - before

  if (diff > 0) {
    answer += Math.ceil(diff / area(w))
  }

  before = stations[i] + w + 1
}
```

마지막 라인에 `before`변수를 `stations[i] + w + 1`로 초기화 시켜준 이유는 i번째 기지국이 이제 이전 기지국이 되었으며 `stations[i] + w + 1`이 전파가 도달하지 않는 우측 위치이다.

```js
if (before <= n) {
  answer += Math.ceil((n - before + 1) / area(w))
}
```

마지막으로 위의 코드가 필요하다. 왜냐면 마지막 기지국이 n까지 전파가 닿지 않는다면 해당 부분을 채워주어야 하기 때문이다. 여기서 n은 기지국이 설치되어 있지 않는 상태이기 때문에 `before <=n`으로 작성했으며 `n-before+1`을 한 값을 `area(w)`로 나누었다.

# 전체 코드

```js
function solution(n, stations, w) {
  let current = 1
  let before = 1

  let answer = 0
  const area = w => w * 2 + 1

  for (let i = 0; i < stations.length; i++) {
    current = stations[i] - w

    const diff = current - before

    if (diff > 0) {
      answer += Math.ceil(diff / area(w))
    }

    before = stations[i] + w + 1
  }

  if (before <= n) {
    answer += Math.ceil((n - before + 1) / area(w))
  }
  return answer
}
```
