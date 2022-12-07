---
title: 이펙티브 타입스크립트 5장
date: 2022-12-02
description: any 다루기
---

처음에 타입스크립트를 사용했을 때 잘몰라서 any 키워드를 가끔 사용하곤 했다.
any는 타입 시스템을 뭉개버리기 때문에 최소한으로 사용을 해야한다. any 키워드로 정의된 변수는 프로젝트 내에서 전염병처럼 퍼져나갈 수 있다...
any를 잘 다루는 방법에 대해서 알아보도록 하자.

# any 타입은 가능한 좁은 범위에서만 사용하기

any를 사용해서 타입 시스템의 오류를 피하고자 아래와 같은 두가지 방식으로 처리하였다. 어떤 것이 더 좋은 해결책일까?

```ts
function f1() {
  const x: any = expressionReturingFoo()
  expectAoo(x) //error
}

function f2() {
  const x = expressionReturingFoo()
  expectAoo(x as any) //error
}
```

f2 함수가 더 나은 선택이다. 그 이유는 any의 범위를 좁혔기 때문이다. f1의 로직이 길어질 경우 x는 f1 함수의 스코프 내에서 모두 any로 정의된다. 하지만 f2의 경우에는 expectAoo 함수에 매개변수만 any로써 정의되기 때문에 추가적으로 발생할 수 있는 오류를 줄여준다.

## 객체에서 any가 필요할 경우

객체의 속성에서 any가 필요할 경우 객체 전체를 any로 설정하는 것은 바람직하지 않다. 객체의 속성값만 any로 설정해주는 것이 좋다.

```ts
const configGood = {
  a: 1,
  b: 2,
  c: {
    key: value as any,
  },
}

const configBad = {
  a: 1,
  b: 2,
  c: {
    key: value,
  },
} as any
```

# any를 구체적으로 변형해서 사용하기.

any를 사용하되 any를 모델링 할 수 있다면 모델링 하는 편이 좋다.

```ts
function getLengthBad(arr: any) {
  return array.length
}

function getLengthGood(arr: any[]) {
  return array.length
}
```

getLengthGood의 경우 함수의 매개변수가 배열이라는 형태를 알 수 있기 때문에 getLengthGood의 결과값이 number라는 타입을 가지게 되고, 매개변수도 배열인지 확인하게 된다.

## 객체에서

객체이고 값을 알 수 없다면 `{[key:string] :any}` 처럼 선언하면 된다.
object 타입도 가능하지만, 객체의 키를 열거 가능하지만 속성에 접근은 할 수 없다는 점에서 차이가 있다.

## 함수에서

```ts
type Fn0 = () => any
type Fn1 = (...args: any[]) => any
```

Fn1의 경우 매개변수가 배열이라는 것을 알 수 있다는 장점이 있다.

# 함수 안으로 타입 단언문 감추기

**불가피하게 타입 선먼문을 사용해야 한다면, 정확한 정의를 가지는 함수 안으로 숨겨야한다.**

함수의 모든 부분을 안전한 타입으로 구현하는 것이 이상적이다만, 불필요한 시간이 들 수 있다. 함수 내부에는 타입 단언을 사용하고 배출값의 타입 정의를 정확히 명시하는 정도로 하면 효율적이다.

함수 캐싱 예시를 통해서 알아보도록 하겠다.

```ts
function shallowEqual(a: any, b: any) {
  return a === b
}

function cacheLast<T extends Function>(fn: T): T {
  let lastArg: any[] | null = null
  let lastResult: any

  return function (arg: any) {
    if (!lastArg || !shallowEqual(lastArg, arg)) {
      lastResult = fn(arg)
      lastArg = arg
    }
    return lastResult
  } as unknown as T
}
```

# any의 진화

타입스크립트에서 변수의 타입은 변수를 선언할 때 결정된다. 정제(null, undefined)될 수는 있으나 새로운 값이 추가되도록 확장할 수는 없다. 하지만 any는 예외적인 케이스가 존재한다.

```ts
function makeArr(num: number) {
  const arr = []
  for (let i = 0; i < num; i++) {
    arr.push(i)
  }
  return arr
}
```

위의 예시에서 arr이 선언된 부분에서는 any[] 이지만, 리턴할 때 arr는 number[]로 정의된다.
arr에 number 속성의 인자를 넣는 순간 number[]로 진화한다.

만약에 number가 아닌 다른 속성을 넣어보면 어떨까?

```ts
function makeArr(num: number) {
  const arr = []
  for (let i = 0; i < num; i++) {
    arr.push(i % 2 === 0 ? i : `${i}`)
  }
  return arr
}
```

arr은 (num | string)[]가 된다.

any 타입의 진화는 noImplictAny가 false로 설정되었고, 변수의 타입이 암시적 any일 경우에만 일어난다. 명시적으로 타입을 선언해주면 타입은 유지가 된다. 암시적 any는 함수 호출을 거쳐도 진화하지 않는다.

암시적 any를 진화시키는 것보다 명시적으로 타입을 선언해주는 것이 좋다. 위의 예제의 경우 map 메소드를 사용한다면 문제를 해결할 수 있다.

# 모르는 타입에는 any 대신 unknown 사용하기

함수의 반환타입으로 any를 사용하는 것은 좋지 않다. 대신에 호출한 부분에서 반환값을 원하는 타입으로 설정하도록 하는 것이 더 이상적이다. unknown 타입을 반환함으로써 사용부에서 타입을 강제로 설정하도록 할 수 있다.

any의 위험한 이유는 아래 두가지 특징을 가지기 때문이다.

1. 어떠한 타입이던 any에 할당 가능하다.
2. any 타입은 어떠한 타입으로도 할당 가능하다.

타입스크립트에서는 집합이라는 개념이 사용되는데, A라는 집합이 B의 부분 집합이면서 동시에 B의 상위 집합이 될 수 없기 때문에 any는 타입 시스템과 상충된다.
B라는 큰 원에 A가 들어가고, A의 원에 B가 들어가는 모양이다. 말이 안된다.

unknown은 타입 시스템에 부합한다. any의 첫 번째 특징은 만족하지만, 두 번째 특징은 만족하지 않는다.

B라는 큰 원이 unknown이고, A라는 작은 원이 어떠한 타입이다.

```ts
let unknownType: unknown
let unknownType2: unknown
let numberType = 3

unknownType = numberType
numberType = unknownType
//에러가 발생한다.
unknownType2 = unknownType
```

numberType에 unkownType을 할당하려고 하면 에러가 발생한다. 그 이유는 더 작은 집합에 큰 집합을 넣으려고 했기 때문이다. 하지만 unknownType에 numberType을 할당할 수는 있다. unknownType이 더 큰 집합이기 때문이다.

unkown 타입인 채로 값을 사용할 경우 오류가 발생하기 때문에 적절한 타입으로 변환해야 한다.
적절한 타입으로 변환하는 방법은 아래와 같다.

1. 타입 단언
2. 체크를 통해서 원하는 타입으로 변환(예시.instanceof를 사용하여 체크하는)
3. 사용자 정의 타입가드

# 제너릭 vs unknown

제너릭을 사용한 스타일은 unknown 타입을 사용했을 때와 기능적으로는 동일하다.
책에는 unknown 타입을 사용하는 것이 더 좋다고 하는데 이유는 안나와있다.
unknown을 뱉는게 더 명시적으로 **알 수 없음**을 알려주어서 그런것인가? 라고 생각해본다.

# 타입 단언의 단언

어떠한 타입을 보유한 변수의 타입을 변경해줄 때 타입의 단언의 단언 형태가 많이 사용된다.

express에서 req.query의 기본적인 타입이 존재되어 있고, 제너릭을 통해서 좁혀야 하지만 타입의 단언의 단언을 활용한 예시를 살펴보자.

```ts
interface QueryParams {
  code:string
}
const queryAny = req.query as any QueryParams
const queryUnknown = req.query as unknown as QueryParams
```

위의 queryAny와 queryUnkown의 기능은 동일하지만, 리팩토링을 하면서 두 개의 단언문을 분리하는 순간 문제가 발생한다. unknown의 경우 분리하는 순간 에러를 발생시키지만, any는 아니다. 전염병처럼 퍼져나간다..!
