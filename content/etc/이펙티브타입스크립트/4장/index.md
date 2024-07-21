---
title: 이펙티브 타입스크립트 4장
date: 2022-12-01
description: 타입 설계
---

# 유효한 상태만 표현하는 타입을 지향하기

유효한 상태만 표현한다는 것의 의미가 무엇일까. 유효하지 않은 상태가 있음으로써 버그가 생기는 것이라고 할 수 있을 것 같다.
예시를 통해서 이해해보도록 하자.

api를 호출하고 비동기적으로 데이터를 받아옴으로써 페이지의 상태를 다음과 같이 표현할 수 있다.

```ts
interface State {
  data?: string
  isLoading: boolean
  error?: string
}
```

위와 같은 상태 설계는 유효하지 않은 상태가 존재함으로 버그가 생길 수 있다.
유효하지 않은 상태는 isLoading이 true이고, error 값이 존재한다면 로딩중인지, 에러인지 파악할 수 없다.

위의 설계 오류를 아래와 같이 수정할 수 있다.

```ts
interface RequestPending {
  state: "pending"
}

interface RequestError {
  state: "error"
  error: string
}

interface RequestSuccess {
  state: "success"
  data: string
}

type RequestState = Requestpending | RequestError | RequestSuccess
```

RequestState를 위와 같이 정의할 경우, state에 따라서 error 속성과 data 속성의 여부가 변경되기 때문에 유효하지 않은 상태를 가지지 않는다.

```ts
interface RequestState {
  state: "pending" | "error" | "success"
  error?: string
  data?: string
}
```

위와 같이 정의할 경우, 유효하지 않은 error와 data가 생길 수 있기 때문에 옳지 않다.

유효하지 않은 상태가 존재하지 않도록 타입을 정의하고, 어떠한 속성의 값에 따라 상태가 변하는 경우 유니온 속성을 이용하여 깔끔하게 분기처리를 해야한다.

# 사용할 때는 너그럽게, 생성할 때는 엄격하게

> 포스텔의 법칙: 당신의 작업은 엄격하게 하고, 다른 사람의 작업은 너그럽게 받아들여야 한다.

함수도 마찬가지이다. 매개변수의 타입의 범위는 넓어도 되지만, 결과를 반환할 때는 타입의 범위가 더 구체적이여야 한다.

결과를 반환하는 값의 타입의 범위가 좁아야 되는 이유는 타입의 범위가 좁아야 함수를 호출부에서 사용이 편리하기 때문이다.

```ts
interface Argument {
  a: { x: number; y: number } | { x: number; y: number; z: number }
}

interface Return {
  ans:
    | { a: number; b: number }
    | { a: number; c: number }
    | { a: number; d: number }
}

declare function returnVariousType(arg: Argument): Return

function someFunc() {
  const { c } = returnVariousType({ x: 3, y: 3 })
}
```

위의 예제에서 someFunc의 c의 경우 undefined가 될 수 있다. 따라서 분기 처리를 통해 c가 존재한다는 있는 것을 확인해주거나, 리턴값에 속성 타입을 명시하여 분기 처리를 해주어야한다.
정리하자면, 함수를 호출하는 부분에서 사용이 매우 불편하다..!
다만 매개변수의 타입은 보다 넓게 설정해주어 함수를 호출할 때 편리함을 증가시켜줄 수 있다.

# 문서에 타입 정보 쓰지 않기.

주석으로 타입 정보를 선언해주면, 코드를 수정할 때마다 주석도 수정해주어야 한다. 실무에서 동기화가 안될 떄가 많다. 하지만 타입 시스템은 자동으로 동기화된다.

또한 타입스크립트는 간결하고, 구체적이며, 읽기 편하게 설계되어 있어 굳이 주석이 필요하지 않다.

변수명을 지을 때도 타입의 단위를 가지고 있다면 굳이 변수명에 넣지 않아도 좋다. 하지만 단위가 무엇인지 확실하지 않다면 변수명에 표현해줘도 좋다. 전자의 예시로는 ageNum, 후자의 예시로는 temperatureC 등이 있다.

# 타입 주변에 null을 배치하기.

한 값의 null이 다른 값의 null에 영향을 미치도록 설계하면 안된다.
그 이유는 한 값이 null일 때, 아닐 때. 다른 값이 null일 때, 아닐 때 4가지 경우가 생성되기 때문이다. 여러가지 경우의 수가 생긴다. 사용부에서 많은 경우의 수에 대한 분기 처리가 필요하게 되고 가독성 있게 표현하기 힘들어 코드가 복잡하고 읽기 힘들게 된다.

두 값을 하나의 객체로 정의하고 null 혹은 값을 가지는 상태로 정의한다면 위와 같은 오류를 피할 수 있다.

## 함수의 관점

```ts
function extent(nums: number[]) {
  let min, max
  for (let num of nums) {
    if (!min) {
      min = num
      max = num
    } else {
      min = Math.min(min, num)
      max = Math.max(max, num)
    }
  }
}
```

strickCheckNull을 키고 다음 함수를 호출한다면, max값에 대해서 오류가 발생할 것이다. 초기 null인 max값에 대해서 값의 대입은 이루어졌지만, 타입 시스템의 검증은 수행되지 않았다. if문에서 min에 대한 체크만 이루어졌기 때문에 max 값은 undefined 혹은 number의 타입을 가지게 된다. number의 타입을 기대하고 함수를 사용했다면 곤란한 상황에 처하게 된다.
또한 js의 특성상 min이 0일 경우, if(!min)의 분기 처리의 로직을 실행하기 때문에 원하는 최솟값과 최댓값이 나오지 않을 수 있다.

이 때 max에 대한 분기도 넣어줄 수 있지만, 이는 함수의 구현을 복잡하게 할 뿐만 아니라 추가적인 요청사항이 들어올 경우 에러가 발생할 확률을 높인다.

min과 max를 하나의 객체로 관리하고, 값의 대입이 이루어졌다면 null이 아니도록 처리해주면 위와 같은 문제를 피할 수 있다.

```ts
function extent(nums: number[]) {
  const results: { min: number; max: number } | null = null

  for (let num of nums) {
    if (!results) {
      results = [num, num]
    } else {
      results.max = Math.max(results.max, num)
      results.min = Math.min(results.min, num)
    }
  }
}
```

위의 경우 min과 max값이 둘다 null로 묶여 있어서 null 체크를 한번만 해주면 min,max값을 사용할 수 있다.

```ts
function extent(nums: number[]) {
  return { min: Math.min(...nums), max: Math.max(...nums) }
}
```

```ts
function extent(nums: number[]) {
  let min = nums[0]
  let max = nums[0]
  //... 이하는 아래와 같다.
}
```

위의 2개 함수는 사실 null check가 필요없는 content 함수이다. 2번째 함수의 경우 함수의 초기값을 인자의 첫 번째 요소로 초기화 시켜주어 다른 타입을 가질 가능성을 막아버렸다.

## 클래스의 관점

클래스의 경우 초기값(null)을 가지고 메소드에 따라서 값이 변화한다고 한다면, 다른 메소드에서 null 체크가 매번 일어나야 하고, 경우의 수가 생기기 때문에 코드가 복잡해진다.
클래스의 경우 값을 정확히 가질 때 인스턴스를 정의할 수 있도록 함으로써 null 분기에 필요한 로직을 걷어낼 수 있다. 데이터가 부분적으로 준비한 경우를 다루어야 한다면 null과 관련된 부분을 다룰 수 밖에 없긴하다.

# 유니온의 인터페이스보다는 인터페이스의 유니온을 사용하기

유니온 타입의 속성을 가지는 인터페이스를 작성 중이라면, 인터페이스의 유니온 타입을 사용하는 게 더 알맞지는 않을지 검토해봐야 한다.

그 이유는 유니온 타입에 따른 조합이 생겨 다양한 경우의 수가 생기기 때문이다.

벡터를 그리는 프로그램을 작성중이고, 특정한 기하학적 타입을 가지는 계층의 인터페이스를 정의한다고 가정해보도록 하자.

```ts
interface Layer {
  layout: FillLayout | LineLayout | PointLayout
  paint: FillPaint | LinePaint | PointPaint
}
```

위의 경우 layout은 LineLayout을 가지고, paint의 경우 PointPaint를 가지는 상태는 말이 안될 것이다. 위의 같은 경우 인터페이스의 유니온을 사용하여 처리해야한다. 태그된 유니온 방식은 타입스크립트의 타입 체커 시스템과 매우 잘맞기 때문에 해당 방식으로 표현할 수 있다면 사용하는 편이 좋다.

```ts
interface FillLayer {
  type: "fill"
  layout: FillLayout
  paint: FillPaint
}

interface LineLayer {
  type: "line"
  layout: LineLayout
  paint: LinePaint
}

interface PointLayer {
  type: "point"
  layout: PointLayout
  paint: PointPaint
}

type Layer = FillLayer | LineLayer | PointLayer
```

어떠한 2개의 속성이 있고 둘다 같이 존재하거나, 같이 존재하지 않는 상태라고 가정한다면 이전 아이템에서 배운 타입 주변에 null 배치하기 방식을 이용하면 좋다. 2개의 속성을 하나(객체)로 묶는 것이다.

```ts
interface Person {
  name: string
  placeOfBirth?: string
  dateOfBirth?: Date
}

interface Person {
  name: string
  birth?: {
    place: string
    date: Date
  }
}
```

# string 타입보다 더 구체적인 타입 사용하기

string 타입보다 구체적인 타입을 사용해야 하는 이유는 string 타입이 너무 크기 때문이다. 한 글자를 가지던 1만 글자를 가진 문장이던 같은 string 타입이다.

구체적으로 살펴봤을 때 string 타입보다 구체적인 타입을 사용해야 하는 이유는 3가지이다.

1. 타입을 명시적으로 정의함으로써, 다른 곳으로 값이 전달되어도 타입 정보가 유지된다.

   - 예시로 다른 함수의 인수의 타입으로 사용될 수 있다. 어떤 배열 내 객체의 속성의 특정한 값을 만족하는 요소를 추출하는 함수를 작성한다고 하였을 떄, 해당 함수의 인자로 타입을 이용하면 좋다. (타입이 변경되었을 떄도 유지보수가 편리하다.)

2. 타입을 명시적으로 정의하고 해당 타입의 의미를 설명하는 주석을 붙여넣을 수 있다.
3. keyof 연산자로 더욱 세밀하게 객체의 속성 체크가 가능하다. (이 부분이 여기에 왜 있는지는 잘 모르겠다.)

   ```ts
   interface Albums {
     recordType: "studio" | "live"
     name: string
     releaseDate: Date
     follower: number
   }

   const albums: Albums[] = [
     {
       recordType: "studio",
       name: "a",
       releaseDate: new Date("2022-10-11"),
       follower: 200,
     },
     {
       recordType: "live",
       name: "b",
       releaseDate: new Date("2022-10-12"),
       follower: 300,
     },
     {
       recordType: "studio",
       name: "c",
       releaseDate: new Date("2022-10-13"),
       follower: 400,
     },
   ]

   function pluck(arr, key) {
     return arr.map(v => v[key])
   }
   const dates1 = pluck(albums, "releaseDate")
   //dates1은 any[] 타입을 가진다. 또한 pluck 함수의 두 번째 인수도 첫 번쨰 인수가 보유한 속성값이 언어 서비스에 드러나지 않는다.

   function pluck2<T>(arr: T[], key: keyof T) {
     return arr.map(v => v[key])
   }

   const dates2 = pluck2(albums, "releaseDate")
   //dates2 타입은 (string | Date | number)[]이다. 두 번쨰 인수의 경우 첫 번쨰 인수가 보유한 속성값이 언어 서비스에 드러난다.
   //albums의 속성이 가질 수 있는 모든 타입을 가진다. 원활한 사용을 위해서는 타입을 더 좁혀야한다.

   function pluck3<T, K extends keyof T>(arr: T[], key: K) {
     return arr.map(v => v[key])
   }
   //keyof T의 범위를 더욱 좁혀야 한다. keyof T의 부분 집합으로 두 번째 매개변수를 도입한다.

   const dates3 = pluck3(albums, "releaseDate")
   //dates3의 타입은 Date[]이다. 언어 서비스를 이용하며 명확하게 좁혀진 타입의 결과를 얻어낼 수 있다.
   ```

# 부정확한 타입보다는 미완성 타입을 사용하기

타입의 선언의 정밀도를 높이는 일에는 주의를 기울여야 한다. 실수가 발생할 수 있고 잘못된 타입은 있는 것 보다 못하기 때문이다.

```ts
interface Geometry {
  coordinate: number[] | number[][] | number[][][]
}
```

위와 같은 코드에서 coordinate가 위도, 경도로 이루어져있다고 생각하고 타입이 너무 크다고 판단하여 [number, number] 타입으로 변형하였다. 기존에 고도라는 개념이 있어 number[]라고 표현이 되어있던 것이고, 모든 코드에 오류가 발생하게 된다.

타입을 정교하게 만들어서 부정확함을 바로잡는 방법 대신 테스트를 추가하여 놓친 부분이 없는지 확인하는 방식을 사용해도 좋다. 타입을 정제할 때, 볼쾌한 골짜기 은유를 생각해보면 도움이 될 수 있다.

# 데이터가 아닌 API와 명세를 보고 타입 만들기

API 명세서를 읽어보지 않고 데이터만을 받아서 타입을 작성했을 때 예상치않은 오류가 발생할 수 있다.
API 명세서를 참고해서 타입을 만들거나, 공식 타입 선언을 다운로드 받아서 사용하면 좋다.

# 해당 분야의 용어로 타입 이름 짓기

해당 분야의 용어는 몇십년에 지나면서 다듬어져 왔다. 가독성을 더 높여준다.

또한 이미 체계적으로 분류가 잡혀져 있는 경우가 있다. 기후라는 타입을 정의하기 위해서는 미리 정의된 쾨펜 기후 분류 등을 사용하면 편리하고 유지보수에 용이하다.
유지보수에 용이한 이유는 코드를 작성한 사람에게 조언을 구할 필요가 없기 때문이다.

동일한 의미를 나타날 때는 꼭 같은 단어를 사용해야한다.

# 공식 명칭에는 상표 붙이기

구조적 타이핑의 특성 때문에 가끔 코드가 이상한 결과를 낼 수 있다.

```ts
interface Vector2D {
  x: number
  y: number
}

function calculateNorm(p: Vector2D) {
  return Math.sqrt(p.x * p.x + p.y * p.y)
}

const vector3D = { x: 1, y: 2, z: 5 }
calculateNorm(vector3D)
```

위의 코드는 구조적 타이핑 관점에서 오류가 발생하지 않는다. 하지만 수학적으로 따지면 2차원 벡터를 사용하는 것이 이치에 맞다.
3차원 벡터를 허용하지 않게 하려면 공식 명칭을 사용하면 된다.
값의 관점에서 vector2D라고 정의해주는 것이다. 타입스크립트에서 흉내내기 위해서는 상표를 붙이면 된다.

```ts
interface Vector2D {
  _brand: "2d"
  x: number
  y: number
}

calculateNorm({ x: 1, y: 2, _brand: "2d" }) //1
calculateNorm({ x: 1, y: 2, z: 5, _brand: "2d" }) //2
```

2번째 함수 호출부에서 처럼 악의적으로 공식 명칭을 흉내내는 것을 방지하지는 못한다. 다만 프로그래머에게 실수를 알려주기에는 충분하다.

상표 기법은 타입 시스템에서 동작하지만 런타임에 상표를 검사하는 것과 동일한 효과를 얻을 수 있다. 타입 시스템으로 런타임 오버헤드가 없고 속성이 없는 string 또는 number와 같은 내장 타입도 상표화 할 수 있다.

절대 경로를 이용하여 파일 시스템에 접근하는 함수를 통해서 가정해보자.
런타임에는 절대 경로로 시작하는지 체크하기가 쉽지만, 타입 시스템에서는 판단하기 어렵기 때문에 상표 기법을 사용한다.

```ts
type AbsolutePath = string & { _brand: "abs" }
function listAbsolutePath(path: AbsolutePath) {}
function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith("/")
}
```

AbsolutePath 타입의 경우 string이면서 \_brand 속성을 가지는 객체라는게 애초에 말이 안된다. 온전히 타입 시스템의 영역이다.

만일 절대경로인지, 상대경로인지 확실하지 않다면 타입 가드를 사용해서 오류를 방지할 수 있다.

```ts
function someFunc(path: string) {
  if (isAbsolutePath(path)) {
    listAbsolutePath(path)
  }
}
```

로직 분기 대신 타입 단언문을 사용해도 되지만, 타입 단언문은 사용을 지양해야한다.

추가적인 예시로는 오름차순으로 정렬된 배열인지 체크하는 타입이다.

```ts
type SortedList<T> = T[] & { _brand: "sorted" }
function isSorted<T>(arr: T[]): arr is SortedList<T> {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false
  }
  return false
}

function binarySearch<T>(arr: SortedList<T>, target: number): number {
  //....
}
```
