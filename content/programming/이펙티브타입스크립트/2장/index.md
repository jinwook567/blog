---
title: 이펙티브 타입스크립트 2장
date: 2022-10-18
description: 타입스크립트의 타입 시스템
---

# 편집기를 사용하여 타입 시스템 탐색하기

많은 개발자들이 vscode를 이용하는데 typescript를 제작한 ms에서 만든 것이다. 따라서 vscode를 사용하면 typescript의 언어 서비스를 잘 활용할 수 있다.

편집기를 통해서 어떻게 타입 시스템이 동작하는지, 타입스크립트가 어떻게 타입을 추론하는지 개념을 잡을 수 있다.

```ts
const num = 3
//num은 number로 자동으로 추론한다.
```

Go to Definition 기능을 통해서 타입 선언 파일로 이동할 수 있고, 타입 선언 파일을 보면서 어떻게 모델링 되었는지 파악할 수 있다.

# 타입이 값들의 집합이라고 생각하기

타입이 값들의 집합이라고 생각하라는 의미는 무엇일까. 1,2,3이라는 값들은 number라는 타입에 해당된다. 즉 1,2,3이라는 숫자 값들의 집합은 number 타입에 해당된다는 것이다. 1000도 숫자 값의 집합의 요소이기 때문에 number 타입에 해당된다.

## 타입의 종류

1.  never 타입
    - 공집합으로, never에는 아무런 값도 할당할 수 없다.
2.  유닛 타입 혹은 리터럴 타입
    - 한 가지 값만 포함하는 타입이다.
    ```ts
    type A = "a"
    type B = "b"
    ```
3.  유니온 타입 - 값 집합들의 합집합을 말한다.
    ```ts
    type AB = "A" | "B"
    type AB12 = "A" | "B" | 12
    ```
4.  집합의 범위가 한정되어 있지 않은 타입들
    - number, string 등의 타입은 범위가 무한대이다. 나올 수 있는 경우의 수가 무수히 많기 때문이다.
5.  서브 타입
    ```ts
    interface Person {
      name: string
    }
    interface PersonSpan extends Person {
      birth: Date
      death?: Date
    }
    ```
    PersonSpan은 Person의 서브타입이라고 할 수 있다. PersonSpan은 Person의 모든 조건을 만족해야한다.

## 키워드

### &

두 타입의 인터섹션(교집합)을 계산한다. 예시를 통해서 알아보도록 한다.

```ts
interface Person {
  name: string
}

interface LifeSpan {
  birth: Date
  death?: Date
}

type PersonSpan = Person & LifeSpan

const ps: PersonSpan = {
  name: "hi",
  birth: new Date(),
}
```

위의 PersonSpan의 경우 두 인터페이스가 공통적으로 가지는 속성이 없기 때문에 공집합이라고 생각할 수 있지만 이것은 틀린 것이다. 덕 타이핑으로 인해서 Person 인터페이스의 경우 어떤 객체가 name 속성을 보유하고 그것이 문자열이면 모두 만족한다. LifeSpan 인터페이스의 경우 마찬가지로 birth의 속성이 날짜인 객체도 전부 만족한다. 따라서 교집합이므로, name 속성과 birth 속성 2개다 존재해야 하는 것이다.

하지만 유니온에 대해서는 다른 형태를 보여준다.

```ts
type union = Person | LifeSpan

type K = keyof union
type M = typeof (Person & LifeSpan)
```

K는 never이고, M은 `name | birth | death`이다.
K가 never인 이유는 union의 키는 (name) | (birth | death) 인데 둘 중 무슨 값이 될지 모르기 때문에 2개 다 만족하는 값이 나와야한다(?)

```ts
keyof (A|B) = (keyof A) & (keyof B)
```

### extends

extends 키워드를 활용하여 서브 타입을 만들어낼 수 있다.

extends 키워드는 제너릭 타입에서 한정자로도 쓰인다. 해당 문맥에서는 ~의 부분 집합을 의미하기도 한다.

```ts
function getKey<K extends string>(val: any, key: K) {
  //....
}

getKey(val, "3")
getKey(val, 12)
//오류가 발생한다. K는 string의 부분 집합이므로.
```

# 타입 공간과 값 공간의 심벌 구분하기

p.46 이어서 작성해야함.
