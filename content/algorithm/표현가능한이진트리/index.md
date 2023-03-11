---
title: 표현 가능한 이진트리
date: 2023-03-11
description: 재귀, 구현
---

[문제 링크](https://school.programmers.co.kr/learn/courses/30/lessons/150367)

# 해결 전략

문제에 접근법은 처음에 구상한 게 맞았으나, 구현에서 조금 애를 먹었다. 알고리즘 풀 때는 타입스크립트가 아닌 자바스크립트를 사용해서 그런가 자잘한 타이핑 오류가 있었다.

우리에게는 십진수가 주어진다. 완전이진트리를 사용하여 이진법을 제작했을 때, 해당 십진수를 이진법으로 표현할 수 있는지 문제이다.

우리가 해결해야 할 문제는 이진법으로 표현할 수 있는지, 즉 완전이진트리모양을 만족시킬 수 있는지이다.  
부모 노드 아래 더미 노드를 완전이진트리 모양을 만족시키면서 자유롭게 추가할 수 있지만, 부모 노드가 더미 노드라면 자식 노드로 더미 노드가 아닌 노드를 추가할 수 없다.

1. 우선 십진수를 이진법으로 변환한다. 이진법은 뒤가 아닌 앞에 0을 추가하면 값은 그대로이므로, 만약 이진법이 완전이진트리의 모양을 충족시키지 않는다면 해당 모양을 충족시키도록 앞쪽에 0을 삽입해준다. 모양을 충족시킨 이후에 0을 더 삽입하여 완전이진트리 모양을 또 만들수는 있으나, 이 경우 루트 노드가 무조건 0이 되기 때문에 고려하지 않아도 된다.

2. 완전이진트리에서 루트 노드, 왼쪽 자식 노드, 오른쪽 자식 노드를 구하는 알고리즘을 작성한다. 루트 노드의 경우 배열의 중앙값이고, 왼쪽 자식 노드의 경우는 왼쪽 자식 노드 본인의 자식 노드의 개수만큼 빼주고 또 1을 빼준다. 위 방식이 가능한 이유는 다음과 같은 가정이 있어서이다.

   _이진트리에서 리프 노드가 아닌 노드는 자신의 왼쪽 자식이 루트인 서브트리의 노드들보다 오른쪽에 있으며, 자신의 오른쪽 자식이 루트인 서브트리의 노드들보다 왼쪽에 있다고 가정합니다._

   오른쪽 자식 노드의 경우는 오른쪽 자식 노드 본인의 자식 노드의 개수만큼 더해주고 또 1을 더해준다.

   자식 노드를 구하는 다른 방식은, 루트 노드를 구하는 방식을 활용하는 것이다. 완전이진트리는 트리의 일부분을 떼어내도 완전이진트리 모양이다. 따라서 왼쪽 자식노드를 구한다고 가정하면 자신의 왼쪽 노드를 기준으로 트리를 뜯어내고, 해당 트리의 루트를 찾으면 왼쪽 노드를 구할 수 있다.

3. 재귀를 활용하여 루트를 기점으로 완전이진트리를 순회한다. 순회하면서 위에서 언급한 완전이진트리 모양을 만족시킬 수 있는 조건을 검사한다. 만일 만족시킬 수 없다면 재귀를 멈추고 0을 반환한다. 완전 이진트리를 만족시킨다면 1을 반환한다.

# 정답 코드

```js
function solution(numbers) {
  return numbers.map(number => {
    const binary = number.toString(2);

    const floor = getFloor(binary.length);
    const treeBinary = makeTreeBinary(binary, getNodeCount(floor));

    const rootIndex = getRootIndex(treeBinary);

    let flag = true;
    function validate(binary, floor, index) {
      if (floor === 1) return; // 1층일 때 순회를 종료한다. 리프 노드를 검증할 필요가 없다.

      const leftChildIndex = index - getNodeCount(floor - 2) - 1;
      const rightChildIndex = index + getNodeCount(floor - 2) + 1;

      if (
        binary.charAt(index) === '0' &&
        (binary.charAt(leftChildIndex) === '1' ||
          binary.charAt(rightChildIndex) === '1')
      ) {
        flag = false;
        return;
      }

      validate(binary, floor - 1, leftChildIndex);
      validate(binary, floor - 1, rightChildIndex);
    }

    validate(treeBinary, floor, rootIndex);
    return flag ? 1 : 0;
  });
}

function makeTreeBinary(binary, count) {
  let result = binary;
  for (let i = 0; i < count - binary.length; i++) {
    result = '0' + result;
  }
  return result;
}

function getRootIndex(binary) {
  return Math.floor(binary.length / 2);
}

function getFloor(nodeCount) {
  return nodeCount.toString(2).length;
}

function getNodeCount(floor) {
  if (floor === 0) return 0;
  let byte = '';
  for (let i = 0; i < floor; i++) {
    byte += '1';
  }
  return parseInt(byte, 2);
}
```

코드가 조금 장황하다.
