---
title: 이펙티브 타입스크립트 6장
date: 2022-12-09
description: 타입 선언과 @types
---

# devDependencies에 typescript와 @types 추가하기

devDependencies에는 프로젝트를 개발하고 테스트하는 데 사용되지만, 런타임에는 필요 없는 라이브러리가 포함된다. typescript와 @types는 런타임에서 사용되지 않기 때문에 devDependencies에 설치되어야한다.

## 타입스크립트 프로젝트 의존성

1. 타입스크립트 자체 의존성

   - 팀원들 모두가 항상 동일한 버전을 설치한다는 보장이 없다.
   - 프로젝트를 셋업할 때 별도의 단계가 필요하다.

   devDependencies에 포함되어 있다면 npm install 할 때 항상 정확한 버전의 타입스크립트를 설치할 수 있다.

2. 타입 의존성
   - 사용하려는 라이브러리에 타입 선언이 되어있지 않더라도, DefinitelyType에서 타입 정보를 얻을 수도 있다.
   - DefinitelyType에서 얻은 타입 정보 또한 devDependencies에서 관리해야한다.

# 타입 선언과 관련된 세 가지 버전 이해하기

타입스크립트는 의존성 관리를 더욱 힘들게 한다. 다음 세 가지 사항을 추가로 고려해야 한다.

1. 타입스크립트 버전
2. 타입 선언(@types)의 버전
3. 라이브러리의 버전

## 실제 라이브러리와 타입이 따로 관리됨으로써 발생하는 문제점

1. 라이브러리는 업데이트 했지만 실수로 타입 선언은 업데이트 하지 않는 경우

   라이브러리와 관련하여 새로운 기능을 사용하려고 할 때마다 오류 발생함. 특히 하위 호환성이 깨진다면 런타임에서 오류가 발생할 수도 있다.

   타입 선언도 버전을 맞춰서 업데이트 해주거나, 보강 기법을 활용하여 타입 정보를 프로젝트에 추가해준다.

2. 라이브러리보다 타입 선언의 버전이 최신인 경우

   타입 체커는 최신 API를 기준으로 코드를 검사하지만, 런타임에 실제로 쓰이는 것은 과거 버전이다. 이런 경우에도 라이브러리 버전과 타입 선언의 버전을 일치시켜줌으로써 문제를 해결한다.

3. 프로젝트에서 사용하는 타입스크립트 버전보다 라이브러리에서 필요로 하는 타입스크립트 버전이 최신인 경우

   유명 라이브러리는 타입 정보를 더 정확하게 표현하기 위해 타입 시스템이 개선되고 버전이 올라가게 된다.

   해결을 위해서는 프로젝트의 타입스크립트 버전을 올리거나, 라이브러리의 타입 선언 버전을 내리거나, declare module 선언으로 라이브러리의 타입 정보를 없애버리거나 하면 된다.

4. @types 의존성이 중복될 수도 있다.

# 공개 API에 등장하는 모든 타입을 익스포트하기

공개 API에 등장하는 모든 타입은 익스포트 하는 것이 좋다. 필요한 타입을 사용자들이 접근할 수 있도록 해야한다. 모종의 사유로 어떤 타입을 숨기기 싶어서 익스포트 하지 않았다고 해도, 해당 타입을 사용하는 함수가 익스포트 될 경우 Parameters, ReturnType 제너릭을 사용해서 추출할 수 있기 때문이다.

# API 주석에 TSDoc 사용하기

JSDoc 스타일로 주석을 작성하게 되면 대부분의 편집기는 함수가 호출되는 곳에서 함수에 붙어있는 JSDoc 스타일으 주석을 툴팁으로 표시해준다. 툴팁을 보면서 함수에 대해서 더 쉽게 이해할 수 있다.

인라인 주석으로 작성하게 될 경우에는 지원하지 않는다.

# 콜백에서 this에 대한 타입 제공하기

콜백 함수가 this를 사용한다면 this에 대한 타입을 명시해주어야 하고 바인딩 시켜주어야 한다.

아래는 this에 대한 타입 명시와 바인딩을 시켜준 예시이다.

```ts
function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener("keydown", e => {
    fn.call(el, e)
  })
}
```

콜백 함수의 첫 번째 매개 변수에 있는 this는 특별하게 처리된다. this에 대한 타입으로 설정된다.
그리고 만약 this에 대한 명시적 바인딩이 일어나지 않으면 에러를 도출한다.
아래의 예시를 살펴보면 알 수 있다.

```ts
function addKeyListener(
  el: HTMLElement,
  fn: (this: HTMLElement, e: KeyboardEvent) => void
) {
  el.addEventListener("keydown", e => {
    fn(el, e)
    //1개의 인수가 필요한데 2개의 인수가 사용되었습니다.

    fn(e)
    //void 형식의 this 컨텍스트를 HTMLElement 형식 this에 할당할 수 없다.
  })
}
```

this에 대한 타입이 주어지고 명시적으로 바인딩 함으로써 완전한 타입 안전성을 얻을 수 있다.

```ts
addKeyListener(el, function (e) {
  this.innerHTML //정상
})
```

# 오버로딩 타입보다는 조건부 타입 사용하기

오버로딩은 아이템3에서 학습하였지만 간단하게 기술한다.

```ts
function add(x: number, y: number): number
function add(x: string, y: string): string

add(3, 3) //1번 호출부
add("x", "y") //2번 호출부
```

**함수는 오버로딩 될 수 없지만 타입은 오버로딩 될 수 있다.** 오버로딩된 타입중에서 일치하는 타입을 찾게된다. add 함수의 1번 호출부에서 2개의 오버로딩된 타입 중 위에것을 찾아서 매칭시킨다. add 함수의 2번 호출부에서는 2개의 오버로딩된 타입 중 아래것을 찾아서 매칭시킨다.

타입 오버로딩 없이 처리하기 위해서 유니온 함수를 사용했다고 가정해보자

```ts
function double(x: string | number): string | number
function double(x: any) {
  return x + x
}
```

double 함수를 호출하면 실제로는 number가 들어가면 number가 결과 타입으로 예측되고 string이 들어가면 string이 결과 타입으로 예측된다. 하지만 타입 선언의 경우 x가 string일 때 결과 타입이 number인 경우가 존재한다.

타입을 정교화하기 위해서 제너릭을 사용해본다.

```ts
function double<T extends string | number>(x: T): T
```

```ts
const str = "str"
const doubledStr = double(str) //타입이 'str', 'strstr'이 되어야함.
```

타입이 너무 과하게 좁혀져서 정확한 타입을 유추하지 못하는 문제가 발생한다.

위와 같은 예시의 문제를 해결하기 위해서 우리는 오버로딩을 사용하지만, 오버로딩 보다는 조건부 타입을 사용하면 더 간결하게 코드 작성이 가능하다.

```ts
function double<T extends string | number>(
  x: T
): T extends string ? string : number
```

# 의존성 분리를 위해 미러 타입 사용하기

만일 어떤 모듈의 구현과 무관하게 타입에만 의존한다면 필요한 선언부만 추출하여 작성 중인 라이브러리에 넣는 것을 고려해볼 수 있다. 이를 미러링이라고 한다.

그 이유는 구현에 필요한 라이브러리는 없고 타입만 있으면 혼란을 줄 수 있기 때문이다.

하지만 다른 라이브러리의 타입 선언의 대부분을 추출해야 한다면 @types 의존성을 추가하는게 낫다.
