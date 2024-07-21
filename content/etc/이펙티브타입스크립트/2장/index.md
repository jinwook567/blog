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

타입스크립트의 심벌은 타입 공간이나 값 공간 중의 한 곳에 존재한다.

_symbol이란 es5에서 추가로 명세된 원시값이다. 고유하기 때문에 충돌이 없어 객체의 키값으로 주로 사용된다._

```ts
interface Cylinder {
  radius: number
  height: number
}

const Cyclinder = (radius: number, height: number) => ({ radius, height })
```

interface에서는 Cylinder는 타입으로, const에서는 값으로 사용된다. 심벌에 어떤 키워드가 사용되었는지 잘파악하여 문맥으로 유추해야한다.

클래스의 경우 타입으로 쓰일 때는 형태(속성과 메소드)가 사용되는 반면, 값으로 쓰일 때는 생성자가 사용된다.

typeof, this 그리고 많은 다른 연산자들과 키워드들은 타입 공간과 값 공간에서 다른 목적으로 사용될 수 있다.

# 타입 단언보다는 타입 선언하기

타입스크립트에서 변수에 값을 할당하고 타입을 부여하는 방법은 타입 단언, 타입 선언 두가지이다.
타입 단언이 꼭 필요한 경우가 아니라면 타입 선언을 사용해야한다. 타입 단언의 경우 강제로 타입을 지정한 것과 마찬가지이다. 타입 체커의 오류도 나타나지 않는다.

```ts
interface Person {
  name: string
}

const person: Person = { name: "jinwook" }
const e_person = { nickname: "jinwook" } as Person
//e_person의 경우 타입 체커에 의해서 오류가 발생해야 하지만, 타입 단언으로 인해서 오류가 발생하지 않음.
```

```ts
document.querySelector("#myButton").addEventListener("click", e => {
  const button = e.currentTarget as HTMLButtonElement
})
```

타입 단언이 꼭 필요한 경우는 타입 체커가 추론한 타입보다 내가 판단하는 타입이 더 정확할 때 의미가 있다.
예를 들어 DOM 엘리먼트에 대해서는 타입스크립트보다 개발자가 더 정확히 알고있다. 타입스크립트는 DOM에 접근할 수 없기 때문에 myButton이 버튼 엘리먼트인지 알 수 없다.

## 화살표 함수에서 타입 선언

화살표 함수의 타입 선언은 추론된 타입이 모호할 때가 있다.

```ts
const people = ["jinwook"].map(name => ({ name }))
//{name:string}[] 형태이다. 원하는 Person[]이 나오지 않는다.
```

타입 단언을 써도 문제가 해결되긴 하지만, 런타임에 문제가 발생한다.

```ts
const people = ["jinwook"].map(name => ({ name } as Person))
const e_people = ["jinwook"].map(name => ({} as Person))
//e_people의 경우 Person 형태를 만족하지 않지만 에러를 반환하지 않음.
```

화살표 함수의 반환값에 타입을 선언하거나 화살표 함수 내에서 타입과 함께 변수를 선언함으로써 이러한 문제를 해결할 수 있다.

```ts
const people = ["jinwook"].map((name): Person => ({ name }))

const people = ["jinwook"].map((name): Person => {
  const person: Person = { name }
  return person
})
```

타입 단언을 사용하더라도, 서로의 서브타입이 아니면 변환이 불가능하다.

```ts
const body = document.getElementById("foo") //HTMLElement | null
const el = body as Person //타입 체커 오류 발생.
```

# 객체 래퍼 타입 피하기

```ts
"Thisisstring".charAt(3)
```

위와 같은 코드는 어떻게 동작하는 것일까? string은 기본형으로 불변이며 메소드를 가지지 않는데 말이다.
정확히 알아보면 charAt 메소드는 string의 메소드가 아니라 String 객체의 메소드이다. 자바스크립트는 기본형과 객체 타입을 서로 자유롭게 변환한다.

**string 기본형에 charAt과 같은 메서드를 사용할 때, 기본형을 String 객체로 래핑하고 메소드를 호출하고 마지막에 래핑한 객체를 버린다.**

이 String 객체는 오직 자기 자신하고만 동일하다.

객체 래퍼 타입의 자동 변환은 종종 당황스러운 동작을 보인다.

```ts
x = "hello"
x.lanuage = "English"
x.lanuage //undefined
```

String 객체로 변환되었다가 lanuage 속성을 할당하고 객체는 버려진다. 따라서 해당 속성으로 접근해도 undefined가 출력되는 것이다.

이러한 래퍼 타입들 덕분에 기본형 값에 메소드를 사용할 수 있고, 정적 메소드(String.fromCharCode)도 사용할 수 있다. 타입스크립트는 기본형과 객체 래퍼 타입을 별도로 모델링한다.

기본형은 객체 래퍼 타입에 할당될 수 있지만, 객체 래퍼 타입은 기본형에 할당될 수 없다. 객체 래퍼 타입의 할당은 지양해야 한다.

```ts
const getStrLen = (foo: String): number => foo.length
getStrLen("hello") //정상 작동

const isGreeting = (phrase: String) => ["hi", "hello"].includes(phrase)
//타입 체크 에러 발생. includes에 들어가는 인수는 객체 래퍼 타입이 아니라 기본형이여햐함.
```

# 잉여 속성 체크 한계 인지하기

타입이 명시된 변수에 **객체 리터럴을 할당할 때 타입스크립트는 해당 타입의 속성이 있는지 그리고 그외의 속성은 없는지 확인한다.**
덕 타이핑 관점에서 본다면, 타입스크립트의 해당 타입의 속성만 만족시키면 되는데 왜 이런 현상이 발생할까?

```ts
interface Room {
  num: number
  isSuite: boolean
}

const r: Room = {
  num: 10,
  isSuite: false,
  elephant: "present", //타입 체커 오류 발생. Room 형식에 elephant는 존재하지 않음.
}

const r2 = {
  num: 10,
  isSuite: false,
  elephant: "present",
}

const r3: Room = r2 //오류 발생하지 않음.
```

위와 같이 객체 리터럴이 아닌, 임시 변수를 도입하면 구조적 타이핑 관점에서 타입이 할당이 가능한 것을 볼 수 있다.

이러한 시스템이 도입된 이유는 단순히 런타임에 예외를 던지는 코드에 오류를 표시하는 것뿐만 아니라, 의도와 다르게 작성된 코드까지 찾으려고 하기 때문이다. 잉여 속성 체크는 할당 가능 검사와 별도의 과정으로 구조적 타이핑의 개념과 헷갈려서는 안된다.

```ts
interface Options {
  title: string
  darkMode: boolean
}

function createWindow(options: Options) {
  if (options.darkMode) {
    setDarkMode()
  }
}

createWindow({ title: "blahblah", darkmode: true })
//타입 체커 오류 발생. darkMode를 쓰려고 했습니까?
```

위의 코드는 런타임에서 어떠한 오류도 발생시키지 않는다. 하지만 의도한대로 동작하지 않을 수 있다.

Options 타입에는 실제로 무수히 많은 타입이 할당될 수 있다. document 객체도 할당이 가능하다. `title:string`속성이 있기 때문이다. **잉여 속성 체크를 이용하면 기본적으로 타입 시스템의 구조적 본질을 해치지 않으면서 객체 리터럴에 알 수 없는 속성을 허용하지 않음으로써, 앞에 예시에서 다룬 문제를 해결할 수 있다.**

만일 잉여 속성 체크를 원하지 않는다면 인덱스 시그니처를 활용하여 추가적으로 속성이 할당될 수 있음을 명시해주시면 된다.

## 약한 타입

선택적 속성만 가지는 타입을 약한(weak) 타입이라고 한다.

```ts
interface Animal {
  hasLeg?: boolean
  isHerbivores?: boolean
}

const elephant = { isBig: true }
//타입 체크 에러 발생. 공통적인 속성이 없음.
```

구조적인 관점에서 Animal 타입은 모든 속성이 선택적이므로 모든 객체를 포함할 수 있다. 이런 약한 타입에 대해서 타입스크립트는 값 타입과 선언 타입에 공통된 속성이 있는지 확인하는 별도의 체크를 수행한다. 객체 리터럴에만 수행하는 잉여 속성 체크와 다르게 모든 할당문에서 수행된다. 따라서 임시 변수 패턴을 사용하더라도 공통 속성 체크는 여전히 동작한다.

# 함수 표현식에 타입 적용하기

함수를 정의하는 방법은 함수 선언문, 함수 표현식 2가지가 있다. 타입스크립트의 경우 함수 표현식으로 정의하면 좋다. 그 이유는 함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언하여 함수 표현식에 재사용 할 수 있기 때문이다.

```ts
type BinaryFn = (a: number, b: number) => number
const sum: BinaryFn = (a, b) => a + b
const mul: BinaryFn = (a, b) => a * b
const sub: BinaryFn = (a, b) => a - b
```

위의 예제를 통해서, 재사용성과 함수 타입을 매개변수부터 반환값까지 선언했을 때보다 함수 구현부가 분리되어 있어 로직이 보다 분명해진다는 장점이 있다. 따라서 라이브러리는 공통 ㅏㅎㅁ수 시그니처를 타입으로 제공하기도 한다. 예시로 리액트에서 함수의 매개변수에 명시하는 MouseEvent 타입 대신 함수 전체에 적용할 수 있는 MouseEventHandler 타입을 제공한다.

## 시그니처가 일치하는 다른 함수

fetch 함수를 예시로 살펴본다.

```ts
async function getQuote() {
  const response = await fetch("/quote?by=Mark+Twain")
  const qutoe = await response.json()
  return qutoe
}
```

위의 예시에서 만일 /quote가 존재하지 않는 API라면 response.json()은 JSON 형식이 아니라는 요상한 오류 메시지를 담아 거절된 프로미스를 반환한다. 이럴 경우 우리는 왜 거절되었는지 이유를 명확히 알 수 없다. 따라서 상태도 체크해주는 새로운 함수를 정의해본다.

```ts
async function checkedFetch(input: RequestInfo, init: ReuqestInit) {
  const response = await fetch(input, init)
  if (!response.ok) {
    throw new Error(response.status)
  }
  return response
}
```

위의 코드는 아래와 같이 간결하게 고쳐질 수 있다. 함수 표현식에 타입을 적용하면 된다. 다른 함수의 시그니처를 참조하려면 typeof fn을 사용하면 된다.

```ts
const checkedFetchasync: typeof fetch = (input, init) => {
  const response = await fetch(input, init)
  if (!response.ok) {
    throw new Error(response.status)
  }
  return response
}
```

아래와 같이 적용할 경우 `throw new Error(response.status)` 부분을 `return new Error(response.status)`로 변경할 경우 에러도 반환해준다. 반환타입이 fetch와 동일해야하기 떄문이다.

# 타입과 인터페이스의 차이점 알기

타입스크립트에서 명명된 타입을 정의하는 방법은 두 가지있다. `type`(타입 별칭)과 `interface`이다. **대부분의 경우 타입을 사용해도 되고 인터페이스를 사용해도 된다. 하지만 공통점과 차이점을 명확히 이해하고 같은 상황에서는 동일한 방법으로 명명된 타입을 정의해 일관성을 유지해야한다.**

_타입에 I혹은 T를 붙여 어떤 형태로 사용되었는지 알려주는 패턴은 초기에는 종종 사용되었으나 현재는 지양해야 할 스타일이다._

## 공통점

1. 명명된 타입은 어떤 타입으로 정의하던 상태에는 차이가 없다.
2. 인덱스 시그니처는 인터페이스와 타입에서 모두 사용할 수 있다.
3. 함수 타입도 인터페이스나 타입으로 정의할 수 있다.
   ```ts
   type TFn = (x: number) => string
   interface IFn {
     (x: number): string
   }
   ```
4. 제너릭 사용이 가능하다.
5. 클래스를 구현할 때 둘 다 사용할 수 있다.

## 차이점

1. 유니온 타입은 있지만, 유니온 인터페이스라는 개념은 없다.
2. 인터페이스는 타입을 확장(extends)할 수 있지만, 유니온은 할 수 없다.
3. 튜플과 배열 타입도 타입 별칭을 사용하면 간결하게 표현할 수 있다. 인터페이스로도 튜플과 비슷하게 구현할 수 있지만, concat과 같은 메서드를 사용할 수 없다.
4. 인터페이스에는 타입에는 없는 보강(augment)이 가능하다.
   ```ts
   interface IState {
     name: string
     capital: string
   }
   interface IState {
     population: number
   }
   const wyoming: State = {
     name: "Wyoming",
     capital: "Cheyenne",
     population: 500000,
   }
   //정상이다.
   ```
   속성을 확장하는 것을 선언 병합이라고 한다. 선언 병합은 주로 타입 선언 파일에서 사용된다. 따라서 타입 선언 파일을 작성할 때는 선언 병합을 지원하기 위해 반드시 인터페이스를 사용해야 하며 표준을 따라야한다.

## 그렇다면 언제 type, interface를 사용하면 좋을까?

1. 복잡한 타입이라면 타입 별칭을 사용하면 된다.
2. 둘다 표현 가능한 간단한 객체 타입이라면 일관성과 보강의 관점에서 생각해야함.
   - 기존 프로젝트의 룰에 따른다.
   - 어떤 API에 대한 타입 선언을 작성해야 한다면 인터페이스가 좋다. 추후에 보강될 여지가 있기 떄문이다.

# 타입 연산과 제너릭 사용으로 반복 줄이기

코드를 중복하면 안된다. 코드를 중복하면 유지보수 비용이 급격하게 늘어난다. 수정을 할 때 수정이 필요한 요소를 일일이 찾아서 빠짐없이 수정해줘야 하기 때문이다. DRY(Don't Repeat Yourself) 원칙이다.

## 타입 반복을 줄이는 방법들

### 타입에 이름 붙이기

```ts
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return a.x + a.y + b.x + b.y
}

interface Point2D {
  x: number
  y: number
}

function distance(a: Point2D, b: Point2D) {}
```

### 함수가 같은 타입의 시그니처를 가지고 있을 때

[예시](#함수-표현식에-타입-적용하기)

### 인터페이스 확장을 통한 반복 제거

```ts
interface Person {
  firstName: string
  lastName: string
}

interface PersonWithDate {
  firstName: string
  lastName: string
  birth: Date
}

interface PersonWithDate extends Person {
  birth: Date
}

//이미 존재하는 타입을 확장할 경우(일반적이지는 않음.)
type PersonWithDate = Person & { birth: Date }
```

### 한 타입의 부분 집합인 타입

부모 타입을 이용해서 부분 집합 타입을 정의하라.

```ts
interface State {
  userId: string
  pageTitle: string
  recentFiles: string[]
  pageContents: string
}

interface TopNavState {
  userId: State["userId"]
  pageTitle: State["pageTitle"]
  recnetFiles: State["recentFiles"]
}
```

매핑된 타입을 이용하는 방식

```ts
type TopNavState = {
  [k in "userId" | "pageTitle" | "recentFiles"]: State[k]
}
```

매핑된 타입은 배열의 필드를 루프 도는 것과 같은 방식이다 이 패턴은 표준 라이브러리의 Pick 제너릭 타입과 동일하다.

```ts
type TopNavState = Pick<State, "userId" | "pageTitle" | "recentFiles">
```

**생성하고 난 다음에 업데이트가 되는 클래스의 경우, 타입 대부분이 선택적 필드가 된다.**

```ts
interface Options {
  width: number
  height: number
  color: string
  label: string
}

interface OptionsUpdate {
  width?: number
  height?: number
  color?: string
  label?: string
}
```

매핑된 타입과 keyof를 사용하여 중복을 제거

```ts
type OptionsUpdate = { [k in keyof Options]?: Options[k] }
```

매핑된 타입은 순회하며 Options 내 k 값에 해당하는 속성이 있는지 찾는다. 표준 라이브러리의 Partial 제너릭과 동일하다.

```ts
type OptionsUpdate = Partial<Options>
```

### 값 형태에 해당하는 타입을 정의하고 싶을 때

```ts
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: "#00FFD",
  label: "VGA",
}

interface Options {
  width: number
  height: number
  color: string
  label: string
}

type Options = typeof INIT_OPTIONS
```

여기서 typeof는 자바스크립의 연산자 typeof로 사용된 것으로 보이지만, 실제로는 타입스크립트 단계에서 연산되고 정교하게 타입을 표현한다. 값으로부터 타입을 만들어 낼 때 선언의 순서에 주의해야한다. 타입 정의를 먼저하고 값이 그 타입에 할당 가능하다고 선언하는 것이 좋다.

함수나 메소드의 반환 값에 명명된 타입을 만들고 싶을 때

```ts
function getUserInfo(userId: string) {
  //.....
  return {
    userId,
    name,
    age,
    height,
    width,
  }
}

type UserInfo = ReturnType<typeof getUserInfo>
```

ReturnType을 사용할 때 유의해야 할 점은 getUserInfo의 값이 아니라, typeof로 타입을 적용시켰다는 점이다.

### 제너릭 타입에서 매개변수를 제한하고 싶을 때

extends를 사용하면 된다. extends를 사용하면 제너릭 매개변수가 특정 타입을 확장한다고 선언할 수 있다.

```ts
interface Name {
  first: string
  last: string
}

type DancingDuo<T extends Name> = [T, T]

const couple1: DancingDuo<Name> = [
  { first: "Fred", last: "Artster" },
  { first: "Ginager", last: "Rogers" },
]

const couple2: DancingDuo<{ first: string }> = [
  //...,
  //...
]
//{first:string}에는 last 속성이 없어서 오류가 발생한다. extends 구문으로 확장한다고 선언했기 때문에 last가 꼭 필요함.
```

# 동적 데이터에 인덱스 시그니처 사용하기

자바스크립트 객체는 문자열 키를 타입의 값에 관계없이 매핑한다. 타입스크립트에서는 타입에 인덱스 시그니처를 명시하여 유연하게 매핑을 표현할 수 있다.

```ts
type Obj = { [property: string]: string }
```

위와 같은 방식이 인덱스 시그니처이다. 다음 3가지 의미를 담는다.

1. 키의 이름: 키의 위치만 표시하는 용도. 타입 체커에서는 사용되지 않음.
2. 키의 타입: string | number | symbol 조합이지만, 보통은 string 사용
3. 값의 타입: 어떤 값이든 될 수 있음.

## 인덱스 시그니처의 단점

1. 잘못된 키를 포함해 모든 키를 허용한다. 만약 name이라는 속성이 필요한 객체임에도 불구하고 Name이라는 속성을 기입해도 타입 체크 오류가 발생하지 않는다.
2. 특정 키가 필요하지 않다. {}도 인덱스 시그니처 타입이다.
3. 키마다 다른 타입을 가질 수 없다.
4. 타입스크립트 언어 서비스의 기능이 일부 동작하지 않는다. name:을 입력할 때 키는 무엇이든 가능하기 때문에 자동완성안됨.

## 언제 인덱스 시그니처를 사용하고 사용하지 말아야 하는가?

인덱스 시그니처는 부정확하다. 만일 객체의 모든 속성이 string이라서 인덱스 시그니처를 사용한다면 이는 잘못된 것이다. **인덱스 시그니처는 동적 데이터를 표현할 때 사용해야 한다.**

예시로 CSV 파일처럼 헤더 행에 열 이름이 있고, 데이터 행을 열 이름과 값으로 매핑하는 객체로 나타내고 싶은 경우이다.

_declare 키워드는 컴파일러에게 해당 변수나 함수가 이미 존재한다고 알리는 역할을 한다._

**어떤 타입에 가능한 필드가 제한되어 있는 경우라면 인덱스 시그니처로 모델링하면 안된다.**

만일 객체에 a,b,c,d와 같은 키가 있지만 얼마나 많이 있는지 모른다면 선택적 필드 또는 유니온 타입으로 모델링 해야한다.

```ts
interface Row1 {
  [column: string]: number
}
interface Row2 {
  a: number
  b?: number
  c?: number
  d?: number
}
type Row3 =
  | { a: number }
  | { a: number; b: number }
  | { a: number; b: number; c: number }
  | { a: number; b: number; c: number; d: number }
```

마지막 Row3의 방식의 경우 정확하지만, 사용하기에는 조금 번거롭다.
우리는 2가지 옵션이 존재한다.

1. Record 제너릭 타입 사용

   - 키 타입에 유연성을 제공하는 제너릭 타입이다.

   ```ts
   type Vec3D = Record<'x' | 'y' | 'z', number>
   <!-- Vec3D = {
     x: number
     y:number
     z:number
   } -->
   ```

2. 매핑된 타입 사용
   ```ts
   type Vec3D = { [k in "x" | "y" | "z"]: number }
   type ABC = { [k in "a" | "b" | "c"]: k extends "b" ? string : number }
   // ABC = {
   //   a:number
   //   b:string
   //   c: number
   // }
   ```

# number 인덱스 시그니처보다는 Array, 튜플, ArrayLike 사용하기

자바스크립트의 객체는 문자열을 키값으로 사용한다. 만일 문자열이 아닌 것을 키값으로 할당하면 .toString 메소드를 사용하여 문자열로 변환된다.

```ts
x = {}
x[[1, 2, 3]] = 2
//x: '1,2,3' = 2
//[1,2,3]이 toString으로 문자열로 변환됨.
```

자바스크립트에서 배열은 객체이다. 배열에서 인덱스에 접근하기 위해서 숫자로 된 키를 사용하지만, 내부에서 문자열로 변환되어 사용된다.

```ts
const arr = [1, 2, 3]
arr[0] // 1
arr["0"] //1
```

타입스크립트는 이러한 혼란을 막기위해 숫자 키를 허용하고, 문자열 키와는 다른 것으로 인식한다.

인덱스 시그니처에 number를 사용하기 보다는 Array나 튜플, 또는 ArrayLike 타입을 사용하는 것이 좋다.

# 변경 관련된 오류 방지를 위해 readonly 사용하기

함수가 매개변수를 수정하지 않는다면, readonly로 설정하는 것이 좋다. 매개변수의 비의도적인 변경을 방지할 수 있다.

readonly는 얕게 동작한다. 깊게 동작을 원한다면 ts-essentials에 있는 DeepReadonly 제네릭을 사용하면 된다.

# 매핑된 타입을 사용하여 값 동기화하기.

매핑된 타입을 사용해서 관련된 값과 타입을 동기화 할 수 있다.

만일 이전 객체와 현재 객체를 비교하여 다르다면 업데이트를 수행해야 하는 상황인데, 효율성을 위해서 특정 속성의 차이만 비교한다고 해보자. 그렇다면 속성이 추가될 때마다 해당 속성이 특정 속성에 해당하는지 안하는지 코드를 작성해줘야 할 것이다. 매핑된 타입을 사용하면, 타입 시스템을 활용하여 안전하게 유지보수 할 수 있다.

```ts
interface ScatterProps {
  xs: number[]
  ys: number[]
  xRange: [number, number]
  yRange: [number, number]
  color: string
  onClick: (x: number, y: number, index: number) => void
}

const REQUIRES_UPDATE: { [k in keyof ScatterProps]: boolean } = {
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: true,
}

function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  let k: keyof ScatterProps
  for (k in oldProps) {
    if (oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
      return true
    }
  }
  return false
}
```

이후에 만일 ScatterProps에 어떤 속성이 추가된다면, REQUIRES_UPDATE 해당 속성이 없다고 타입 시스템에 오류가 발생할 것이다.
