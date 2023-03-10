---
title: 미로탈출명령어
date: 2023-03-10
description: 그리디
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/150365)

간만에 알고리즘을 푼다. 알고리즘은 역시 재밌는 것 같다.  
카카오 문제를 풀어봤는데, 그렇게 어렵지는 않았다. 작년 하반기에 카카오 공채를 응시하지 못한 것이 매우 아쉬울 따름이다. 판단 기준이 없어서 잘못된 선택을 내렸다. 반면교사하여 다시는 잘못된 선택을 하지 않으면 된다.

# 해결 전략

격자 미로에서 출발지와 도착지를 가는 길 중 문자열이 사전 순서에서 가장 작은 길을 구해야한다.

1. 격자 미로: 격자 미로일 경우 우리는 어느 한 지점에서, 다른 지점까지의 최단 거리를 매우 쉽게 알 수 있다. 예시로 (a1,b1), (a2,b2) 두 좌표일 때 최단 거리는 |a1-a2|+|b1-b2| 이다.

2. 사전 순서에서 가장 작은 길: 방향을 문자열로 치환하였을 때, 사전 순으로 나열하면 d, l, r, u이다. 단어를 사전 순으로 정렬했을 때 앞에 위치하려면, 단어 내 앞에 있는 문자가 최대한 사전순으로 정렬되어야 한다. 그 의미는 drrr이 rddd 보다 사전 앞에 위치한다. 단어 내 앞에 배치된 문자가 중요도가 훨씬 높다는 의미이다.

3. k번: 우리는 k번 움직일 수 있다. 왔던 길을 다시 돌아갈 수도 있다. 다시 말하면 우리는 이동한 지점으로부터 도착지까지 남은 k번 내에 도달할 수 있다면 어디를 가던 상관이 없다.

2번 항목에서 그리디 알고리즘을 떠올리게 되었고,
내가 고안한 알고리즘은 다음과 같다.

1. 우리는 k번 만큼 움직인다. 방향의 우선 순위는 방향을 문자열로 치환했을 때의 사전 순서이다. (d,l,r,u)
2. d,l,r,u 순서대로 순회하며 다음의 이동 지점을 구해본다.
3. 만일 다음의 이동 지점에서 도착지까지 도달할 수 없다면, 다음 순회로 넘어간다. (남은 k가 모자라는 경우)
4. 만일 다음의 이동 지점에서 도착지까지 도달할 수 있다면 k를 1개 줄여주고, 해당 방향을 기록해준다. 2번의 순회를 멈춘다.
5. 이 과정을 k가 0이 될 때 까지 반복한다.
6. k가 0이 되었을 때 도착한 지점이 목적지와 다르다면 'impossible'을 출력한다. 그게 아니라면 기록한 방향을 출력해준다.

# 정답 코드

```js
function solution(n, m, x, y, r, c, k) {
  const direction = ['d', 'l', 'r', 'u'];
  const dx = [0, -1, 1, 0];
  const dy = [1, 0, 0, -1];

  let answer = '';

  const start = [x - 1, y - 1];
  const end = [r - 1, c - 1];

  while (k > 0) {
    for (let i = 0; i < 4; i++) {
      const next = [start[0] + dy[i], start[1] + dx[i]];
      if (check(next, n, m)) {
        if (getDistance(next, end) <= k) {
          k -= 1;
          start[0] = next[0];
          start[1] = next[1];
          answer += direction[i];
          break;
        }
      }
      if (i === 3) return 'impossible'; // 아래 설명 참조
    }
  }
  if (start[0] !== end[0] || start[1] !== end[1]) return 'impossible';
  return answer;
}

function getDistance(pos1, pos2) {
  const [y1, x1] = pos1;
  const [y2, x2] = pos2;
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

function check(pos, n, m) {
  const [pos_y, pos_x] = pos;
  return pos_y >= 0 && pos_y <= n - 1 && pos_x >= 0 && pos_x <= m - 1;
}
```

for 문내에 `if (i === 3) return 'impossible'` 이라는 코드를 삽입한 이유는 모든 방향으로 가봤을 때 도달할 수 있는 경우가 없다면 불가능한 경우이기 때문에 루프를 종료시킨다. 루프를 종료시키지 않으면 k가 줄지 않기 때문에 while문을 벗어날 수 없다.
