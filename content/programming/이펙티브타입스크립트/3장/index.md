---
title: 이펙티브 타입스크립트 3장
date: 2022-11-01
description: 타입 추론
---

# 타입 추론

타입스크립트는 타입 추론을 적극적으로 수행한다. 타입 구문의 수를 엄청나게 줄여주기에 코드의 전체적인 안정성이 향상된다. 숙련된 타입스크립트 개발자는 비교적 적은 수의 구문을 사용한다.

# 추론 가능한 타입을 사용해 장황한 코드 방지하기

```ts
const a: number = 3
```

위의 예시에서 a에 굳이 number라는 타입을 명시해줄 필요가 없다. 타입스크립트에서 자동으로 추론해주기 때문이다.

## 객체의 경우

객체의 경우에도, 타입 추론이 의도한 타입과 동일하다면 굳이 타입을 명시해줄 필요가 없다.

```ts
interface Person {
  name: string
  born: {
    where: string
    when: string
  }
}
const person: Person = {
  name: "sssdf",
  born: {
    where: "Seoul",
    when: "2000-11-01",
  },
}
```

person 객체만 정의하면 Person과 같은 타입이 자동으로 추론된다. 하지만 만일 객체 리터럴을 정의할 때 잉여속성 체크를 하고 싶다면 꼭 타입을 명시해야한다. 잉여속성 체크를 함으로써, 객체가 사용되는 쪽의 코드에서 문제가 발생하는 것이 아니고, 객체가 정의된 곳에서 문제가 발생되어 문제를 쉽게 파악할 수 있다.

## 리팩토링을 쉽게

타입이 추론되면 리팩토링도 쉽게 할 수 있다. 어떻게 보면 기존에 정의된 타입을 이용한다는 것으로 받아들이면 된다.

```ts
interface Product {
  id: number
  name: string
  price: number
}

function logProduct(product: Prodcut) {
  const id: number = product.id
  const name: string = product.name
  const price: number = product.price
}
```

위의 예시에서 만일 id가 number 타입이 아닌 string 타입으로 변경되면 logProduct의 함수 const id 부분이 타입 에러가 발생할 것이다. 위와 같은 경우에는 비구조화 할당문으로 리팩토링 해주는게 좋다. 모든 지역 변수의 타입 추론이 되도록 하기 때문이다.

```ts
function logProduct(product: Product) {
  const { id, name, price } = product
}
```

## 함수

타입 정보가 있는 라이브러리에서 콜백 함수의 매개변수 타입은 자동으로 추론된다. express HTTP 서버 라이브러리를 사용하는 request와 response 타입 선언은 필요하지 않는다.

함수의 반환에 타입을 명시하면 객체 리터럴에 타입을 명시하는 것과 유사하게 사용되는 쪽의 코드에서 문제가 발생한 곳이 아니고, 구현부에서 문제를 발견할 수 있다.

```ts
const cache: { [ticker: string]: number } = {}
function getQuote(ticker: string) {
  if (ticker in cache) {
    return cache[ticker]
    //number
  }
  return fetch("...")
    .then(response => response.json())
    .then(quote => {
      cache[ticker] = quote
      return quote
    })
  //promise
}
```

위의 getQuote 함수는 if 구문에서는 number 타입을, fetch에서는 Promise를 리턴하기 때문에 프로미스가 사용되는 부분에서 타입 에러를 발생한다. 해당 문제를 해결하기 위해서는 cache[ticker]를 반환하는게 아닌, Promise.resolve(cache[ticker])를 반환해야한다.

또한 함수의 반환값에 타입을 명시하면, 해당 타입을 보고 직관적으로 함수를 이해할 수 있다.

```ts
type Vector2D = { x: number; y: number }
function add(a: Vector2D, b: Vector2D) {
  return { x: a.x + b.x, y: a.y + b.y }
}
```

위의 add 함수는 `{x:number, y:number}` 타입으로 추론할 것이다. 하지만 Vector2D가 들어갔는데, 해당 타입이 나온다는게 개발자 입장에서는 혼란스러울 수 있다. 이럴 때 타입을 명시해주면 혼란을 줄일 수 있다.

# 다른 타입에는 다른 변수 사용하기

```ts
let id = "123"
fetchProduct(id) // string

id = 123
fetchProductByNumber(id) //number
```

자바스크립트에서는 위의 패턴이 허용된다. 하지만 타입스크립트에서는 id에 string 타입이 할당되었기 때문에 그 다음에 number 타입을 할당할 수 없어 오류가 발생한다.

```ts
let id: string | number = "123"
```

위와 같이 유니온 타입으로 타입을 좁혀서 정의하면 코드는 동작한다. 하지만 id를 사용할 때마다 number인지 string인지 확인해야 하기 때문에, 간단한 타입에 비해 다루기 어렵다.
**따라서 위의 경우에는 변수를 분리한다!**
변수를 분리하면 더 정확한 변수명을 지을 수 있고, const로 변수를 선언하여 코드 안정성을 향상 시킬 수 있다.

# 타입 넓히기

상수를 사용해서 변수를 초기화 할 때 타입을 명시하지 않으면 타입 체커는 타입을 스스로 결정해야 한다. 지정된 단일 값으로 할당 가능한 값들의 집합을 유추해야 한다는 의미이다. 이러한 과정을 타입 넓히기(widening)라고 부른다.

```ts
function onlyGetABC(abc: "a" | "b" | "c") {
  //...
}

let A = "a"
onlyGetABC(A)
//타입체크 에러 발생
```

위의 경우 변수 A의 경우 "a"라고 정의하였지만, 타입 체커는 타입을 string으로 배치하였다. 타입을 넓혀야 하기 때문이다. 그리고 `onlyGetABC`는 string이 아닌 `"a"`를 매개변수로 받기 때문에 타입 에러가 발생한다.

```ts
const mixed = ["x", 1]
```

위의 경우 나올 수 있는 경우의 수가 매우 많다. 타입 시스템은 작성자의 의도를 추측하지만, 아무리 영리하더라도 사람의 마음까지는 읽을 수 없다. 위의 경우 작성자는 튜플로 추론되기를 바랬으나 `(string|number)[]`으로 추론된다.

## 넓히기를 제어하는 방법

### let 대신 const로 선언하기.

let 대신 const로 선언하면 더 좁은 타입이 된다.

```ts
const A = "a"
onlyGetABC(A)
//정상
```

위의 예시에서 A는 `"a"`로 추론된다.
그러나 const는 만능이 아니다. 객체와 배열의 경우에는 여전히 문제가 존재한다.

객체의 경우 타입스크립트의 넓히기 알고리즘은 각 요소를 let으로 할당된 것으로 다룬다. 그리고 다른 속성을 추가하지 못한다.

### 명시적 타입 구문을 제공하기

```ts
const v: {x:1|2|3} {
  x:1
}
```

### 타입 체커에 추가적인 문맥을 제공하는 것

이후 아이템에서 다룬다고함.

### const 단언문 사용

const로 변수를 선언하는 것과 다른 의미이다.
값 뒤에 as const를 작성하면 타입스크립트는 최대한 좁은 타입으로 추론한다. 배열을 튜플 타입으로 추론할 때에도 as const를 사용할수 있다.

# 타입 좁히기

타입 넓히기의 반대 개념이다. 대표적인 예시는 null 체크이다.

```ts
const el = document.getElementById("foo")
if (el) {
  el.innerHTML = "hello"
} else {
  alert("no element")
}
```

위의 예시에서는 분기 처리를 통해 el의 타입이 HTMLElement임을 확인하였다.

## 타입 좁히기 종류

1. instanceof를 사용
2. 내장 함수(Array.isArray 등)
3. 조건문

   - 조건문을 통해서 타입을 좁힐 때는 유의해주어야 한다.

     ```ts
     function foo(x?: number | string | null) {
       if (!x) {
       }
     }
     ```

     위의 예시의 경우 0, '' 모두 falsy이기 때문에 타입이 전혀 좁혀지지 않았다.

     ```ts
     const el = document.getElementById("foo")
     if (typeof el === "object") {
     }
     ```

     위의 예시도 문제는 object도 null이기 떄문에 타입이 좁혀지지 않았다.

4. 명시적 태그를 붙이는 방법

   - 객체 내에 type 속성을 넣어주고 값을 넣어주는 패턴 등이 존재한다.
   - 태그된 유니온, 구별된 유니온이라고 불린다.

5. 커스텀 함수 도입

   ```ts
   function isInputElement(el: HTMLElement): el is HTMLInputElement {
     return "value" in el
   }

   function getElementContent(el: HTMLElement) {
     if (isInputElement(el)) {
       return el.value
     }
     return el.textContent
   }
   ```

   - 위와 같은 패턴을 사용자 정의 타입 가드라고 한다.

   ```ts
   const member = ["a", "b", "c", "d"]
   const people = ["a", "e"]

   const onlyMember = people.map(who => member.find(v => v === who))
   //(string | undefined)[]

   const filteredOnlyMember = people
     .map(who => member.find(v => v === who))
     .filter(who => who !== undefined)
   //(string | undefined)[]
   ```

   위의 경우 filteredOnlyMember 변수도 (string | undefined)[]이다. 이럴 때 타입 가드를 사용하면 타입을 좁힐 수 있다.

   ```ts
   function isDefined<T>(x: T | undefined): x is T {
     return x !== undefined
   }

   const filteredOnlyMember = people
     .map(who => member.find(v => v === who))
     .filter(isDefined)
   //string[]
   ```

# 한꺼번에 객체 생성하기

자바스크립트의 값은 변경되지만 일반적으로 타입스크립트의 타입은 변경되지 않는다. 객체를 생성할 때는 속성을 하나씩 추가하는 것보다는 여러 속성을 포함해서 한꺼번에 생성해야 타입 추론에 유리하다.

```ts
const pt = {}
pt.x = 3
pt.y = 5
//타입 체크 오류 발생.. {} 형식에 x가 존재하지 않습니다.
```

아래와 같은 패턴으로 정의하면 오류가 발생하지 않는다.

```ts
const pt = { x: 3, y: 5 }
```

객체를 반드시 제각각 나눠서 만들어야 한다면 타입 단언문을 사용해야한다.

```ts
interface Point {
  x: number
  y: number
}
const pt = {} as Point
pt.x = 3
pt.y = 5
```

## 전개 연산자

객체를 합칠 때는 전개 연산자를 사용한다.

```ts
const pt = { x: 3, y: 4 }
const id = { name: "pythagoras" }
const namedPoint = {}
Object.assign(namedPoint, pt, id)
namedPoint.name
//타입 에러 발생.. name 속성이 없다.

const namedPoint = { ...pt, ...id }
namedPoint.name
```

### 조건부 속성

```ts
declare let hasMiddle: boolean
const firstLast = { first: "harry", last: "potter" }
const president = { ...firstLast, ...(hasMiddle ? { middle: "S" } : {}) }
```

위의 예시에는 middle이 선택적 속성을 가지는 것으로 추론된다.

만일 전개 연산자로 여러 속성을 추가하면 어떻게 될까? 이때는 유니온 속성으로 추론된다. 속성이 함께 정의되기 때문에 유니온을 사용하는게 값의 집합을 더 정확히 표현할 수 있기 때문이다.

유니온 방식이 아닌, 선택적 필드로 만들고 싶다면 헬퍼 함수를 사용해야한다.

```ts
function addOptional<T extends object, U extends object>(
  a: T,
  b: U | null
): T & Partial<U> {
  return { ...a, ...b }
}
```

**객체나 배열을 변환해서 새롤운 객체나 배열을 생성하고 싶다면 루프 대신 내장된 함수형 기법 또는 로대시 같은 유틸리티 라이브러리를 만드는게 한꺼번에 객체 생성하기 관점에서 옳다.**

# 일관성 있는 별칭 사용하기

```ts
const person = {
  age: 20,
  name: "jinwook",
  location: { City: "Seoul", State: "gdd" },
}
const loc = person.location
```

위의 loc 변수가 별칭이다. 별칭의 속성값을 변경하면 원본 객체의 속성값도 변경한다. 따라서 별칭을 남발하면 제어 흐름을 파악하기 어렵다.

만일 location의 분기를 여러번 나눠야되는 로직이 있다면 우리는 location 별칭을 사용해서 코드를 짧게 유지할 것이다.

```ts
function saveLocation1(person) {
  if (person.location) {
  }
  //...
}

function saveLocation2(person) {
  const personLocation = person.location
  if (person.location) {
    fn(personLocation)
    //error 발생.. personLocation은 null일 수 있음.
    //...
  }
}

function saveLocation3(person) {
  const { location } = person
  if (location) {
    //...
  }
}
```

saveLocation2의 경우 객체의 속성을 별칭으로 정의했다. 하지만 아래 분기에서는 `person.location`을 확인하였고 `personLocation`은 확인하지 않았다. `person.location`은 `null`이 사라져 타입이 좁혀졌으나 `personLocation`은 그대로이다. 별칭을 사용할 것이면 일관성있게 `saveLocation3`처럼 사용해야한다. 또한 비구조화 할당을 사용해서 일관된 이름을 사용하면 더더욱 좋다.

## 별칭으로 인한 혼동

```ts
const { bbox } = polygon
if (!bbox) {
  caculatePolygonBbox(polygon)
}
```

위의 예시에서 bbox와 polygon.bbox는 이제 다른 값을 참조한다..! bbox의 경우 비구조화 할당으로 인해 새로운 변수에 넣었기 때문이다.

```ts
function fn(p: Polygon) {}

polygon.bbox //BoundingBox | undefined

if (polygon.bbox) {
  fn(polygon)
  polygon.bbox //BoundingBox
}
```

위의 예시에서 fn은 polygon의 bbox 속성을 제거할 수도 있다. 하지만 타입은 그대로 유지된다. 타입스크립트에서 함수가 타입 정제를 무효화하지 않는다고 가정하기 때문이다. 따라서 위의 경우에는 비구조화 할당을 사용해서 새로운 지역변수를 정의하면 타입은 정확히 유지되지만 원본값은 변함이 없는 장점을 누릴 수 있다.

# 비동기 코드에는 콜백 대신 async 함수 사용하기

콜백보다는 프로미스, async 함수를 사용하는 것이 코드도 간결하며 타입을 추론하기 쉽다.
p138
