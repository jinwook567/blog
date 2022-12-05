---
title: 쓰로들링과 디바운싱
date: 2022-12-05
description: 쓰로들링, 디바운싱 개념과 활용
---

쓰로들링과 디바운싱 개념이 가끔 서로 헷갈릴 떄가 있어서 글을 통해서 정리하도록 한다.
두 기법 모두 불필요한 함수 호출 횟수를 줄여주기 위해 고안되었다.

# 쓰로들링

함수가 호출된 후, 정해진 시간 내에 동일한 함수를 호출할 경우 실행하지 않도록 하는 것이다.

위투디 프로젝트에 적용해본 부분은 디자인 에디터의 창 크기가 resize 될 때마다 동적으로 캔버스 크기와 이미지 크기들을 변경시키는데 사용이 되었다.

디바운싱이 아닌 쓰로들링으로 적용한 이유는, 브라우저의 창 크기가 작아지면서 캔버스 크기도 작아지는 모습을 보여주어야 하기 때문이다. 만일 디바운싱을 적용했다면 창 크기가 작아짐에도 불구하고 캔버스 크기는 계속 동일하다가 마지막에야 사이즈가 맞춰졌을 것이다.

정리하자면 연속적인 이벤트가 발생하는데 이벤트가 발생하는 모습을 드문드문 보여줘야 할 때 사용한다고 할 수 있다. 예를 들어 스크롤 이벤트가 있다.

### 자바스크립트 예시

```js
function throttle(cb, time = 3000) {
  let timer
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        cb.apply(this, args)
        timer = null
      }, time)
    }
  }
}
```

### React 예시

```tsx
const [timer, setTimer] = useState<NodeJS.Timeout>()
const handleSomethingUsingThrottling = time => {
  if (!timer) {
    const newTimer = setTimeout(() => {
      //doSomething
      setTimer(null)
    }, time)
    setTimer(newTimer)
  }
}
```

# 디바운싱

디바운싱의 경우 연속적인 함수 호출 중에서 가장 마지막 혹은 처음의 함수를 호출하는 것이다.

디바운싱이 주로 적용되는 부분은 검색 부분이다. 타이핑을 하는 동안은 검색에 대한 결과를 굳이 보여줄 큰 필요는 없으며 검색의 통신 비용이 꽤 크다고 생각하기 때문이다. 물론 쓰로들링으로 적용해도 관계없다.

### 자바스크립트 에시

```js
function debounce(cb, time = 3000) {
  let timer

  return function (...args) {
    clearTimeout(timer)

    timer = setTimeout(() => {
      cb.apply(this, args)
    }, time)
  }
}

//사용 에시
const debounceFunc = debounce(value => {
  console.log(value)
})

for (let i = 0; i < 10; i++) {
  debounceFunc(i)
}
//9가 출력된다.
```

### 리액트 예시

```tsx
const [timer, setTimer] = useState<NodeJS.Timeout>()
const handleSomethingUsingDebouncing = time => {
  clearTimeout(timer)
  const newTimer = setTimeout(() => {
    //doSomething...
  }, time)
  setTimer(newTimer)
}
```
