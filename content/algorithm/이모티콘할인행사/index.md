---
title: 이모티콘 할인행사
date: 2022-02-09
description: 중복 순열, 완전 탐색
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/150368)

# 해결 전략

우리는 문제에 주어진 우선순위에 맞게 최대 이모티콘 서비스 가입자수와 판매액을 구해야한다.

이 문제는 완전 탐색으로 해결할 수 있는 문제이다. 우리는 이모티콘별 적정 할인률을 구해야하는데, 이모티콘의 할인률은 10%,20%,30%,40% 중 하나이다.
emoticons의 최대 길이는 7로 최대의 시간 복잡도를 계산해보면, `100 * (4 ** 7)`로 충분하다. (n=100, emoticons의 길이 7)

완전 탐색 알고리즘을 설계하면 된다.

1. 가능한 할인율을 전부 생성한다. 중복 순열 알고리즘을 사용한다.
2. 순열 경우의 수를 순회하면서 이모티콘 서비스 가입자 수와 판매액을 구한다.
3. 우선순위에 따라서 최대 이모티콘 서비스 가입자수와 판매액을 갱신한다.

# 정답 코드

```js
const getSum = (user, emoticons, discountRates) => {
  const [rate] = user;
  let sum = 0;

  const n = emoticons.length;
  for (let i = 0; i < n; i++) {
    if (discountRates[i] >= rate) {
      sum += emoticons[i] * (100 - discountRates[i]) * 0.01;
    }
  }
  return sum;
};

function getPermutation(arr, n) {
  const result = [];
  if (n === 1) return arr.map(el => [el]);

  arr.forEach((v, i) => {
    const permutation = getPermutation(arr, n - 1);
    const attached = permutation.map(el => [v, ...el]);
    result.push(...attached);
  });
  return result;
}

function solution(users, emoticons) {
  const discountRates = getPermutation([10, 20, 30, 40], emoticons.length);

  let answer_plus = 0;
  let answer_price = 0;

  for (let discountRate of discountRates) {
    let plus = 0;
    let price = 0;
    for (let user of users) {
      const sum = getSum(user, emoticons, discountRate);
      if (sum >= user[1]) plus++;
      else price += sum;
    }

    if (plus > answer_plus) {
      answer_plus = Math.max(answer_plus, plus);
      answer_price = price;
    }

    if (plus === answer_plus) {
      answer_price = Math.max(answer_price, price);
    }
  }

  return [answer_plus, answer_price];
}
```
